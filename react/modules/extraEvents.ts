import push from './push'
import type { PixelMessage } from '../typings/events'

export async function sendExtraEvents(e: PixelMessage) {
  // eslint-disable-next-line no-console
  console.log(e.data.eventName)

  switch (e.data.eventName) {
    case 'vtex:pageView': {
      push({
        event: 'pageView',
        location: e.data.pageUrl,
        page: e.data.pageUrl.replace(e.origin, ''),
        referrer: e.data.referrer,
        ...(e.data.pageTitle && {
          title: e.data.pageTitle,
        }),
      })

      break
    }

    default: {
      break
    }
  }
}
