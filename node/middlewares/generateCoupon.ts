/* eslint-disable no-await-in-loop */
/* eslint-disable padding-line-between-statements */
import voucher_codes from 'voucher-code-generator'

import { createOrUpdatePromotion } from '../helpers/promotions'
import type { GetAllBenefitsResponseItem } from '../typings/promotions'
import {
  BAD_REQUEST_MISSING_PARAMS,
  UNAUTHORIZED_API_ACCESS,
} from '../utils/constants'
import { formatError } from '../utils/error'

export async function generateCoupon(ctx: Context, next: () => Promise<void>) {
  const {
    query,
    vtex: { logger },
    state: { appConfig },
    clients: { promotions },
  } = ctx

  ctx.set('cache-control', 'no-store, no-cache')

  if (appConfig.restApiKey !== query?.key) {
    ctx.status = 401
    ctx.body = { status: UNAUTHORIZED_API_ACCESS }

    return
  }

  if (!query?.value || !query?.type) {
    ctx.status = 400
    ctx.body = { status: BAD_REQUEST_MISSING_PARAMS }

    return
  }

  const promotionValue = Number(query.value) // integer
  const promotionType = Number(query.type) // 0 = fixed value, 1 = percentage value, 2 = free shipping
  const expirationDate =
    String(query?.expiration_date) ?? '2070-12-31T23:00:00Z' // if no exp date, set it far away into the future

  try {
    // create coupon
    const [couponCode] = voucher_codes.generate({ pattern: '##-###-###' })
    const utmCampaign = `MKTR-${couponCode}`

    await promotions.createCoupon({
      couponCode,
      utmCampaign,
    })

    // prepare dates
    const date = new Date()
    date.setSeconds(0, 0)

    const endDate = new Date(expirationDate)
    endDate.setSeconds(0, 0)

    // fetch all active promotions
    const { items } = await promotions.getAllPromotions()

    const matchedPromotionsByTypeAndDate = items.filter(
      (item: GetAllBenefitsResponseItem) =>
        new Date(item.endDate).getTime() === endDate.getTime() &&
        item.description === `Type ${promotionType}`
    )

    // create new promotion and add coupon to it
    if (!matchedPromotionsByTypeAndDate.length) {
      const createPromotionPayload = createOrUpdatePromotion({
        idCalculatorConfiguration: null,
        beginDateUtc: date.toISOString(),
        endDateUtc: endDate.toISOString(),
        promotionType,
        ...(promotionType === 0 && { nominalDiscountValue: promotionValue }),
        ...(promotionType === 1 && { percentualDiscountValue: promotionValue }),
        ...(promotionType === 2 && {
          percentualShippingDiscountValue: 100,
        }),
        utmCampaign,
      })

      await promotions.createOrUpdatePromotion(createPromotionPayload)

      ctx.status = 201
      ctx.body = couponCode
    }

    for (const matchedPromotion of matchedPromotionsByTypeAndDate) {
      const promotionDetails = await promotions.getPromotionById(
        matchedPromotion.idCalculatorConfiguration
      )

      const updatePromotionPayload = createOrUpdatePromotion({
        ...promotionDetails,
        promotionType,
        utmCampaign: `${promotionDetails.utmCampaign},${utmCampaign}`,
      })

      if (
        (promotionDetails.percentualShippingDiscountValue === 100 &&
          promotionType === 2) ||
        (promotionDetails.nominalDiscountValue === promotionValue &&
          promotionType === 0) ||
        (promotionDetails.percentualDiscountValue === promotionValue &&
          promotionType === 1)
      ) {
        await promotions.createOrUpdatePromotion(updatePromotionPayload)

        break
      }

      // if it gets here then no promotion matching the endDate, type, value was found
      // create a new one and add the coupon to it

      const createPromotionPayload = createOrUpdatePromotion({
        idCalculatorConfiguration: null,
        beginDateUtc: date.toISOString(),
        endDateUtc: endDate.toISOString(),
        promotionType,
        ...(promotionType === 0 && { nominalDiscountValue: promotionValue }),
        ...(promotionType === 1 && { percentualDiscountValue: promotionValue }),
        ...(promotionType === 2 && {
          percentualShippingDiscountValue: 100,
        }),
        utmCampaign,
      })

      await promotions.createOrUpdatePromotion(createPromotionPayload)
    }

    ctx.status = 201
    ctx.body = couponCode
  } catch (error) {
    logger.error({
      subject: `Failed to generate coupon`,
      messaage: formatError(error),
    })

    ctx.status = 500
  }

  await next()
}
