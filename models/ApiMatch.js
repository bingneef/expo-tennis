import DataLoader from 'dataloader'
import mongoose from '../services/database/mongodb'
const Schema = mongoose.Schema
import mapResponse from '../services/graphql/mapResponse'

const VenueSchema = new Schema({
  externalId: String,
  name: String,
  cityName: String,
  countryName: String,
  countryCode: String,
})

const CompetitorsSchema = new Schema({
  externalId: String,
  name: String,
  abbreviation: String,
  team: {
    type: String,
    enum : ['home', 'away'],
  },
  nationality: String,
  countryCode: String,
})

const PeriodScoreSchema = new Schema({
  homeScore: Number,
  awayScore: Number,
  number: Number,
})

const RoundSchema = new Schema({
  kind: String,
  name: String,
})

const MatchSchema = new Schema({
  externalId: String,
  seasonId: String,
  tournamentId: String,
  sportId: String,
  scheduled: Date,
  status: String,
  matchStatus: String,
  homeScore: Number,
  awayScore: Number,
  winnerId: String,
  periodScores: [PeriodScoreSchema],
  competitors: [CompetitorsSchema],
  round: RoundSchema,
  venue: VenueSchema,
})

class MatchClass { }

MatchSchema.loadClass(MatchClass);

export const Match = mongoose.model('ApiMatch', MatchSchema)

export const batchGetMatchesById = ids => {
  return new Promise(async (resolve, reject) => {
    try {
      const matches = await Match.find({ _id: { $in: ids.map(id => mongoose.Types.ObjectId(id)) } })

      // Only because we know ids is unique
      if (matches.length == ids.length) {
        resolve(matches)
      }
      const response = mapResponse(ids, 'id', matches)
      resolve(response)
    } catch (e) {
      reject(e)
    }
  })
}
