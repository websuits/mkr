/* eslint-disable no-await-in-loop */
import md5 from 'md5'

import { TENANT_CACHE_TTL_S } from '../../helpers/tenant'
import { formatDateToReviewerDate } from '../../utils'
import {
  FEED_BUCKET,
  PRODUCT_REVIEWS_SETTINGS,
  REVIEWS_AND_RATINGS_DATA_ENTITY,
  REVIEWS_AND_RATINGS_SCHEMA,
} from '../../utils/constants'
import { formatError } from '../../utils/error'
import { parseXml } from '../../utils/xmlParser'

const reviewRatingMappings = [1, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5]

export async function importProductReviews(
  ctx: Context,
  next: () => Promise<void>
) {
  const {
    vtex: {
      route: { params },
      account,
      logger,
    },
    clients: { themarketer, vbase, tenant, masterdata },
    state: { appConfig },
  } = ctx

  const cronToken = params?.cronToken as string

  if (cronToken !== md5(account)) {
    ctx.status = 403

    return
  }

  try {
    const settings: { timestamp: number } = await vbase.getJSON(
      FEED_BUCKET,
      PRODUCT_REVIEWS_SETTINGS,
      true
    )

    const tenantInfo = await tenant.info({
      forceMaxAge: TENANT_CACHE_TTL_S,
    })

    // only for first run to run for all available reviews
    const reviewsAsXml = await themarketer.getProductReviews(
      appConfig.restApiKey,
      appConfig.customerId,
      settings?.timestamp ?? null
    )

    const {
      reviews: { review },
    }: TheMarketerProductReviews = await parseXml(reviewsAsXml)

    if (typeof review === 'string') {
      ctx.status = 200
      ctx.body = `No reviews to process`

      return
    }

    if (typeof review === 'object' && !Array.isArray(review)) {
      const fields = {
        productId: review.product_id,
        sku: review.product_sku,
        rating: reviewRatingMappings[Number(review.rating)],
        text: review.review_text,
        reviewerName: review.review_author,
        locale: tenantInfo.defaultLocale,
        verifiedPurchaser: false,
        approved: false,
        reviewDateTime: formatDateToReviewerDate(review.review_date),
      }

      await masterdata.createDocument({
        dataEntity: REVIEWS_AND_RATINGS_DATA_ENTITY,
        schema: REVIEWS_AND_RATINGS_SCHEMA,
        fields,
      })

      await vbase.saveJSON(FEED_BUCKET, PRODUCT_REVIEWS_SETTINGS, {
        timestamp: new Date(review.review_date).getTime(),
      })

      ctx.status = 200

      return
    }

    for (const item of review) {
      const fields = {
        productId: item.product_id,
        sku: item.product_sku,
        rating: reviewRatingMappings[Number(item.rating)],
        text: item.review_text,
        reviewerName: item.review_author,
        locale: tenantInfo.defaultLocale,
        verifiedPurchaser: false,
        approved: true,
        reviewDateTime: formatDateToReviewerDate(item.review_date),
      }

      await masterdata.createDocument({
        dataEntity: REVIEWS_AND_RATINGS_DATA_ENTITY,
        schema: REVIEWS_AND_RATINGS_SCHEMA,
        fields,
      })

      await vbase.saveJSON(FEED_BUCKET, PRODUCT_REVIEWS_SETTINGS, {
        timestamp: new Date(item.review_date).getTime(),
      })
    }

    ctx.status = 200
    ctx.body = review
  } catch (error) {
    logger.error({
      subject: `Failed to import product reviews`,
      messaage: formatError(error),
    })

    ctx.status = 500
  }

  await next()
}
