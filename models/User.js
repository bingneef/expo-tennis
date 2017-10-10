import DataLoader from 'dataloader'
import mongoose from './../services/database/mongodb'
const Schema = mongoose.Schema
import mapResponse from './../services/graphql/mapResponse'

export const UserSchema = new Schema({
  username: String,
  token: {
    type: String,
    unique: true,
  }
})

export const User = mongoose.model('User', UserSchema)

export const UserLoader = new DataLoader(tokens => batchGetUsersByToken(tokens))

const batchGetUsersByToken = tokens => {
  return new Promise(async (resolve, reject) => {
    const users = await User.find({ token: tokens }).select('username token')

    // Only because we know tokens is unique
    if (users.length == tokens.length) {
      resolve(users)
    }
    const response = mapResponse(tokens, 'token', users)
    resolve(response)
  })
}
