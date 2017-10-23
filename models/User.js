import DataLoader from 'dataloader'
import mongoose from '../services/database/mongodb'
const Schema = mongoose.Schema
import mapResponse from '../services/graphql/mapResponse'
import crypto from 'crypto'

export const UserSchema = new Schema({
  email: String,
  familyName: String,
  givenName: String,
  name: String,
  photoUrl: String,
  externalId: String,
  token: {
    type: String,
    unique: true,
  }
})

UserSchema.pre('save', function (next) {
  if (!this.token) {
    this.token = crypto.randomBytes(20).toString('hex')
  }
  next();
});

export const User = mongoose.model('User', UserSchema)

export const UserLoader = new DataLoader(tokens => batchGetUsersByToken(tokens))

const batchGetUsersByToken = tokens => {
  return new Promise(async (resolve, reject) => {
    const users = await User.find({ token: tokens })

    // Only because we know tokens is unique
    if (users.length == tokens.length) {
      resolve(users)
    }
    const response = mapResponse(tokens, 'token', users)
    resolve(response)
  })
}
