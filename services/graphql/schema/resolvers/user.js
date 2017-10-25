import { User } from '../../../../models/User'

export default {
  Query: {
    currentUser: async ({ ctx }) => {
      return ctx.currentUser
    },
  },
  Mutation: {
    validateToken: async ({ ctx }, { token }) => {
      const user = await ctx.dataLoaders.user.load(token)
      return user
    },
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
