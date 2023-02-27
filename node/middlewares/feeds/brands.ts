import * as cheerio from 'cheerio'

import { getBaseUrl } from '../../helpers/tenant'
import { catalogSlugify } from '../../utils'
import { BRANDS_FEED_PATH, FEED_BUCKET } from '../../utils/constants'
import { formatError } from '../../utils/error'

export async function brands(ctx: Context, next: () => Promise<void>) {
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
      '<?xml version="1.0" encoding="UTF-8"?><brands></brands>',
      {
        xmlMode: true,
      }
    )

    const brandList: Brand[] | null = await vbase.getJSON(
      FEED_BUCKET,
      BRANDS_FEED_PATH,
      true
    )

    if (!brandList) {
      throw new Error(
        `Could't find ${BRANDS_FEED_PATH} in bucket ${FEED_BUCKET}`
      )
    }

    brandList.forEach((brand: Brand) => {
      if (brand.isActive) {
        const brandItem = `<brand>
          <name>${brand.name}</name>
          <id>${brand.id}</id>
          <url>${baseUrl}/${catalogSlugify(brand.name)}</url>
          ${brand.imageUrl ? `<image_url>${brand.imageUrl}</image_url>` : ''}
        </brand>`

        $('brands').append(brandItem)
      }
    })

    ctx.status = 200
    ctx.body = $.xml()
  } catch (error) {
    logger.error({
      subject: `Failed to serve brands feed`,
      messaage: formatError(error),
    })

    const $ = cheerio.load(
      '<?xml version="1.0" encoding="UTF-8"?><brands><brand /></brands>',
      {
        xmlMode: true,
      }
    )

    ctx.status = 500
    ctx.body = $.xml()
  }

  await next()
}
