import * as cheerio from 'cheerio'

import { getBaseUrl } from '../../helpers/tenant'
import { PRODUCTS_FEED_PATH, FEED_BUCKET } from '../../utils/constants'
import { formatError } from '../../utils/error'

export async function products(ctx: Context, next: () => Promise<void>) {
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
      '<?xml version="1.0" encoding="UTF-8"?><products></products>',
      {
        xmlMode: true,
      }
    )

    const date = new Date()

    const year = date.toLocaleString('default', { year: 'numeric' })
    const month = date.toLocaleString('default', { month: '2-digit' })
    const day = date.toLocaleString('default', { day: '2-digit' })

    const productList: { data: TheMarketerFeedProductItem[] } | null =
      await vbase.getJSON(
        FEED_BUCKET,
        `${PRODUCTS_FEED_PATH}_${year + month + day}`,
        true
      )

    if (!productList) {
      throw new Error(
        `Could't find ${PRODUCTS_FEED_PATH}_${
          year + month + day
        } in bucket ${FEED_BUCKET}`
      )
    }

    productList.data.forEach((product: TheMarketerFeedProductItem) => {
      const productItem = `<product>
          <id>${product.id}</id>
          <sku>${product.sku}</sku>
          <name><![CDATA[${product.name}]]></name>
          <description><![CDATA[${product.description}]]></description>
          <url>${baseUrl}${product.url}</url>
          <category><![CDATA[${product.category}]]></category>
          <brand><![CDATA[${product.brand}]]></brand>
          <price>${product.price}</price>
          <sale_price>${product.sale_price}</sale_price>
          <availability>${product.availability}</availability>
          <stock>${product.stock}</stock>
          <media_gallery>${product.media_gallery.map(
            (image: string) => `<image>${image}</image>`
          )}</media_gallery>
          <variations>${product.variations.map((variation: Variation) => {
            return `<variation>
                <id>${variation.id}</id>
                <sku>${variation.sku}</sku>
                <price>${variation.price}</price>
                <sale_price>${variation.sale_price}</sale_price>
                ${
                  variation.size
                    ? `<size><![CDATA[${variation.size}]]></size>`
                    : ''
                }
                ${
                  variation.color
                    ? `<color><![CDATA[${variation.color}]]></color>`
                    : ''
                }
                <availability>${variation.availability}</availability>
                <stock>${variation.stock}</stock>
            </variation>`
          })}</variations>
          <created_at>${product.created_at}</created_at>
        </product>`

      $('products').append(productItem)
    })

    ctx.status = 200
    ctx.body = $.xml()
  } catch (error) {
    logger.error({
      subject: `Failed to serve products feed`,
      messaage: formatError(error),
    })

    ctx.status = 500
  }

  await next()
}
