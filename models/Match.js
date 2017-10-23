import DataLoader from 'dataloader'
import mongoose from '../services/database/mongodb'
const Schema = mongoose.Schema
import mapResponse from '../services/graphql/mapResponse'
import { Player } from './Player'
import _ from 'lodash'
import pubsub from '../services/graphql/pubsub'

export const MatchSchema = new Schema({
  round: {
    kind: String,
    name: String,
  },
  venue: {
    name: String,
  },
  homePlayer: {
    id: String,
    fullName: String,
  },
  awayPlayer: {
    id: String,
    fullName: String,
  },
  score: {
    sets: [{
      status: {
        type: String,
        enum : ['PROGRESS', 'HOME_WINNER', 'AWAY_WINNER'],
        default: 'PROGRESS'
      },
      games: [{
        status: {
          type: String,
          enum : ['PROGRESS', 'HOME_WINNER', 'AWAY_WINNER'],
          default: 'PROGRESS'
        },
        points: [{
          status: {
            type: String,
            enum : [null, 'HOME_WINNER', 'AWAY_WINNER'],
            default: null
          },
          kind: {
            type: String,
            enum : [null, 'WINNER', 'UNFORCED_ERROR', 'FORCED_ERROR', 'ACE','DOUBLE_FAULT'],
            default: null,
          },
          wing: {
            type: String,
            enum : [null, 'FOREHAND', 'BACKHAND', 'VOLLEY', 'OVERHEAD'],
            default: null,
          },
          home: Boolean,
        }],
      }],
    }],
  },
  status: {
    type: String,
    enum : ['PLANNED', 'PROGRESS', 'HOME_WINNER', 'AWAY_WINNER'],
    default: 'PLANNED'
  },
})

class MatchClass {
  get currentScore () {
    return {
      status: this.status,
      currentSets: {
        home: this.score.sets.filter(set => set.status == 'HOME_WINNER').length,
        away: this.score.sets.filter(set => set.status == 'AWAY_WINNER').length,
      },
      completedSetScores: this.score.sets.filter(set => set.status != 'PROGRESS').map(set => {
        return {
          home: (set.games || []).filter(game => game.status == 'HOME_WINNER').length,
          away: (set.games || []).filter(game => game.status == 'AWAY_WINNER').length,
        }
      }),
      currentSetGames: {
        home: (this.activeSet.games || []).filter(set => set.status == 'HOME_WINNER').length,
        away: (this.activeSet.games || []).filter(set => set.status == 'AWAY_WINNER').length,
      },
      currentGamePoints: {
        home: (this.activeGame.points || []).filter(set => set.status == 'HOME_WINNER').length,
        away: (this.activeGame.points || []).filter(set => set.status == 'AWAY_WINNER').length,
      },
    }
  }

  get activeSet () {
    try {
      return this.score.sets.filter(set => set.status == 'PROGRESS')[0] || {}
    } catch (e) {
      return {}
    }
  }

  get activeGame () {
    try {
      return this.activeSet.games.filter(game => game.status == 'PROGRESS')[0] || {}
    } catch (e) {
      return {}
    }
  }

  async addPoint (point) {
    if (this.status !== 'PROGRESS') {
      return
    }

    pubsub.publish('pointAdded', { pointAdded: { event: point, match: this }})

    this.activeGame.points = [...this.activeGame.points, point]
    const homePoints = this.activeGame.points.filter(point => point.status == 'HOME_WINNER').length
    const awayPoints = this.activeGame.points.filter(point => point.status == 'AWAY_WINNER').length

    // Check if end of game and propagate
    if (homePoints >= 4 && homePoints - awayPoints >= 2) {
      this.activeGame.status = 'HOME_WINNER'
      this.addGame('HOME_WINNER')
    } else if (awayPoints >= 4 && awayPoints - homePoints >= 2) {
      this.activeGame.status = 'AWAY_WINNER'
      this.addGame('AWAY_WINNER')
    }

    await this.save()
  }

  async addGame (status) {
    const homeGames = this.activeSet.games.filter(game => game.status == 'HOME_WINNER').length
    const awayGames = this.activeSet.games.filter(game => game.status == 'AWAY_WINNER').length

    // Check if end of set
    if (homeGames == 7 || homeGames == 6 && homeGames - awayGames >= 2) {
      this.activeSet.status = 'HOME_WINNER'
      this.addSet('HOME_WINNER')
    } else if (awayGames == 7 || awayGames == 6 && awayGames - homeGames >= 2) {
      this.activeSet.status = 'AWAY_WINNER'
      this.addSet('AWAY_WINNER')
    } else if (this.status == 'PROGRESS') {
      this.activeSet.games.push({status: 'PROGRESS', points: []})
    }
  }

  async addSet (status) {
    const homeSets = this.score.sets.filter(set => set.status == 'HOME_WINNER').length
    const awaySets = this.score.sets.filter(set => set.status == 'AWAY_WINNER').length

    if (homeSets == 2) {
      this.status = 'HOME_WINNER'
    } else if (awaySets == 2) {
      this.status = 'AWAY_WINNER'
    } else if (this.status == 'PROGRESS') {
      this.score.sets.push({status: 'PROGRESS', games: [{points: []}]})
    }
  }
}

MatchSchema.loadClass(MatchClass)
export const Match = mongoose.model('Match', MatchSchema)

export const MatchLoader = new DataLoader(ids => batchGetMatchsById(ids))

const batchGetMatchsById = ids => {
  return new Promise(async (resolve, reject) => {
    const matches = await Match.find({ _id: ids })

    // Only because we know ids is unique
    if (matches.length == ids.length) {
      resolve(matches)
    }
    const response = mapResponse(ids, 'id', matches)
    resolve(response)
  })
}
