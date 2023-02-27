import { LRUCache, method, Service } from '@vtex/api'
import type {
  ClientsConfig,
  ParamsContext,
  RecorderState,
  ServiceContext,
  Cached,
  EventContext,
} from '@vtex/api'

import { Clients } from './clients'
import { firebaseConfig } from './middlewares/firebaseConfig'
import { firebaseMessaging } from './middlewares/firebaseMessaging'
import { orders } from './middlewares/feeds/orders'
import { validateSettings } from './middlewares/validateSettings'
import { brands } from './middlewares/feeds/brands'
import { generateBrandsFeed } from './middlewares/crons/generateBrandsFeed'
import onSettingsChanged from './middlewares/onSettingsChanged'
import { validateEventSettings } from './middlewares/validateEventSettings'
import { generateCategoriesFeed } from './middlewares/crons/generateCategoriesFeed'
import { categories } from './middlewares/feeds/categories'
import { addSubscriber } from './middlewares/webhooks/addSubscriber'
import { removeSubscriber } from './middlewares/webhooks/removeSubscriber'
import { generateProductsFeed } from './middlewares/crons/generateProductsFeed'
import { products } from './middlewares/feeds/products'
import { importProductReviews } from './middlewares/crons/importProductReviews'
import { generateCoupon } from './middlewares/generateCoupon'
import { orderStatusUpdates } from './middlewares/orderStatusUpdates'
import { keepAlive } from './middlewares/keepAlive'

const TIMEOUT_MS = 5 * 1000
const MAX_SIZE_FOR_CACHE = 10000
const MAX_TTL = 1000 * 60 * 60 // 1 hour

const omsCache = new LRUCache<string, Cached>({
  max: MAX_SIZE_FOR_CACHE,
  ttl: MAX_TTL,
})

const paymentsCache = new LRUCache<string, Cached>({
  max: MAX_SIZE_FOR_CACHE,
  ttl: MAX_TTL,
})

const clients: ClientsConfig<Clients> = {
  implementation: Clients,
  options: {
    default: {
      retries: 2,
      timeout: TIMEOUT_MS,
    },
    oms: {
      memoryCache: omsCache,
    },
    payments: {
      memoryCache: paymentsCache,
    },
  },
}

declare global {
  type Context = ServiceContext<Clients, State>
  type EventCtx = EventContext<Clients, State>

  interface InstalledAppEvent extends EventContext<Clients, State> {
    body: { id?: string }
  }

  interface State extends RecorderState {
    appConfig: AppSettings
  }

  interface StatusChangeContext extends EventContext<Clients> {
    body: {
      domain: string
      orderId: string
      currentState: string
      lastState: string
      currentChangeDate: string
      lastChangeDate: string
    }
  }
}

export default new Service<Clients, State, ParamsContext>({
  clients,
  events: {
    onSettingsChanged: [validateEventSettings, onSettingsChanged],
    orderStatusUpdates: [validateEventSettings, orderStatusUpdates],
  },
  routes: {
    keepAlive: [method({ GET: [keepAlive] })],
    firebaseConfig: [method({ GET: [firebaseConfig] })],
    firebaseMessaging: [method({ GET: [firebaseMessaging] })],
    orderExport: [method({ GET: [validateSettings, orders] })],
    brandsFeed: [method({ GET: [brands] })],
    categoriesFeed: [method({ GET: [categories] })],
    productsFeed: [method({ GET: [products] })],
    generateBrandsFeed: [method({ POST: [generateBrandsFeed] })],
    generateCategoriesFeed: [method({ POST: [generateCategoriesFeed] })],
    generateProductsFeed: [method({ POST: [generateProductsFeed] })],
    importProductReviews: [
      method({ POST: [validateSettings, importProductReviews] }),
    ],
    addSubscriber: [method({ POST: [validateEventSettings, addSubscriber] })],
    removeSubscriber: [
      method({ POST: [validateEventSettings, removeSubscriber] }),
    ],
    codeGenerator: [method({ POST: [validateSettings, generateCoupon] })],
  },
})
