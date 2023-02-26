import { UNAUTHORIZED_API_ACCESS } from '../utils/constants'
import { formatError } from '../utils/error'

// ON HOLD: waiting for info from the marketer
export async function generateCoupon(ctx: Context, next: () => Promise<void>) {
  const {
    query,
    vtex: { logger },
    state: { appConfig },
  } = ctx

  ctx.set('cache-control', 'no-store, no-cache')

  if (appConfig.restApiKey !== query?.key) {
    ctx.status = 401
    ctx.body = { status: UNAUTHORIZED_API_ACCESS }

    return
  }

  try {
    ctx.status = 200
  } catch (error) {
    logger.error({
      subject: `Failed to generate coupon`,
      messaage: formatError(error),
    })

    ctx.status = 500
  }

  await next()
}
