import { UserInputError } from '@vtex/api'

export async function validateEventSettings(
  ctx: EventCtx,
  next: () => Promise<void>
) {
  const {
    clients: { apps },
  } = ctx

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
    return
  }

  ctx.state.appConfig = appConfig

  await next()
}
