import type { IOContext, InstanceOptions } from '@vtex/api'
import { JanusClient } from '@vtex/api'

import type { InventoryBySkuResponse } from '../typings/logistics'

export class Logistics extends JanusClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(ctx, {
      ...options,
      headers: {
        VtexIdclientAutCookie: ctx.authToken,
      },
    })
  }

  public listInventoryBySku(skuId: number) {
    return this.http.get<InventoryBySkuResponse>(
      `/api/logistics/pvt/inventory/skus/${skuId}`,
      {
        metric: 'logistics-listInventoryBySku',
      }
    )
  }
}
