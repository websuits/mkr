import { getBaseUrl } from '../../helpers/tenant'
import { mapOrderToTheMarketer } from '../../mappers/mapOrderToTheMarketer'
import type { Order } from '../../typings/oms'
import { formatNumber } from '../../utils'
import { BAD_REQUEST_MISSING_PARAMS } from '../../utils/constants'
import { formatError } from '../../utils/error'

export async function orders(ctx: Context, next: () => Promise<void>) {
  const {
    query,
    vtex: { logger },
    clients: { oms, tenant, payments },
  } = ctx

  if (!query?.page || !query?.start_date) {
    ctx.status = 400
    ctx.body = { status: BAD_REQUEST_MISSING_PARAMS }

    return
  }

  ctx.set('Content-Type', 'application/json')

  try {
    const forwardedHost = ctx.get('x-forwarded-host')
    const forwardedProto = ctx.get('x-forwarded-proto')
    const baseUrl = await getBaseUrl(forwardedHost, forwardedProto, tenant)

    const creationDate = `creationDate:[${new Date(
      `${query.start_date} 00:00:00`
    ).toISOString()} TO ${new Date().toISOString()}]`

    const list = await oms.listOrders(creationDate, Number(query.page))
    const { list: orderList } = list

    const marketerOrders = []

    for (const order of orderList) {
      const { orderId } = order

      // eslint-disable-next-line no-await-in-loop
      const orderDetails: Order = await oms.getOrder(orderId)
      let totalRefundedValue = '0.00'

      if (orderDetails.status === 'invoiced') {
        const [{ transactionId }] = orderDetails.paymentData.transactions

        // eslint-disable-next-line no-await-in-loop
        const transaction = await payments.getTransactionById(transactionId)

        totalRefundedValue = formatNumber(transaction.totalRefunds)
      }

      const marketerOrder = mapOrderToTheMarketer(
        orderDetails,
        orderList,
        baseUrl,
        totalRefundedValue
      )

      marketerOrders.push(marketerOrder)
    }

    ctx.status = 200
    ctx.body = marketerOrders
  } catch (error) {
    logger.error({
      subject: `Failed to retrieve orders`,
      query: JSON.stringify(query),
      error: formatError(error),
    })
  }

  await next()
}
