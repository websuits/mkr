import { IOClients } from '@vtex/api'

import CatalogClient from './catalog'
import OMSClient from './oms'
import VtexPayments from './payments'
import SchedulerClient from './scheduler'

export class Clients extends IOClients {
  public get oms() {
    return this.getOrSet('oms', OMSClient)
  }

  public get payments() {
    return this.getOrSet('payments', VtexPayments)
  }

  public get catalog() {
    return this.getOrSet('catalog', CatalogClient)
  }

  public get scheduler() {
    return this.getOrSet('scheduler', SchedulerClient)
  }
}
