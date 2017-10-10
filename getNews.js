import axios from 'axios'
import parser from 'xml2json'
import { NewsItem } from './models/NewsItem'
import decode from 'unescape'

const init = async () => {
  try {
    const response = await axios.get('http://feeds.bbci.co.uk/sport/tennis/rss.xml?edition=uk#')
    const parsed = parser.toJson(response.data)
    let items = JSON.parse(parsed).rss.channel.item

    await NewsItem.remove()

    let firstItem = true
    for (let item of items) {
      const content = decode(item.description.replace(/<(?:.|\n)*?>/gm, ''))
      let tags = ['tennis']
      if (content.toLowerCase().indexOf('nadal') > -1) {
        tags.push('nadal')
      }
      await new NewsItem({
        featured: firstItem,
        title: item.title,
        content,
        image: {
          path: item['media:thumbnail'].url,
          title: 'BBC UK',
          width: item['media:thumbnail'].width,
          height: item['media:thumbnail'].height,
        },
        tags,
        pubDate: item.pubDate,
      }).save()

      firstItem = false
    }
    process.exit(0)
  } catch (e) {
    console.log(e)
    process.exit(1)
  }
}

init()
