const DataLoader = require('dataloader')
const mongoose = require('../services/database/mongodb')
const Schema = mongoose.Schema
const mapResponse = require('../services/graphql/mapResponse')

const UserSchema = new Schema({
  username: String,
  token: {
    type: String,
    unique: true,
  }
})
const User = mongoose.model('User', UserSchema)

const UserLoader = new DataLoader(tokens => batchGetUsersByToken(tokens))

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

module.exports = {
  Model: User,
  Schema: UserSchema,
  Loader: UserLoader,
}
