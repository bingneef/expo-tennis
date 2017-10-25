import Router from 'koa-router'
import DataLoader from 'dataloader'

import { batchGetNewsItemsById } from '../models/NewsItem'
import { batchGetMatchesById } from '../models/ApiMatch'
import { batchGetTournamentsById } from '../models/Tournament'
import { batchGetSeasonsById } from '../models/Season'
import { batchGetUsersByToken } from '../models/User'

export default async (ctx, next) => {
  ctx.dataLoaders = {
    user: new DataLoader(tokens => batchGetUsersByToken(tokens)),
    newsItem: new DataLoader(ids => batchGetNewsItemsById(ids)),
    match: new DataLoader(ids => batchGetMatchesById(ids)),
    tournament: new DataLoader(ids => batchGetTournamentsById(ids)),
    season: new DataLoader(ids => batchGetSeasonsById(ids)),
  }

  await next()
}
