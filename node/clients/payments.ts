import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

const CACHE_KEY_GET_TRANSACTION = 'get_transaction'

export default class VtexPayments extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(`http://${context.account}.vtexpayments.com.br`, context, {
      ...options,
      headers: {
        ...(options?.headers ?? {}),
        'Content-Type': 'application/json',
        'X-Vtex-Use-Https': 'true',
        VtexIdclientAutCookie: context.adminUserAuthToken ?? context.authToken,
      },
    })
  }

  public async getTransactionById(tid: string) {
    const cachedOrder: any = await this.options?.memoryCache?.get(
      `${CACHE_KEY_GET_TRANSACTION}_${tid}`
    )

    if (cachedOrder !== undefined) {
      return cachedOrder
    }

    const transaction = await this.http.get(`/api/pvt/transactions/${tid}`, {
      metric: 'get-transaction-by-id',
    })

    await this.options?.memoryCache?.set(
      `${CACHE_KEY_GET_TRANSACTION}_${tid}`,
      transaction
    )

    return transaction
  }
}
