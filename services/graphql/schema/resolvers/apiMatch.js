import pubsub from '../../pubsub'
import { withFilter } from 'graphql-subscriptions'
import { Match, MatchLoader} from '../../../../models/ApiMatch'
import { Tournament, TournamentLoader} from '../../../../models/Tournament'
import { Season, SeasonLoader} from '../../../../models/Season'

export default {
  Query: {
    apiMatchById: async (root, { matchId }) => await MatchLoader.load(matchId),
    apiMatches: async (root, { archived }) => {
      let query = {}
      if (archived) {
        return await Match.find()
                          .where({ status: 'closed' })
                          .limit(10)
      }

      return await Match.find().limit(10)
    }
  },
  ApiMatch: {
    tournament: async (match) => await TournamentLoader.load(match.tournamentId),
    season: async (match) => await SeasonLoader.load(match.seasonId)
  },
}
