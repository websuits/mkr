export interface Price {
  itemId: number
  markup?: number
  listPrice?: number
  basePrice: number
  costPrice?: number
  fixedPrices?: FixedPrices[]
}

export interface FixedPrices {
  tradePolicyId: string
  value: number
  listPrice?: number
  minQuantity: number
  dateRange: {
    from: string
    to: string
  }
}
