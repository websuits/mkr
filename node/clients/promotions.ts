import type { InstanceOptions, IOContext } from '@vtex/api'
import { JanusClient } from '@vtex/api'

import type {
  CalculatorConfiguration,
  Coupon,
  CouponResponse,
  GetAllBenefitsResponse,
} from '../typings/promotions'

export default class Promotions extends JanusClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(context, {
      ...options,
      headers: {
        VtexIdclientAutCookie: context.adminUserAuthToken ?? context.authToken,
      },
    })
  }

  public async getPromotionById(
    promotionId: string
  ): Promise<CalculatorConfiguration> {
    return this.http.get(`/api/rnb/pvt/calculatorconfiguration/${promotionId}`)
  }

  public async getAllPromotions(): Promise<GetAllBenefitsResponse> {
    return this.http.get(`/api/rnb/pvt/benefits/calculatorconfiguration`)
  }

  public async createOrUpdatePromotion(
    promotionDetils: CalculatorConfiguration
  ): Promise<CalculatorConfiguration> {
    return this.http.post(
      `/api/rnb/pvt/calculatorconfiguration`,
      promotionDetils
    )
  }

  public async createCoupon(couponDetails: Coupon): Promise<CouponResponse> {
    return this.http.post(`/api/rnb/pvt/coupon/`, couponDetails)
  }

  public async archiveCoupon(couponCode: string): Promise<CouponResponse> {
    return this.http.post(`/api/rnb/pvt/archive/coupon/${couponCode}`, null)
  }
}
