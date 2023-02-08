import { IOClients } from '@vtex/api'
import BrandsFeed from './BrandsFeed'
import DiscountsClient from './DiscountsClient'
import OrdersClient from './OrdersClient'

import Status from './status'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get status() {
    return this.getOrSet('status', Status)
  }
  public get ordersClient() {
    return this.getOrSet('ordersClient', OrdersClient)
  }
  public get discountsClient() {
    return this.getOrSet('discountsClient', DiscountsClient)
  }
  public get brandsFeed() {
    return this.getOrSet('brandsFeed', BrandsFeed)
  }
}
