interface AppSettings {
  status: boolean
  trackingKey: string
  restApiKey: string
  customerId: string
  productSpecificationMappings: ProductSpecificationMapping
  enableProductReviewsImport: boolean
  cronSettings: CronItem
  doubleOptIn: boolean
  stockManagement: string
  searchBoxId?: string
}

interface ProductSpecificationMapping {
  color: string
  size: string
}

interface CronItem {
  brandsCron: string
  categoriesCron: string
  productsCron: string
}
