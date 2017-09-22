const User = require('../models/User').Model

const clearDatabase = async () => {
  await User.remove()
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
