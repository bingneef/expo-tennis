import { NewsItem, NewsItemLoader} from'../../../../models/NewsItem'

export default {
  Query: {
    newsItemById: async (root, { newsItemId }) => await NewsItemLoader.load(newsItemId),
    newsItems: async (root, { featured, tag }) => {
      let query = NewsItem.find().where({ featured })
      if (tag) {
        query = query.where({tags: tag})
      }
      return await query
    }
  },
  NewsItem: {
    excerpt: async (newsItem, { size }) => newsItem.content.substring(0, size)
  },
}
