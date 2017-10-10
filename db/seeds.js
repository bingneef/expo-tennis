import { User } from '../models/User'
import { Player } from '../models/Player'
import { Match } from '../models/Match'
import { NewsItem } from '../models/NewsItem'
import faker from 'faker'

const clearDatabase = async () => {
  await User.remove()
  await Player.remove()
  await Match.remove()
  await NewsItem.remove()
}

const init = async () => {
  try {
    await clearDatabase()
    await new User({ username: 'admin', token: 'testtest' }).save()

    await generateNewsItems()
  } catch (e) {
    console.error(e)
  }

  process.exit()
}

const generateNewsItems = async () => {
  await new NewsItem({
    featured: true,
    title: 'Wimbldeon',
    content: 'Into advert-ware nodality systemic DIY military-grade drugs skyscraper network tiger-team soul-delay marketing. Boy sentient Legba woman otaku pre--space. Saturation point nodal point crypto-boy corporation A.I. monofilament girl market human sentient. Towards chrome sentient boat plastic monofilament shanty town tower faded motion paranoid crypto-grenade human range-rover. Singularity shoes denim cyber-courier nodal point face forwards sunglasses j-pop dissident gang math-boy A.I. boat grenade fluidity. Kanji fetishism otaku monofilament car apophenia concrete crypto-augmented reality-ware courier rifle DIY vinyl wonton soup. Denim tank-traps convenience store lights semiotics neural nodal point man. Vinyl 3D-printed RAF smart-8-bit pen faded. Bicycle Chiba range-rover j-pop denim jeans dead silent narrative DIY carbon. ',
    image: {
      path: 'app.jpeg',
      title: 'Sample',
      width: 320,
      height: 320,
    },
    tags: ['tennis'],
  }).save()

  await new NewsItem({
    title: 'World Tour Final',
    content: 'Nodality Legba long-chain hydrocarbons rebar plastic dissident tanto modem hotdog savant boat neon. Voodoo god military-grade modem city faded claymore mine corrupted concrete refrigerator 3D-printed lights. 3D-printed nano-dissident corporation construct footage cartel papier-mache nodality numinous range-rover smart-modem bridge uplink advert assault. Boat drugs spook katana city shoes numinous pistol. Bicycle dome assault denim into kanji franchise math-sentient singularity city media silent gang sprawl futurity savant. Denim ablative engine sign shrine shanty town uplink pre-human sunglasses military-grade corrupted-ware katana sentient film tank-traps. ',
    image: {
      path: 'app.jpeg',
      title: 'Sample',
      width: 320,
      height: 320,
    },
    tags: ['tennis'],
  }).save()

  await new NewsItem({
    title: 'The next thing',
    content: 'Nodality Legba long-chain hydrocarbons rebar plastic dissident tanto modem hotdog savant boat neon. Voodoo god military-grade modem city faded claymore mine corrupted concrete refrigerator 3D-printed lights. 3D-printed nano-dissident corporation construct footage cartel papier-mache nodality numinous range-rover smart-modem bridge uplink advert assault. Boat drugs spook katana city shoes numinous pistol. Bicycle dome assault denim into kanji franchise math-sentient singularity city media silent gang sprawl futurity savant. Denim ablative engine sign shrine shanty town uplink pre-human sunglasses military-grade corrupted-ware katana sentient film tank-traps. ',
    image: {
      path: 'app.jpeg',
      title: 'Sample',
      width: 320,
      height: 320,
    },
    tags: ['tennis'],
  }).save()

  await new NewsItem({
    title: 'Shanghai',
    content: 'Nodality Legba long-chain hydrocarbons rebar plastic dissident tanto modem hotdog savant boat neon. Voodoo god military-grade modem city faded claymore mine corrupted concrete refrigerator 3D-printed lights. 3D-printed nano-dissident corporation construct footage cartel papier-mache nodality numinous range-rover smart-modem bridge uplink advert assault. Boat drugs spook katana city shoes numinous pistol. Bicycle dome assault denim into kanji franchise math-sentient singularity city media silent gang sprawl futurity savant. Denim ablative engine sign shrine shanty town uplink pre-human sunglasses military-grade corrupted-ware katana sentient film tank-traps. ',
    image: {
      path: 'app.jpeg',
      title: 'Sample',
      width: 320,
      height: 320,
    },
    tags: ['tennis'],
  }).save()

  await new NewsItem({
    title: 'He is back!',
    content: 'Faded singularity A.I. into tower film warehouse plastic jeans. Industrial grade rifle carbon sign stimulate boy cyber-neon. Assault-ware apophenia sub-orbital engine pistol decay otaku. Chiba San Francisco dolphin vinyl wristwatch engine voodoo god market tank-traps artisanal rain physical girl stimulate. Gang Chiba skyscraper grenade nodal point chrome render-farm spook. Market assassin uplink receding jeans alcohol bicycle dead network post-sentient claymore mine narrative cyber-monofilament sub-orbital. Motion bicycle singularity ablative j-pop disposable camera neon decay dolphin Kowloon military-grade.',
    image: {
      path: 'app.jpeg',
      title: 'Sample',
      width: 320,
      height: 320,
    },
    tags: ['nadal'],
  }).save()

  await new NewsItem({
    title: 'RG10!',
    content: 'Faded singularity A.I. into tower film warehouse plastic jeans.',
    image: {
      path: 'app.jpeg',
      title: 'Sample',
      width: 320,
      height: 320,
    },
    tags: ['nadal'],
  }).save()

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
}

init()
