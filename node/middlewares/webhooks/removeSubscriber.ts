import { json } from 'co-body'

import { formatError } from '../../utils/error'

export async function removeSubscriber(ctx: Context) {
  const {
    clients: { themarketer },
    state: { appConfig },
    vtex: { logger },
  } = ctx

  const { email } = await json(ctx.req)

  try {
    await themarketer.unsubscribe(
      appConfig.restApiKey,
      appConfig.customerId,
      email
    )

    ctx.response.status = 200
  } catch (error) {
    logger.error({
      subject: `Failed to subscribe member ${email}`,
      messaage: formatError(error),
    })

    ctx.status = 500
  }
}
