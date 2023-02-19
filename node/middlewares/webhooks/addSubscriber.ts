import Parse from 'co-body'

import { formatError } from '../../utils/error'

export async function addSubscriber(ctx: Context) {
  const {
    clients: { themarketer },
    state: { appConfig },
    vtex: { logger },
  } = ctx

  const { email } = await Parse.form(ctx.req)

  try {
    await themarketer.subscribe(
      appConfig.restApiKey,
      appConfig.customerId,
      email
    )

    ctx.status = 200
  } catch (error) {
    logger.error({
      subject: `Failed to subscribe member ${email}`,
      messaage: formatError(error),
    })

    ctx.status = 500
  }
}
