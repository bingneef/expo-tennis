import { NewsItem } from'../../../../models/NewsItem'
import { MatchLoader} from '../../../../models/ApiMatch'
import mongoose from 'mongoose'

export default {
  Query: {
    newsItemById: async ({ ctx }, { newsItemId }) => await ctx.dataLoaders.newsItem.load(newsItemId),
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
    pubDateTimestamp: newsItem => new Date(newsItem.pubDate).getTime(),
    imageSized: (newsItem, { size }) => newsItem.images.filter(image => image.size == size)[0],
    match: async (newsItem, _, __, parent) => {
      if (!newsItem.matchId || !mongoose.Types.ObjectId.isValid(newsItem.matchId)) {
        return {}
      }

      try {
        return await parent.rootValue.ctx.dataLoaders.match.load(newsItem.matchId)
      } catch (e) {
        console.log(e)
        return {}
      }
    },
  },
}
