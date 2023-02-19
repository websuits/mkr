import * as cheerio from 'cheerio'

import { getBaseUrl } from '../../helpers/tenant'
import { mapCategoriesToTheMarketer } from '../../mappers/mapCategoriesToTheMarketer'
import { CATEGORIES_FEED_PATH, FEED_BUCKET } from '../../utils/constants'
import { formatError } from '../../utils/error'

export async function categories(ctx: Context, next: () => Promise<void>) {
  const {
    clients: { tenant, vbase },
    vtex: { logger },
  } = ctx

  ctx.set('cache-control', 'no-store, no-cache')
  ctx.set('Content-Type', 'text/xml')

  try {
    const forwardedHost = ctx.get('x-forwarded-host')
    const forwardedProto = ctx.get('x-forwarded-proto')
    const baseUrl = await getBaseUrl(forwardedHost, forwardedProto, tenant)

    const $ = cheerio.load(
      '<?xml version="1.0" encoding="UTF-8"?><categories></categories>',
      {
        xmlMode: true,
      }
    )

    const categoryList: CategoryTreeItem[] | null = await vbase.getJSON(
      FEED_BUCKET,
      CATEGORIES_FEED_PATH,
      true
    )

    if (!categoryList) {
      throw new Error(
        `Could't find ${CATEGORIES_FEED_PATH} in bucket ${FEED_BUCKET}`
      )
    }

    const mappedToCategoryFeed: TheMarketerFeedCategoryItem[] = []

    mapCategoriesToTheMarketer(categoryList, null, mappedToCategoryFeed)

    mappedToCategoryFeed.forEach((item: TheMarketerFeedCategoryItem) => {
      const categoryItem = `<category>
          <name>${item.name}</name>
          <id>${item.id}</id>
          <url>${baseUrl}/${item.url.split('.com.br/')[1]}</url>
          <hierarchy>${item.hierarchy}</hierarchy>
        </category>`

      $('categories').append(categoryItem)
    })

    ctx.status = 200
    ctx.body = $.xml()
  } catch (error) {
    logger.error({
      subject: `Failed to serve brands feed`,
      messaage: formatError(error),
    })

    ctx.status = 500
  }

  await next()
}
