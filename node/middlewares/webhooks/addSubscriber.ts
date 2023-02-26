import { json } from 'co-body'

import { formatError } from '../../utils/error'

export async function addSubscriber(ctx: Context) {
  const {
    clients: { themarketer },
    state: { appConfig },
    vtex: { logger },
  } = ctx

  const { email, firstName, lastName, phone } = await json(ctx.req)

  try {
    const user: TheMarketerSubscriberUser = {
      email,
      ...(firstName && lastName && { name: `${firstName} ${lastName}` }),
      ...(phone && { phone }),
    }

    await themarketer.subscribe(
      appConfig.restApiKey,
      appConfig.customerId,
      user
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
