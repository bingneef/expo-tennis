import DataLoader from 'dataloader'
import mongoose from '../services/database/mongodb'
const Schema = mongoose.Schema
import mapResponse from '../services/graphql/mapResponse'

const SeasonSchema = new Schema({
  externalId: String,
  tournamentId: String,
  name: String,
  startDate: Date,
  endDate: Date,
  year: Number,
})

class SeasonClass { }

SeasonSchema.loadClass(SeasonClass);

export const Season = mongoose.model('Season', SeasonSchema)

export const SeasonLoader = new DataLoader(ids => batchGetSeasonsById(ids))

const batchGetSeasonsById = ids => {
  return new Promise(async (resolve, reject) => {
    const seasons = await Season.find({ _id: { $in: ids.map(id => mongoose.Types.ObjectId(id)) } })

    // Only because we know ids is unique
    if (seasons.length == ids.length) {
      resolve(seasons)
    }
    const response = mapResponse(ids, 'id', seasons)
    resolve(response)
  })
}
