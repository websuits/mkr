import type { CalculatorConfiguration } from '../typings/promotions'
import { INVOICED } from '../utils/constants'

export const createOrUpdatePromotion = ({
  idCalculatorConfiguration,
  beginDateUtc,
  endDateUtc,
  promotionType,
  nominalDiscountValue,
  percentualDiscountValue,
  percentualShippingDiscountValue,
  utmCampaign,
}: any): CalculatorConfiguration => {
  return {
    ...(idCalculatorConfiguration && { idCalculatorConfiguration }),
    name: `TheMarketer - Type ${promotionType} - ${endDateUtc}`,
    description: `Type ${promotionType}`,
    beginDateUtc,
    endDateUtc,
    daysAgoOfPurchases: 0,
    isActive: true,
    isArchived: false,
    isFeatured: false,
    activeDaysOfWeek: [],
    activateGiftsMultiplier: false,
    cumulative: true,
    nominalShippingDiscountValue: 0.0,
    absoluteShippingDiscountValue: 0.0,
    nominalDiscountValue,
    maximumUnitPriceDiscount: 0.0,
    percentualDiscountValue,
    rebatePercentualDiscountValue: 0.0,
    percentualShippingDiscountValue,
    percentualTax: 0.0,
    shippingPercentualTax: 0.0,
    percentualDiscountValueList1: 0.0,
    percentualDiscountValueList2: 0.0,
    skusGift: {
      quantitySelectable: 1,
    },
    nominalRewardValue: 0.0,
    percentualRewardValue: 0.0,
    orderStatusRewardValue: INVOICED,
    maxNumberOfAffectedItems: 0,
    maxNumberOfAffectedItemsGroupKey: 'perCart',
    applyToAllShippings: false,
    nominalTax: 0.0,
    origin: 'Marketplace',
    idSellerIsInclusive: true,
    idsSalesChannel: ['1'],
    areSalesChannelIdsExclusive: false,
    marketingTags: [],
    marketingTagsAreNotInclusive: false,
    paymentsMethods: [],
    stores: [],
    campaigns: [],
    storesAreInclusive: true,
    categories: [],
    categoriesAreInclusive: true,
    brands: [],
    brandsAreInclusive: true,
    products: [],
    productsAreInclusive: true,
    skusAreInclusive: true,
    utmCampaign,
    collections1BuyTogether: [],
    minimumQuantityBuyTogether: 0,
    quantityToAffectBuyTogether: 0,
    enableBuyTogetherPerSku: false,
    listSku1BuyTogether: [],
    listSku2BuyTogether: [],
    totalValueFloor: 0.0,
    totalValueCeling: 0.0,
    totalValueIncludeAllItems: false,
    totalValueMode: 'IncludeMatchedItems',
    collections: [],
    collectionsIsInclusive: true,
    restrictionsBins: [],
    totalValuePurchase: 0.0,
    slasIds: [],
    isSlaSelected: false,
    isFirstBuy: false,
    firstBuyIsProfileOptimistic: true,
    compareListPriceAndPrice: false,
    isDifferentListPriceAndPrice: false,
    zipCodeRanges: [],
    itemMaxPrice: 0.0,
    itemMinPrice: 0.0,
    installment: 0,
    isMinMaxInstallments: false,
    minInstallment: 0,
    maxInstallment: 0,
    clusterExpressions: [],
    giftListTypes: [],
    affiliates: [],
    maxUsage: 0,
    maxUsagePerClient: 1,
    multipleUsePerClient: false,
    accumulateWithManualPrice: false,
    type: 'regular',
  }
}
