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

  await setupCron(scheduler, logger, {
    cronToken,
    cronRequestURI: `https://${account}.myvtex.com/cron/generate/categories_feed/${cronToken}`,
    cronId: 'generate-categories-feed',
    cronExpression: '0 0 * * *',
    cronRequestMethod: 'GET',
  })

  await setupCron(scheduler, logger, {
    cronToken,
    cronRequestURI: `https://${account}.myvtex.com/cron/generate/brands_feed/${cronToken}`,
    cronId: 'generate-brands-feed',
    cronExpression: '0 0 * * *',
    cronRequestMethod: 'GET',
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
