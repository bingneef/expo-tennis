import pubsub from '../../pubsub'
import { withFilter } from 'graphql-subscriptions'
import { Match, MatchLoader} from '../../../../models/ApiMatch'
import { Tournament, TournamentLoader} from '../../../../models/Tournament'
import { Season, SeasonLoader} from '../../../../models/Season'
import mongoose from 'mongoose'

export default {
  Query: {
    apiMatchById: async (root, { matchId }) => await MatchLoader.load(matchId),
    apiMatches: async (root, { tournamentId }) => {
      return await Match.find({tournamentId}).limit(10)
    },
    apiTournaments: async (root) => {
      return await Tournament.find().sort('name')
    }
  },
  ApiMatch: {
    tournament: async (match) => {
      if (!match.tournamentId || !mongoose.Types.ObjectId.isValid(match.tournamentId)) {
        return {}
      }

      try {
        return await TournamentLoader.load(match.tournamentId)
      } catch (e) { return {} }
    },
    season: async (match) => {
      if (!match.seasonId || !mongoose.Types.ObjectId.isValid(match.seasonId)) {
        return {}
      }

      try {
        return await SeasonLoader.load(match.seasonId)
      } catch (e) { return {} }
    },
  },
}
