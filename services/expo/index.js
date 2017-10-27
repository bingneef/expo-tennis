import Expo from 'expo-server-sdk'
import { User } from '../../models/User'

const expo = new Expo()

export const sendPushForNewNewsItems = async () => {
  const users = await User.find({'notifications.newsItems': true, 'notifications.pushToken': { $exists: true, $ne: ''}})
  const pushTokens = users.map(user => user.notifications.pushToken)

  let messages = []
  for (let pushToken of pushTokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`)
      continue
    }

    messages.push({
      to: pushToken,
      sound: 'default',
      body: 'New TennisNews!',
      data: { type: 'NEWS_ITEM' },
    })
  }

  const chunks = expo.chunkPushNotifications(messages)

  for (let chunk of chunks) {
    try {
      const receipts = await expo.sendPushNotificationsAsync(chunk)
      console.log(receipts)
    } catch (error) {
      console.error(error)
    }
  }
}

