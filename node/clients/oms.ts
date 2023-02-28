import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

import type { ListOrdersResponse, Order } from '../typings/oms'

const FOUR_SECONDS = 4 * 1000
const ORDERS_PER_PAGE = 50
const CACHE_KEY_GET_ORDER = 'get_order'

export default class OMSClient extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(`http://${ctx.account}.vtexcommercestable.com.br`, ctx, {
      ...options,
      timeout: FOUR_SECONDS,
    })
  }

  public async getOrder(orderId: string, skipCache?: boolean): Promise<Order> {
    const cachedOrder: any = await this.options?.memoryCache?.get(
      `${CACHE_KEY_GET_ORDER}_${orderId}`
    )

    if (cachedOrder !== undefined && !skipCache) {
      return cachedOrder
    }

    const order: any = await this.http.get(`/api/oms/pvt/orders/${orderId}`, {
      headers: {
        VtexIdclientAutCookie: this.context.authToken,
      },
      metric: 'oms-client-getOrder',
    })

    await this.options?.memoryCache?.set(
      `${CACHE_KEY_GET_ORDER}_${orderId}`,
      order
    )

    return order
  }

  public listOrders = (
    creationDate: string,
    page: number
  ): Promise<ListOrdersResponse> =>
    this.http.get(
      `/api/oms/pvt/orders?f_creationDate=${creationDate}&page=${page}&per_page=${ORDERS_PER_PAGE}`,
      {
        headers: {
          VtexIdclientAutCookie: this.context.authToken,
        },
        metric: 'oms-client-listOrders',
      }
    )
}
