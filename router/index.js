import Router from 'koa-router'
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa'
import constants from '../config/constants'
import demo from '../demo'

const router = new Router()
import schema from '../services/graphql/schema/index'

router.all('/graphql',
  (ctx, next) => graphqlKoa({
    schema,
    rootValue: {
      ctx,
    },
  })(ctx, next),
);
router.get('/graphiql', graphiqlKoa({
  schema,
  endpointURL: '/graphql',
  subscriptionsEndpoint: `ws://localhost:${constants.serverPort}/subscriptions`
}));

// Other routes
router.all('/status', async (ctx) => {
  ctx.body = { alive: true }
})

router.all('/demo', async (ctx) => {
  await demo()
  ctx.body = 'Demo completed'
})

export default router
