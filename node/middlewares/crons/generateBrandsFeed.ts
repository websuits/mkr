import { BRANDS_FEED_PATH, FEED_BUCKET } from '../../utils/constants'
import { formatError } from '../../utils/error'

export async function generateBrandsFeed(
  ctx: Context,
  next: () => Promise<void>
) {
  const {
    clients: { catalog, vbase },
    vtex: { logger },
  } = ctx

  ctx.set('cache-control', 'no-store, no-cache')

  try {
    const brandList = await catalog.listBrands()

    await vbase.saveJSON(FEED_BUCKET, BRANDS_FEED_PATH, brandList)

    ctx.status = 200
    ctx.body = `Generated brands feed with ${brandList.length} items`
  } catch (error) {
    logger.error({
      subject: `Failed to generate brands feed`,
      messaage: formatError(error),
    })

    ctx.status = 500
  }

  await next()
}
