import Koa from 'koa'
import Helmet from 'koa-helmet'
import ResponseTime from 'koa-response-time'
import KoaLogger from 'koa-logger-winston'
import koaBody from 'koa-bodyparser'
import koaStatic from 'koa-static'
import { Engine } from 'apollo-engine'
import compress from 'koa-compress'

import { execute, subscribe } from 'graphql'
import { createServer } from 'http'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import schema from './services/graphql/schema/index'

import constants from './config/constants'
import logger from './services/logger'

import Router from 'koa-router'
import router from './router'
import AuthenticationMiddleware from './middleware/authentication'
import DataLoadersMiddleware from './middleware/dataLoaders'

import { initCron } from './cron'

const serverPort = constants.serverPort

const app = new Koa()

// Apollo Engine
if (process.env.NODE_ENV == 'production' && constants.tokens.apolloEngine) {
  const engine = new Engine({
    engineConfig: {
      apiKey: constants.tokens.apolloEngine,
      logging: {
        level: 'DEBUG'
      }
    },
    graphqlPort: serverPort,
    endpoint: '/graphql',
    dumpTraffic: true,
  });
  engine.start()
  app.use(engine.koaMiddleware())
}

// Authentication
app.use(DataLoadersMiddleware)
app.use(AuthenticationMiddleware)

// Middleware
app.use(KoaLogger(logger))
app.use(ResponseTime())
app.use(compress())
app.use(Helmet())
app.use(koaBody())
app.use(router.routes()).use(router.allowedMethods())
app.use(koaStatic('./public'))

if (!module.parent) {
  const ws = createServer(app.callback())
  ws.listen(serverPort, () => {
    new SubscriptionServer({
      execute,
      subscribe,
      schema
    }, {
      server: ws,
      path: '/subscriptions',
    })
  })

  initCron()

  console.log(`GraphQL Server is now running on ${constants.baseUrl}:${serverPort}`)
  console.log(`Version: ${constants.version}`)
  console.log(`Environment: ${(process.env.NODE_ENV || 'dev')}`)
}
