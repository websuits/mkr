import { UserInputError } from '@vtex/api'

import { INTEGRATION_NOT_ENABLED } from '../utils/constants'

export async function validateSettings(
  ctx: Context,
  next: () => Promise<void>
) {
  const {
    clients: { apps },
  } = ctx

  ctx.set('cache-control', 'no-store')

  const appConfig: AppSettings = await apps.getAppSettings(
    process.env.VTEX_APP_ID as string
  )

  if (
    !appConfig?.trackingKey ||
    !appConfig?.restApiKey ||
    !appConfig?.customerId
  ) {
    throw new UserInputError(
      `The ${process.env.VTEX_APP_ID} app has not been configured properly`
    )
  }

  if (!appConfig.status) {
    ctx.status = 403
    ctx.body = { status: INTEGRATION_NOT_ENABLED }

    return
  }

  ctx.state.appConfig = appConfig

  await next()
}
