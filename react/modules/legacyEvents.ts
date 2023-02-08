import push from './push'
import type { PixelMessage, SearchPageInfoData } from '../typings/events'

export async function sendLegacyEvents(e: PixelMessage) {
  // eslint-disable-next-line no-console
  console.log(e.data.eventName)

  switch (e.data.eventName) {
    case 'vtex:pageInfo': {
      const { eventType } = e.data

      switch (eventType) {
        case 'homeView': {
          push({
            event: '__sm__view_homepage',
          })
          break
        }

        case 'newsletterInput': {
          push({
            event: '__sm__newsletter',
          })
          break
        }

        case 'categoryView': {
          const data = e.data as SearchPageInfoData

          // eslint-disable-next-line no-console
          console.log(data)

          push({
            event: '__sm__view_category',
            category: data.category?.name,
          })
          break
        }

        // case 'brandView': {
        //   const data = e.data as SearchPageInfoData
        //
        //   // eslint-disable-next-line no-console
        //   console.log(data)
        //
        //   push({
        //     event: '__sm__view_brand',
        //     name: data.category?.name,
        //   })
        //   break
        // }

        case 'emptySearchView':

        // eslint-disable-next-line no-fallthrough
        case 'internalSiteSearchView': {
          const data = e.data as SearchPageInfoData

          push({
            event: '__sm__search',
            search_term: data.search?.term,
          })

          break
        }

        default: {
          push({
            event: 'otherView',
          })
          break
        }
      }

      break
    }

    default: {
      break
    }
  }
}
