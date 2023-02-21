interface AppSettings {
  status: boolean
  trackingKey: string
  restApiKey: string
  customerId: string
  productSpecificationMappings: ProductSpecificationMapping
}

interface ProductSpecificationMapping {
  color: string
  size: string
}
