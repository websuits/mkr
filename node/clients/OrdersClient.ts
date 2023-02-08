import {ExternalClient, InstanceOptions, IOContext, RequestTracingConfig} from '@vtex/api'

interface Headers {
  [key: string]: string
}

export function getRequestConfig(
  context: IOContext,
  metric: string,
  tracingConfig?: RequestTracingConfig
) {
  console.log(context)
  const token = context.authToken
  const headers: Headers = token
    ? {
      'VtexIdclientAutCookie': context.authToken,
      // tslint:disable-next-line:object-literal-sort-keys
      'X-VTEX-API-AppKey': 'vtexappkey-leadlionpartnerro-DSJVXZ',
      'X-VTEX-API-AppToken': 'BAPPWOKCARTHOXJESMVNNBMHCMWDMLLDDTIAGRZMVEWGFBAFMVZGNRWMZJGWISKKWTRCXOGRKNPWXGCRMMBMPYCUFXIPKPLZBFLSFTVYTGOFENGDOHFZTNOAWFDGNRFT',
    }
    : {}

  return {
    headers,
    metric,
    tracing: {
      requestSpanNameSuffix: metric,
      ...tracingConfig?.tracing,
    },
  }
}


export default class OrdersClient extends ExternalClient {

  private routes = {
    //   getAllOrders: () => `?f_creationDate=creationDate:%5B2020-01-01T00:00:00.000Z%20TO%202023-01-23T16:54:37.558Z%5D&page=1&per_page=50`,
    // @ts-ignore
    getAllOrders(page: any, startDate: any, endDate: any) { return `?f_creationDate=creationDate:%5B${startDate}%20TO%202023-02-03T14:36:44.905Z%5D` },
  }

  // getAllOrders(page: any, startDate: any, endDate: any) { return `?f_creationDate=creationDate:%5B${startDate}%20TO%20${endDate}%5D` },
  // getAllOrders(page: any, startDate: any, endDate: any) { return `?page=${page}&per_page=50&f_creationDate=creationDate:%5B${startDate}%20TO%20${endDate}%5D` },

  constructor(context: IOContext, options?: InstanceOptions) {
    super(`https://leadlionpartnerro.vtexcommercestable.com.br/api/oms/pvt/orders`,
      context,
      {
        ...options,
        headers: {
          ...options?.headers,
          'X-Vtex-Use-Https': `true`,
        },
      })
  }

// tslint:disable-next-line:variable-name
  public async getAllOrdersMd(page: string, startDate: string, endDate: string): Promise<any> {
    console.log('get all orders: ', this.context.authToken)
    // console.log(this.routes.getAllOrders(page, startDate, endDate))
    return this.http.get(this.routes.getAllOrders(page, startDate, endDate), getRequestConfig(this.context, 'order-client'))
  }
}
