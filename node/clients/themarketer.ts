import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

export default class TheMarketerClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(`http://t.themarketer.com/api/v1`, context, {
      ...options,
      headers: {
        ...(options?.headers ?? {}),
        'Content-Type': 'application/json',
        'X-Vtex-Use-Https': 'true',
      },
    })
  }

  public getProductReviews = (
    apiKey: string,
    customerId: string,
    timestamp: number | null
  ): Promise<string> =>
    this.http.get(
      `/product_reviews?k=${apiKey}&u=${customerId}${
        timestamp ? `&t=${timestamp}` : ''
      }`,
      {
        metric: 'themarketer-client-get-product-reviews',
      }
    )

  public subscribe = (
    apiKey: string,
    customerId: string,
    user: TheMarketerSubscriberUser
  ): Promise<void> => {
    return this.http.post(
      `/add_subscriber?k=${apiKey}&u=${customerId}&email=${user.email}${
        user.phone ? `&phone=${user.phone}` : ``
      }${user.name ? `&name=${user.name}` : ``}`,
      null,
      {
        metric: 'themarketer-client-susbcribe',
      }
    )
  }

  public unsubscribe = (
    apiKey: string,
    customerId: string,
    email: string
  ): Promise<void> =>
    this.http.post(
      `/remove_subscriber?k=${apiKey}&u=${customerId}&email=${email}`,
      null,
      {
        metric: 'themarketer-client-unsubscribe',
      }
    )
}
