/* eslint-disable no-await-in-loop */
import md5 from 'md5'

import { getPrice } from '../../helpers/prices'
import { FEED_BUCKET, PRODUCTS_FEED_PATH } from '../../utils/constants'
import { formatError } from '../../utils/error'

export async function generateProductsFeed(
  ctx: Context,
  next: () => Promise<void>
) {
  ctx.set('cache-control', 'no-store, no-cache')

  const {
    vtex: {
      route: { params },
      account,
      logger,
    },
    clients: { catalog, pricing, logistics, apps, vbase },
  } = ctx

  const cronToken = params?.cronToken as string

  if (cronToken !== md5(account)) {
    ctx.status = 403

    return
  }

  const date = new Date()

  const year = date.toLocaleString('default', { year: 'numeric' })
  const month = date.toLocaleString('default', { month: '2-digit' })
  const day = date.toLocaleString('default', { day: '2-digit' })

  const settings: {
    page: number
    finished: boolean
    pageLimit: number
    data: any
  } = await vbase.getJSON(
    FEED_BUCKET,
    `${PRODUCTS_FEED_PATH}_${year + month + day}`,
    true
  )

  if (!settings) {
    await vbase.saveJSON(
      FEED_BUCKET,
      `${PRODUCTS_FEED_PATH}_${year + month + day}`,
      {
        page: 1,
        finished: false,
        pageLimit: 10,
        data: [],
      }
    )

    ctx.body = `Saving initial settings for ${year + month + day}`
    ctx.status = 200

    return
  }

  if (settings.finished) {
    ctx.body = `All done for today`
    ctx.status = 200

    logger.info({
      middleware: `generateProductsFeed`,
      data: `Number of products in generated feed: ${settings.data.length}`,
    })

    return
  }

  const appConfig: AppSettings = await apps.getAppSettings(
    process.env.VTEX_APP_ID as string
  )

  const { color: colorFieldName, size: sizeFieldName } =
    appConfig.productSpecificationMappings

  const products: TheMarketerFeedProductItem[] = []

  let finished = false
  let { page } = settings

  try {
    do {
      const skus: any = await catalog.listSkus(page, 100)

      for (const [key, values] of Object.entries(skus.data)) {
        const productId = Number(key)
        const variations: Variation[] = []
        const images: string[] = []
        let product: any = null

        let totalProductQuantity = 0
        let productPrice = '0.00'
        let productSalePrice = '0.00'

        for (const skuId of values as number[]) {
          const skuContext = await catalog.skuContext(skuId)

          let prices = null

          try {
            prices = await pricing.getPrices(skuId)
          } catch (error) {
            //
          }

          if (!prices) {
            continue
          }

          const inventory = await logistics.listInventoryBySku(skuId)

          const { price, costPrice } = getPrice(prices)

          totalProductQuantity += inventory.balance[0].totalQuantity

          if (
            Number(productPrice) < Number(price) &&
            Number(productSalePrice) < Number(costPrice)
          ) {
            productPrice = price
            productSalePrice = costPrice
          }

          const colorFieldValue = skuContext.ProductSpecifications.find(
            (specification: { FieldName: string; FieldValues: string[] }) =>
              specification.FieldName === colorFieldName
          )

          const sizeFieldValue = skuContext.ProductSpecifications.find(
            (specification: { FieldName: string; FieldValues: string[] }) =>
              specification.FieldName === sizeFieldName
          )

          const variation: Variation = {
            id: `${productId}_${skuId}`,
            sku: skuId,
            sale_price: costPrice,
            price,
            size: sizeFieldValue?.FieldValues[0] ?? '',
            color: colorFieldValue?.FieldValues[0] ?? '',
            availability: inventory.balance[0].totalQuantity > 0 ? 1 : 0,
            stock: inventory.balance[0].totalQuantity,
          }

          variations.push(variation)

          if (skuContext.Images.length) {
            skuContext.Images.forEach((image: { ImageUrl: string }) => {
              images.push(image.ImageUrl.split('?v=')[0])
            })
          }

          product = {
            id: productId,
            sku: productId,
            name: skuContext.ProductName,
            description: skuContext.ProductDescription,
            url: skuContext.DetailUrl,
            category: Object.values(skuContext.ProductCategories).join('|'),
            brand: skuContext.BrandName,
            price: productPrice,
            sale_price: productSalePrice,
            availability: totalProductQuantity > 0 ? 1 : 0,
            stock: totalProductQuantity,
            media_gallery: images,
            variations,
            created_at: skuContext.ReleaseDate,
          }
        }

        products.push(product)
      }

      if (!skus.data.length || page % settings.pageLimit === 0) {
        finished = true

        await vbase.saveJSON(
          FEED_BUCKET,
          `${PRODUCTS_FEED_PATH}_${year + month + day}`,
          {
            ...settings,
            page: page + 1,
            finished: !skus.data.length,
            data: [...settings.data, ...products],
          }
        )
      } else {
        page++
      }
    } while (!finished)

    ctx.status = 200
    ctx.body = `${products.length} products processed in this iteration`
  } catch (error) {
    logger.error({
      subject: `Failed to generate products feed`,
      messaage: formatError(error),
    })

    ctx.status = 500
  }

  await next()
}
