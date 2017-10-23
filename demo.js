import { Player } from './models/Player'
import { Match, MatchSchema } from './models/Match'
import faker from 'faker'

const init = async () => {
  return new Promise(async (resolve) => {
    await Player.remove()
    await Match.remove()

    let matchesInProgress = []
    for (let i = 0; i < 10; i++) {
      matchesInProgress.push(runMatch())
    }
    await Promise.all(matchesInProgress)
    if (!module.parent) process.exit(1)
    resolve(true)
  })
}

const runMatch = async () => {
  return new Promise(async (resolve) => {
    const player1 = await new Player({ firstName: faker.name.firstName(), lastName: faker.name.lastName(), country: faker.address.countryCode() }).save()
    const player2 = await new Player({ firstName: faker.name.firstName(), lastName: faker.name.lastName(), country: faker.address.countryCode() }).save()

    const match = await new Match(
      {
        homePlayer: {
          id: player1.id,
          fullName: player1.fullName,
        },
        awayPlayer: {
          id: player2.id,
          fullName: player2.fullName,
        },
        score: {
          sets: [
            {
              games: [
                {
                  points: [],
                }
              ],
            },
          ],
        },
        status: 'PROGRESS',
      },
    ).save()

    await addPoint(match)
    resolve()
  })
}

const addPoint = async (match) => {
  await match.addPoint(generatePoint())
  if (match.status == 'HOME_WINNER' || match.status == 'AWAY_WINNER') {
    if (!module.parent) console.log(match.currentScore)
    return
  }

  return await sleep(addPoint, match)
}

const sleep = (fn, args) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(fn(args)), timeToNextPoint())
  })
}

const timeToNextPoint = () => {
  return Math.random() * 1000 + 2000
}

const generatePoint = () => {
  const kinds = [null, 'WINNER', 'UNFORCED_ERROR', 'FORCED_ERROR', 'ACE','DOUBLE_FAULT']
  const wings = [null, 'FOREHAND', 'BACKHAND', 'VOLLEY', 'OVERHEAD']

  const kind = kinds[Math.floor(Math.random() * ((kinds.length - 1)) + 1)]
  let wing = null
  if (kind == 'WINNER' || kind == 'UNFORCED_ERROR' || kind == 'FORCED_ERROR') {
    wing = wings[Math.floor(Math.random() * ((wings.length - 1)) + 1)]
  }

  return {
    status: Math.random() > 0.5 ? 'HOME_WINNER' : 'AWAY_WINNER',
    kind,
    wing,
  }
}

if (!module.parent) init()
export default init
