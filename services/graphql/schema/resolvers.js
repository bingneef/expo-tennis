const discogsService = require('../../elastic-search/discogs')

const resolvers = {
  Query: {
    byReleaseId: async (root, { releaseId }) => {
      return await discogsService.byReleaseId(releaseId)
    },
    fuzzySearch: async (root, { search, size, from }) => {
      return await discogsService.fuzzySearch({ search }, { size, from })
    },
    search: async (root, { artist, title, size, from }) => {
      return await discogsService.search({ title, artist }, { size, from })
    },
  },
  Release: {
    main_artist: async (release) => release.artists[0]
  },
}

module.exports = resolvers
