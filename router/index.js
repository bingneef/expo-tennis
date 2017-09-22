const Router = require('koa-router')
const graphqlHTTP = require('koa-graphql')

const router = new Router()
const schema = require('../services/graphql/schema/index')

router.all('/graphql', graphqlHTTP({
  schema,
  graphiql: false
}))

// Other routes
router.all('/status', async (ctx) => {
  ctx.body = { alive: true }
})

router.all('/', async (ctx) => {
  ctx.body = { alive: true }
})

module.exports = router
