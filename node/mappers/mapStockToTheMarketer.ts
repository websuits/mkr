export const mapStockToTheMarketer = (
  quantity: number,
  stockManagement: string
): number => {
  if (quantity > 0) {
    return 1
  }

  if (stockManagement === 'outOfStock') {
    return 0
  }

  if (stockManagement === 'inSupplierStock') {
    return 2
  }

  if (stockManagement === 'inStock') {
    return 1
  }

  return 1
}
