import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

export default class TheMarketerClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(`http://t1.themarketer.com/api/v1`, context, {
      ...options,
      headers: {
        ...(options?.headers ?? {}),
        'Content-Type': 'application/json',
        'X-Vtex-Use-Https': 'true',
      },
    })
  }

  // TODO: Add type
  public subscribe = (
    apiKey: string,
    customerId: string,
    user: TheMarketerSubscriberUser
  ): Promise<any> =>
    this.http.post(
      `/add_subscriber?k=${apiKey}&u=${customerId}&email=${user.email}&phone=${user.phone}&name=${user.name}`,
      null,
      {
        metric: 'themarketer-client-susbcribe',
      }
    )

  // TODO: Add type
  public unsubscribe = (
    apiKey: string,
    customerId: string,
    email: string
  ): Promise<any> =>
    this.http.post(
      `/remove_subscriber?k=${apiKey}&u=${customerId}&email=${email}`,
      null,
      {
        metric: 'themarketer-client-unsubscribe',
      }
    )
}
