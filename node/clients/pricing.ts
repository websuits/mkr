import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

export default class Pricing extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(`http://api.vtex.com/${ctx.account}`, ctx, {
      ...options,
      headers: {
        'X-Vtex-Use-Https': 'true',
        VtexIdClientAutCookie:
          ctx.storeUserAuthToken ??
          ctx.adminUserAuthToken ??
          ctx.authToken ??
          '',
      },
    })
  }

  public async getPrices(skuId: number): Promise<any> {
    return this.http.get(`/pricing/prices/${skuId}`, {
      metric: 'get-prices-by-skuId',
    })
  }
}
