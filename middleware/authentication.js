import Router from 'koa-router'
const AuthenticationRouter = new Router()
import { UserLoader } from '../models/user'

module.exports = async (ctx, next) => {
  const unauthorized = {
    errors: [{
      message: 'UNAUTHORIZED',
    }]
  }

  const badRequest = {
    errors: [{
      message: 'BADREQUEST',
    }]
  }

  try {
    const token = ctx.request.header['x-auth']
    if (!token) {
      ctx.currentUser = null
    } else {
      ctx.currentUser = await UserLoader.load(token)
      if (!ctx.currentUser) {
        ctx.body = unauthorized
        return
      }
    }
  } catch (e) {
    ctx.body = badRequest
    return
  }

  await next()
}
