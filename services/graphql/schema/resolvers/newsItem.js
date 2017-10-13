import { NewsItem, NewsItemLoader} from'../../../../models/NewsItem'

export default {
  Query: {
    newsItemById: async (root, { newsItemId }) => await NewsItemLoader.load(newsItemId),
    newsItems: async (root, { featured, tag, notTag, cursor, limit }) => {
      let params = { featured }
      if (tag) {
        params = {
          ...params,
          tags: {
            ...params.tags,
            $eq: tag,
          },
        }
      }

      if (notTag) {
        params = {
          ...params,
          tags: {
            ...params.tags,
            $ne: notTag,
          },
        }
      }

      const feed = await NewsItem.find(params).sort({pubDate: -1}).skip(cursor).limit(limit)
      const totalCount = await NewsItem.count(params).where(params)

      return {
        totalCount,
        feed,
      }
    }
  },
  NewsItem: {
    excerpt: (newsItem, { size }) => newsItem.content.substring(0, size),
    pubDateTimestamp: newsItem => new Date(newsItem.pubDate).getTime()
  },
}
