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


export default class DiscountsClient extends ExternalClient {

  private routes = {
    // tslint:disable-next-line:variable-name
    // @ts-ignore
    generateDiscountCodeRoute: (page, startDate, endDate) => `?utmSource=estefanluntraru@gmail.com&utmCampaign=bla&couponCode=summersale10&maxItemsPerClient=10&expirationIntervalPerUse=00:00:00`,
    // `?utmSource=${email}&utmCampaign=${compaign}&couponCode=${code}&maxItemsPerClient=${maxItemsPerClient}&expirationIntervalPerUse=${expirationIntervalPerUse}`,
  }

  constructor(context: IOContext, options?: InstanceOptions) {
    super(`https://leadlionpartnerro.vtexcommercestable.com.br/api/rnb/pvt/coupon/`,
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
  public async generateDiscountCode(page: any, startDate: any, endDate: any): Promise<any> {
    console.log(this.routes.generateDiscountCodeRoute(page, startDate, endDate))
    return this.http.get(this.routes.generateDiscountCodeRoute(page, startDate, endDate), getRequestConfig(this.context, 'order-client'))
  }
}
