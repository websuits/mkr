interface AppSettings {
  status: boolean
  trackingKey: string
  restApiKey: string
  customerId: string
  productSpecificationMappings: ProductSpecificationMapping
  cronSettings: CronItem
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
