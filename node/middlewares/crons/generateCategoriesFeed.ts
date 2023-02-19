import md5 from 'md5'

import { CATEGORIES_FEED_PATH, FEED_BUCKET } from '../../utils/constants'
import { formatError } from '../../utils/error'

export async function generateCategoriesFeed(
  ctx: Context,
  next: () => Promise<void>
) {
  const {
    clients: { catalog, vbase },
    vtex: {
      account,
      logger,
      route: { params },
    },
  } = ctx

  ctx.set('cache-control', 'no-store, no-cache')

  const cronToken = params?.cronToken as string

  if (cronToken !== md5(account)) {
    ctx.status = 403

    return
  }

  try {
    const categoryList = await catalog.listCategories()

    await vbase.saveJSON(FEED_BUCKET, CATEGORIES_FEED_PATH, categoryList)

    ctx.status = 200
    ctx.body = `Generated categories feed with ${categoryList.length} items`
  } catch (error) {
    logger.error({
      subject: `Failed to generate categories feed`,
      messaage: formatError(error),
    })

    ctx.status = 500
  }

  await next()
}
