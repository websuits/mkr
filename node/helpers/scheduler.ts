import type { Logger } from '@vtex/api'

import type SchedulerClient from '../clients/scheduler'
import { formatError } from '../utils/error'

export const setupCron = async (
  scheduler: SchedulerClient,
  logger: Logger,
  cronSettings: any
) => {
  const { cronRequestURI, cronId, cronExpression, cronRequestMethod } =
    cronSettings

  try {
    await scheduler.deleteScheduler(cronId)

    await scheduler.createOrUpdateScheduler({
      cronId,
      cronExpression,
      cronRequestURI,
      cronRequestMethod,
      cronBody: {},
      cronHeaders: {},
    })
  } catch (error) {
    logger.error({
      origin: `createOrUpdateScheduler - ${cronId}`,
      error: formatError(error),
    })
  }
}
