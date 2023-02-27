import { IOClients } from '@vtex/api'

import CatalogClient from './catalog'
import { Logistics } from './logistics'
import OMSClient from './oms'
import VtexPayments from './payments'
import Pricing from './pricing'
import SchedulerClient from './scheduler'
import TheMarketerClient from './themarketer'

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

  public get themarketer() {
    return this.getOrSet('themarketer', TheMarketerClient)
  }

  public get logistics() {
    return this.getOrSet('logistics', Logistics)
  }

  public get pricing() {
    return this.getOrSet('pricing', Pricing)
  }
}
