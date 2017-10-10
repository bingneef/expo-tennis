import Koa from 'koa'
import Helmet from 'koa-helmet'
import ResponseTime from 'koa-response-time'
import RateLimit from 'koa-ratelimit'
import KoaLogger from 'koa-logger-winston'
import koaBody from 'koa-bodyparser'
import koaStatic from 'koa-static'
import Redis from 'ioredis'

import { execute, subscribe } from 'graphql'
import { createServer } from 'http'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import schema from './services/graphql/schema/index'

import constants from './config/constants'
import logger from './services/logger'

import Router from 'koa-router'
import router from './router'
import AuthenticationMiddleware from './middleware/authentication'

const redisPort = constants.redisPort
const serverPort = constants.serverPort

const app = new Koa()

// Authentication
app.use(AuthenticationMiddleware)

// Middleware
app.use(KoaLogger(logger))
app.use(ResponseTime())
app.use(Helmet())
// app.use(RateLimit({
//   db: new Redis(redisPort),
//   duration: 60000,
//   errorMessage: 'RateLimit reached. Please wait a minute',
//   id: (ctx) => ctx.currentUser.token,
//   headers: {
//     remaining: 'Rate-Limit-Remaining',
//     reset: 'Rate-Limit-Reset',
//     total: 'Rate-Limit-Total'
//   },
//   max: 100
// }))
app.use(koaBody())
app.use(router.routes()).use(router.allowedMethods())
app.use(koaStatic('./public'))

if (!module.parent) {
  const ws = createServer(app.callback())
  ws.listen(serverPort, () => {
    // Set up the WebSocket for handling GraphQL subscriptions
    new SubscriptionServer({
      execute,
      subscribe,
      schema
    }, {
      server: ws,
      path: '/subscriptions',
    })
  })

  console.log(`GraphQL Server is now running on http://localhost:${serverPort}`)
  console.log(`Listening to Redis on port ${redisPort}.`)
  console.log(`Version: ${constants.version}`)
  console.log(`Environment: ${(process.env.NODE_ENV || 'dev')}`)
}
