import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

const FOUR_SECONDS = 4 * 1000

export default class CatalogClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(`http://${context.account}.vtexcommercestable.com.br`, context, {
      ...options,
      headers: {
        ...options?.headers,
        VtexIdClientAutCookie: context.authToken,
      },
      timeout: FOUR_SECONDS,
    })
  }

  public listBrands = (): Promise<Brand[]> =>
    this.http.get(`/api/catalog_system/pvt/brand/list`, {
      metric: 'catalog-client-listBrands',
    })

  public listCategories = (): Promise<CategoryTreeItem[]> =>
    this.http.get('/api/catalog_system/pub/category/tree/3', {
      metric: 'catalog-client-listCategories',
    })

  public async skuContext(skuId: number): Promise<any> {
    return this.http.get(
      `/api/catalog_system/pvt/sku/stockkeepingunitbyid/${skuId}`
    )
  }

  public async listSkus(from: number, to: number): Promise<any> {
    return this.http.get(
      `/api/catalog_system/pvt/products/GetProductAndSkuIds?_from=${from}&_to=${to}`
    )
  }
}
