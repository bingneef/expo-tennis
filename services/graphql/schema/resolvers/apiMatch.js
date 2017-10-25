import pubsub from '../../pubsub'
import { withFilter } from 'graphql-subscriptions'
import { Match } from '../../../../models/ApiMatch'
import { Tournament } from '../../../../models/Tournament'
import { Season } from '../../../../models/Season'
import mongoose from 'mongoose'

export default {
  Query: {
    apiMatchById: async ({ ctx }, { matchId }) => await ctx.dataLoaders.match.load(matchId),
    apiMatches: async (root, { tournamentId }) => {
      return await Match.find({tournamentId}).limit(10)
    },
    apiTournaments: async (root) => {
      return await Tournament.find().sort('name')
    }
  },
  ApiMatch: {
    tournament: async (match, _, __, { rootValue }) => {
      if (!match.tournamentId || !mongoose.Types.ObjectId.isValid(match.tournamentId)) {
        return {}
      }

      try {
        return await rootValue.ctx.dataLoaders.tournament.load(match.tournamentId)
      } catch (e) { return {} }
    },
    season: async (match, _, __, { rootValue }) => {
      if (!match.seasonId || !mongoose.Types.ObjectId.isValid(match.seasonId)) {
        return {}
      }

      try {
        return await rootValue.ctx.dataLoaders.season.load(match.seasonId)
      } catch (e) { return {} }
    },
  },
}
