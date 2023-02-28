import { formatError } from '../utils/error'

export async function orderStatusUpdates(
  ctx: StatusChangeContext,
  next: () => Promise<any>
) {
  const {
    clients: { themarketer, oms, promotions },
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

    // if order has been invoiced archive coupon to invalidate it
    if (currentState === 'invoiced') {
      const order = await oms.getOrder(orderId, true)

      if (order.marketingData?.coupon) {
        await promotions.archiveCoupon(order.marketingData.coupon)
      }
    }
  } catch (error) {
    logger.error({
      subject: `Failed to update status for order ${orderId} with currentState ${currentState}`,
      messaage: formatError(error),
    })
  }

  await next()
}
