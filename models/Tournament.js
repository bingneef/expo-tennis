import DataLoader from 'dataloader'
import mongoose from '../services/database/mongodb'
const Schema = mongoose.Schema
import mapResponse from '../services/graphql/mapResponse'

const CategorySchema = new Schema({
  externalId: {
    type: String,
    index: true,
  },
  name: String,
})

const SportSchema = new Schema({
  externalId: {
    type: String,
    index: true,
  },
  name: String,
})

export const TournamentSchema = new Schema({
  externalId: {
    type: String,
    index: true,
  },
  name: String,
  category: CategorySchema,
  sport: SportSchema,
  kind: {
    type: String,
    enum : ['singles', 'doubles'],
  },
  gender: {
    type: String,
    enum : ['men', 'women'],
    default: 'men'
  },
})

class TournamentClass { }

TournamentSchema.loadClass(TournamentClass);

export const Tournament = mongoose.model('Tournament', TournamentSchema)

export const batchGetTournamentsById = ids => {
  return new Promise(async (resolve, reject) => {
    const tournaments = await Tournament.find({ _id: { $in: ids.map(id => mongoose.Types.ObjectId(id)) } })

    // Only because we know ids is unique
    if (tournaments.length == ids.length) {
      resolve(tournaments)
    }
    const response = mapResponse(ids, 'id', tournaments)
    resolve(response)
  })
}
