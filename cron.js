import cron from 'node-cron'
import { getNews, liveScore } from './workers'

export const initCron = () => {
  console.log('Starting CronJobs')

  cron.schedule('*/15 * * * *', async () =>{
    console.log('Cronjob starting: getNews')
    await getNews()
    console.log('Cronjob ended: getNews')
  })
}
