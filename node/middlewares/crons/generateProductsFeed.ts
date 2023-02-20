/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
import md5 from 'md5'

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
    // clients: { logistics, catalog, pricing },
  } = ctx

  const cronToken = params?.cronToken as string

  if (cronToken !== md5(account)) {
    ctx.status = 403

    return
  }

  const products: TheMarketerFeedProductItem[] = []
  //   let finished = false
  //   let page = 1

  try {
    // do {
    //   const skus: number[] = await catalog.listSkus(page, 100)
    //   for (const skuId of skus) {
    //     const skuContext = await catalog.skuContext(skuId)
    //     const price = await pricing.getPrices(skuId)
    //     const inventory = await logistics.listInventoryBySku(skuId)
    //   }
    //   if (!skus.length) {
    //     finished = true
    //   } else {
    //     page++
    //   }
    // } while (!finished)

    ctx.status = 200
    ctx.body = `Generated products feed with ${products.length} items`
  } catch (error) {
    logger.error({
      subject: `Failed to generate products feed`,
      messaage: formatError(error),
    })

    ctx.status = 500
  }

  await next()
}
