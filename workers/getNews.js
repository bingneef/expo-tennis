import axios from 'axios'
import parser from 'xml2json'
import { NewsItem } from './../models/NewsItem'
import { Match } from './../models/ApiMatch'
import decode from 'unescape'
import getColors from 'get-image-colors'
import fs from 'fs'
import crypto from 'crypto'
import sharp from 'sharp'
import constants from '../config/constants'
import { sendPushForNewNewsItems } from '../services/expo'

const perform = async () => {
  let newItems = []
  let containsNewNewsItem = false

  try {
    const response = await axios.get('http://feeds.bbci.co.uk/sport/tennis/rss.xml?edition=uk#')
    const parsed = parser.toJson(response.data)
    let items = JSON.parse(parsed).rss.channel.item

    const promises = []
    for (let item of items) {
      const content = decode(item.description.replace(/<(?:.|\n)*?>/gm, ''))
      let tags = []
      let playerTags = ['nadal', 'federer', 'konta']
      for (let playerTag of playerTags) {
        if (content.toLowerCase().indexOf(playerTag) > -1) {
          tags.push(playerTag)
        }
      }

      let newsItem = await NewsItem.findOne({link: item.link})

      let itemIsNew = false
      if (!newsItem) {
        newsItem = new NewsItem()
        itemIsNew = true
        containsNewNewsItem = true
      }

      let payload = {
        title: item.title,
        link: item.link,
        content,
        tags,
        pubDate: item.pubDate,
      }

      if (itemIsNew) {
        const images = await handleNewImages(item['media:thumbnail'].url)

        payload = {
          ...payload,
          images,
        }
      }

      newsItem.set(payload)
      promises.push(newsItem.save())
    }
    await Promise.all(promises)
    if (containsNewNewsItem) {
      await sendPushForNewNewsItems()
    }

    if (!module.parent) process.exit(0)
  } catch (e) {
    console.log(e)
    if (!module.parent) process.exit(1)
  }
}

const handleNewImages = async (url) => {
  try {
    const imageId = crypto.randomBytes(10).toString('hex')
    const baseDir = `./public/assets`
    const imageDir = `news-item/${imageId}`
    let colors = []
    try {
      colors = await getColors(url)
      colors = colors.map(color => color.hex())
    } catch (e) { }

    const response = await axios.get(url, { responseType: 'arraybuffer' })
    if (!fs.existsSync(`${baseDir}/${imageDir}`)) {
      fs.mkdirSync(`${baseDir}/${imageDir}`);
    }

    let dimensions = [
      {
        width: 600,
        height: 300,
        size: 'banner-sm'
      },
      {
        width: 120,
        height: 120,
        size: 'square-sm'
      }
    ]
    let images = []

    for (let dimension of dimensions) {
      const image = await resizeImage(response.data, baseDir, imageDir, dimension)
      images.push(image)
    }

    return images
  } catch (e) {
    console.log(e)
    return []
  }
}

const resizeImage = async (data, baseDir, imageDir, {size, width, height}) => {
  const filePath = `${imageDir}/${size}.jpg`

  await sharp(data)
    .resize(width, height)
    .toFile(`${baseDir}/${filePath}`)

  return {
    path: filePath,
    size,
    width,
    height,
  }
}

if (!module.parent) perform()
export default perform
