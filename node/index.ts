import { LRUCache, method, Service } from '@vtex/api'
import type {
  ClientsConfig,
  EventContext,
  ParamsContext,
  RecorderState,
  ServiceContext,
} from '@vtex/api'

import { Clients } from './clients'
import { generateDiscountCodes } from './middlewares/generateDiscountCodes'
import { getAllOrders } from './middlewares/getAllOrders'

const TIMEOUT_MS = 1000

// Create a LRU memory cache for the Status client.
// The @vtex/api HttpClient respects Cache-Control headers and uses the provided cache.
const memoryCache = new LRUCache<string, any>({ max: 5000 })

metrics.trackCache('status', memoryCache)

// This is the configuration for clients available in `ctx.clients`.
const clients: ClientsConfig<Clients> = {
  // We pass our custom implementation of the clients bag, containing the Status client.
  implementation: Clients,
  options: {
    // All IO Clients will be initialized with these options, unless otherwise specified.
    default: {
      retries: 2,
      timeout: TIMEOUT_MS,
    },
    // This key will be merged with the default options and add this cache to our Status client.
    status: {
      memoryCache,
    },
  },
}

declare global {
  type Context = ServiceContext<Clients, State>

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

  interface State extends RecorderState {
    code: number
  }
}


// Export a service that defines route handlers and client options.
export default new Service<Clients, State, ParamsContext>({
  clients,
  routes: {
    theMarketerBrandFeed: [
      method({
        // GET: [getAllOrders],
      }),
    ],
    theMarketerDiscount: [
      method({
        POST: [generateDiscountCodes],
      }),
    ],
    theMarketerOrders: [
      method({
        GET: [getAllOrders],
      }),
    ],
  },
})
