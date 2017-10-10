import DataLoader from 'dataloader'
import mongoose from './../services/database/mongodb'
const Schema = mongoose.Schema
import mapResponse from './../services/graphql/mapResponse'

export const PlayerSchema = new Schema({
  firstName: String,
  lastName: String,
  country: String,
})

class PlayerClass {
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}

PlayerSchema.loadClass(PlayerClass);

export const Player = mongoose.model('Player', PlayerSchema)

export const PlayerLoader = new DataLoader(ids => batchGetPlayersById(ids))

const batchGetPlayersById = ids => {
  return new Promise(async (resolve, reject) => {
    const players = await Player.find({ id }).select('firstName lastName country')

    // Only because we know ids is unique
    if (players.length == ids.length) {
      resolve(players)
    }
    const response = mapResponse(ids, 'id', players)
    resolve(response)
  })
}
