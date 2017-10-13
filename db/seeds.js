import { User } from '../models/User'
import { Player } from '../models/Player'
import { Match } from '../models/Match'
import { Match as ApiMatch } from '../models/ApiMatch'
import { NewsItem } from '../models/NewsItem'
import faker from 'faker'

const clearDatabase = async () => {
  await User.remove()
  await Player.remove()
  await Match.remove()
  await NewsItem.remove()
  await ApiMatch.remove()
}

const init = async () => {
  try {
    await clearDatabase()
    await new User({ username: 'admin', token: 'testtest' }).save()
  } catch (e) {
    console.error(e)
  }

  process.exit()
}

init()
