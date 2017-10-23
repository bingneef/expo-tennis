import { User, UserLoader} from '../../../../models/User'

export default {
  Query: {
    currentUser: async ({ctx}) => {
      return ctx.currentUser
    },
  },
  Mutation: {
    createOrUpdateUser: async (root, { user: { email, familyName, givenName, externalId, name, photoUrl } }) => {
      let user = await User.findOne({externalId})
      if (!user) {
        user = new User()
      }
      user.set({email, familyName, givenName, externalId, name, photoUrl, token: null})
      return await user.save()
    }
  },
}
