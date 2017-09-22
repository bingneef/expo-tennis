const Koa = require('koa')
const Helmet = require('koa-helmet')
const ResponseTime = require('koa-response-time')
const RateLimit = require('koa-ratelimit')
const Redis = require('ioredis')
const KoaLogger = require('koa-logger-winston')

const constants = require('./config/constants')
const discogsService = require('./services/elastic-search/discogs')
const logger = require('./services/logger')

const router = require('./router')
const AuthenticationMiddleware = require('./middleware/authentication')

const redisPort = constants.redisPort
const serverPort = constants.serverPort

const app = new Koa()

// Authentication
app.use(AuthenticationMiddleware)

// Middleware
app.use(KoaLogger(logger))
app.use(ResponseTime())
app.use(Helmet())
app.use(RateLimit({
  db: new Redis(redisPort),
  duration: 60000,
  errorMessage: 'RateLimit reached. Please wait a minute',
  id: (ctx) => ctx.currentUser.token,
  headers: {
    remaining: 'Rate-Limit-Remaining',
    reset: 'Rate-Limit-Reset',
    total: 'Rate-Limit-Total'
  },
  max: 100
}))

app.use(router.routes()).use(router.allowedMethods())

if (!module.parent) {
  app.listen(serverPort)

  console.log(`Server running. Listening on port ${serverPort}.`)
  console.log(`Listening to Redis on port ${redisPort}.`)
  console.log(`Version: ${constants.version}`)
  console.log(`Environment: ${(process.env.NODE_ENV || 'dev')}`)
}
