export interface StockInfo {
  warehouseId: string
  warehouseName: string
  totalQuantity: number
  reservedQuantity: number
  hasUnlimitedQuantity: number
}

export interface InventoryBySkuResponse {
  skuId: string
  balance: [StockInfo]
}
