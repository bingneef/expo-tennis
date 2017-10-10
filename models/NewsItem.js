import DataLoader from 'dataloader'
import mongoose from './../services/database/mongodb'
const Schema = mongoose.Schema
import mapResponse from './../services/graphql/mapResponse'
import constants from './../config/constants'

const ImageSchema = new Schema({
  path: String,
  title: String,
  height: Number,
  width: Number,
})

class ImageClass {
  get url () {
    if (this.path.indexOf('http') == 0) {
      return this.path
    }
    return `${constants.staticUrl}/assets/${this.path}`
  }
}

ImageSchema.loadClass(ImageClass);

export const NewsItemSchema = new Schema({
  featured: {
    type: Boolean,
    default: false,
  },
  title: String,
  content: String,
  image: ImageSchema,
  tags: Array,
  pubDate: Date,
})

class NewsItemClass { }

NewsItemSchema.loadClass(NewsItemClass);

export const NewsItem = mongoose.model('NewsItem', NewsItemSchema)

export const NewsItemLoader = new DataLoader(ids => batchGetNewsItemsById(ids))

const batchGetNewsItemsById = ids => {
  return new Promise(async (resolve, reject) => {
    const newsItems = await NewsItem.find({ _id: ids }) || []

    // Only because we know ids is unique
    if (newsItems.length == ids.length) {
      resolve(newsItems)
    }
    const response = mapResponse(ids, 'id', newsItems)
    resolve(response)
  })
}
