import type { FixedPrices, Price } from '../typings/pricing'

export const getPrice = (prices: Price) => {
  let price = null

  prices?.fixedPrices?.forEach((fixedPrice: FixedPrices) => {
    const currDate = new Date().getTime()

    const from = fixedPrice?.dateRange?.from
      ? new Date(fixedPrice?.dateRange?.from).getTime()
      : null

    const to = fixedPrice?.dateRange?.to
      ? new Date(fixedPrice?.dateRange?.to).getTime()
      : null

    if (!from || !to || (from < currDate && currDate < to)) {
      price = fixedPrice?.listPrice
        ? fixedPrice.listPrice.toFixed(2)
        : fixedPrice.value.toFixed(2)
    }
  })

  if (!price) {
    price = prices?.listPrice
      ? prices?.listPrice?.toFixed(2)
      : prices?.basePrice.toFixed(2)
  }

  return {
    price,
    costPrice: prices?.costPrice?.toFixed(2) ?? price,
  }
}
