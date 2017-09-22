const Router = require('koa-router')
const AuthenticationRouter = new Router()
const User = require('../models/user')

module.exports = async (ctx, next) => {
  try {
    const token = ctx.request.header['x-auth']
    if (!token) {
      ctx.throw(401)
    }

    ctx.currentUser = await User.Loader.load(token)
    if (!ctx.currentUser) {
      ctx.throw(401)
    }
  } catch (e) {
    console.log(e)
    ctx.throw(401)
  }

  await next()
}
