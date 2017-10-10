import pubsub from './../../pubsub'
import { withFilter } from 'graphql-subscriptions'
import { Match, MatchLoader} from './../../../../models/Match'

export default {
  Query: {
    matchById: async (root, { matchId }) => {
      return await MatchLoader.load(matchId)
    },
    matches: async (root, { archived }) => {
      let query = {}
      let finishedValues = ['HOME_WINNER', 'AWAY_WINNER']
      if (archived) {
        return await Match.find()
                          .where({ status: { $in: finishedValues } })
      }
      return await Match.find()
    }
  },
  Mutation: {
    addPoint: async (root, { matchId, status, kind, wing }) => {
      const match = await MatchLoader.load(matchId)
      await match.addPoint({
        status,
        kind,
        wing,
      })
      return match
    }
  },
  Subscription: {
    pointAdded: {
      subscribe:
        withFilter(
          () => pubsub.asyncIterator('pointAdded'),
          (payload, variables) => payload.pointAdded.match._id == variables.matchId
        )
    },
    gameAdded: {
      subscribe:
        withFilter(
          () => pubsub.asyncIterator('gameAdded'),
          (payload, variables) => payload.gameAdded.match._id == variables.matchId
        )
    },
    setAdded: {
      subscribe:
        withFilter(
          () => pubsub.asyncIterator('setAdded'),
          (payload, variables) => payload.match._id == variables.matchId
        )
    },
    matchCompleted: {
      subscribe:
        withFilter(
          () => pubsub.asyncIterator('matchCompleted'),
          (payload, variables) => payload.match._id == variables.matchId
        )
    },
  },
  Match: {
    currentScore: async (match) => match.currentScore
  },
}
