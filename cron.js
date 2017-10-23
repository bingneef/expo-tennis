import cron from 'node-cron'
import { getNews, getResults } from './workers'

export const initCron = () => {
  console.log('Starting CronJobs')

  // Every 15 minutes
  cron.schedule('*/15 * * * *', async () =>{
    console.log('Cronjob starting: getNews')
    await getNews()
    console.log('Cronjob ended: getNews')
  })

  // Every day at 1:15am
  cron.schedule('15 1 * * *', async () =>{
    console.log('Cronjob starting: getResults')
    await getResults()
    console.log('Cronjob ended: getResults')
  })
}
