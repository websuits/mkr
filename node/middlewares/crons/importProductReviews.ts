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

    // only for testing purposes
    // reviewsAsXml = `<?xml version="1.0" encoding="ISO-8859-1"?>
    //   <reviews>
    //       <review>
    //         <review_id>2</review_id>
    //         <review_date>2023-02-26 13:01:01</review_date>
    //         <review_author>Jane Doe</review_author>
    //         <product_id>6</product_id>
    //         <product_sku>5</product_sku>
    //         <rating>9</rating>
    //         <review_text><![CDATA[This is a great product, Jane Doe!]]></review_text>
    //         <media_files>
    //           <media type="image">https://media.themarketer.com/reviews/ABCFHE12/image1.jpg</media>
    //           <media type="video">https://media.themarketer.com/reviews/ABCFHE12/video.mp4</media>
    //         </media_files>
    //     </review>
    //     <review>
    //         <review_id>3</review_id>
    //         <review_date>2023-02-26 14:01:01</review_date>
    //         <review_author>Jane Doe</review_author>
    //         <product_id>6</product_id>
    //         <product_sku>5</product_sku>
    //         <rating>6</rating>
    //         <review_text><![CDATA[This is a great product, Jane Doe!]]></review_text>
    //         <media_files>
    //           <media type="image">https://media.themarketer.com/reviews/ABCFHE12/image1.jpg</media>
    //           <media type="video">https://media.themarketer.com/reviews/ABCFHE12/video.mp4</media>
    //         </media_files>
    //     </review>
    //     <review>
    //         <review_id>4</review_id>
    //         <review_date>2023-02-26 15:01:01</review_date>
    //         <review_author>John Doe</review_author>
    //         <product_id>6</product_id>
    //         <product_sku>5</product_sku>
    //         <rating>5</rating>
    //         <review_text><![CDATA[This is a great product, John Doe!]]></review_text>
    //         <media_files>
    //           <media type="image">https://media.themarketer.com/reviews/ABCFHE12/image1.jpg</media>
    //           <media type="video">https://media.themarketer.com/reviews/ABCFHE12/video.mp4</media>
    //         </media_files>
    //     </review>
    //   </reviews>`

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
        approved: false,
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
