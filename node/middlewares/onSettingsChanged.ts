import md5 from 'md5'

import { setupCron } from '../helpers/scheduler'
import { formatError } from '../utils/error'

const onSettingsChanged = async (
  ctx: InstalledAppEvent,
  next: () => Promise<any>
) => {
  const {
    vtex: { logger, workspace, account },
    clients: { scheduler },
    state: { appConfig },
  } = ctx

  // only created crons on master
  if (workspace !== 'master') {
    return
  }

  if (!appConfig.status) {
    try {
      await scheduler.deleteScheduler('generate-brands-feed')
      await scheduler.deleteScheduler('generate-categories-feed')
      await scheduler.deleteScheduler('generate-products-feed')
      await scheduler.deleteScheduler('import-product-reviews')
      await scheduler.deleteScheduler('keep-alive')
    } catch (error) {
      logger.error({
        subject: `Failed to delete crons`,
        error: formatError(error),
      })
    }

    return
  }

  const cronToken = md5(account)

  const [brandsCronScheduledHour] = appConfig.cronSettings.brandsCron.split(':')

  const [categoriesCronScheduledHour] =
    appConfig.cronSettings.categoriesCron.split(':')

  const [productsCronScheduledHour] =
    appConfig.cronSettings.productsCron.split(' ')

  await setupCron(scheduler, logger, {
    cronToken,
    cronRequestURI: `https://${account}.myvtex.com/themarketer/cron/categories_feed/${cronToken}`,
    cronId: 'generate-categories-feed',
    cronExpression: `0 ${categoriesCronScheduledHour} * * *`,
    cronRequestMethod: 'POST',
  })

  await setupCron(scheduler, logger, {
    cronToken,
    cronRequestURI: `https://${account}.myvtex.com/themarketer/cron/products_feed/${cronToken}`,
    cronId: 'generate-products-feed',
    cronExpression: `*/3 */${productsCronScheduledHour} * * *`,
    cronRequestMethod: 'POST',
  })

  await setupCron(scheduler, logger, {
    cronToken,
    cronRequestURI: `https://${account}.myvtex.com/themarketer/cron/brands_feed/${cronToken}`,
    cronId: 'generate-brands-feed',
    cronExpression: `0 ${brandsCronScheduledHour} * * *`,
    cronRequestMethod: 'POST',
  })

  await setupCron(scheduler, logger, {
    cronToken,
    cronRequestURI: `https://${account}.myvtex.com/themarketer/cron/product_reviews/${cronToken}`,
    cronId: 'import-product-reviews',
    cronExpression: `0 * * * *`,
    cronRequestMethod: 'POST',
  })

  // this one is created to avoid Kubernetes service from being killed
  // workaround for VTEX only
  await setupCron(scheduler, logger, {
    cronToken,
    cronRequestURI: `https://${account}.myvtex.com/_v/private/keep-alive`,
    cronId: 'keep-alive',
    cronExpression: '* * * * *',
    cronRequestMethod: 'GET',
  })

  await next()
}

export default onSettingsChanged
