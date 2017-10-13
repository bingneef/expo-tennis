import axios from 'axios'
import parser from 'xml2json'
import { NewsItem } from './../models/NewsItem'
import decode from 'unescape'

const perform = async () => {
  try {
    const response = await axios.get('http://feeds.bbci.co.uk/sport/tennis/rss.xml?edition=uk#')
    const parsed = parser.toJson(response.data)
    let items = JSON.parse(parsed).rss.channel.item

    let firstItem = true
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
      if (!newsItem) {
        newsItem = new NewsItem()
      }
      const payload = {
        featured: firstItem,
        title: item.title,
        link: item.link,
        content,
        image: {
          path: item['media:thumbnail'].url,
          title: 'BBC UK',
          width: item['media:thumbnail'].width,
          height: item['media:thumbnail'].height,
        },
        tags,
        pubDate: item.pubDate,
      }

      newsItem.set(payload)
      promises.push(newsItem.save())

      firstItem = false
    }
    await Promise.all(promises)
    if (!module.parent) process.exit(0)
  } catch (e) {
    console.log(e)
    if (!module.parent) process.exit(1)
  }
}

if (!module.parent) perform()
export default perform
