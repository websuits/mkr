import { formatError } from '../utils/error'

export async function orderStatusUpdates(
  ctx: StatusChangeContext,
  next: () => Promise<any>
) {
  const {
    clients: { themarketer },
    state: { appConfig },
    body: { orderId, currentState },
    vtex: { logger },
  } = ctx

  try {
    await themarketer.updateOrderStatus(
      appConfig.apiKey,
      appConfig.customerId,
      {
        orderId,
        orderStatus: currentState,
      }
    )
  } catch (error) {
    logger.error({
      subject: `Failed to update status for order ${orderId} with currentState ${currentState}`,
      messaage: formatError(error),
    })
  }

  await next()
}
