import md5 from 'md5'

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

  try {
    await scheduler.deleteScheduler('generate-brands-feed')

    await scheduler.createOrUpdateScheduler({
      cronId: 'generate-brands-feed',
      cronExpression: '0 0 * * *',
      cronRequestURI: `https://${account}.myvtex.com/cron/generate/brands_feed/${cronToken}`,
      cronRequestMethod: 'GET',
      cronBody: {},
      cronHeaders: {},
    })
  } catch (error) {
    logger.error({
      origin: `createOrUpdateScheduler - generate-brands-feed`,
      error: formatError(error),
    })
  }

  // this one is created to avoid Kubernetes service from being killed
  // workaround for VTEX only
  try {
    await scheduler.deleteScheduler('keep-alive')

    await scheduler.createOrUpdateScheduler({
      cronId: 'keep-alive',
      cronExpression: '* * * * *',
      cronRequestURI: `https://${account}.myvtex.com/_v/private/keep-alive`,
      cronRequestMethod: 'GET',
      cronBody: {},
      cronHeaders: {},
    })
  } catch (error) {
    logger.error({
      origin: `createOrUpdateScheduler - keep-alive`,
      error: formatError(error),
    })
  }

  await next()
}

export default onSettingsChanged
