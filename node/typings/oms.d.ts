interface ListOrdersResponse {
  list: Array<{ orderId: string; status: string }>
}

interface Order {
  followUpEmail?: string
  orderId: string
  clientProfileData: ClientProfileData
  creationDate: string
  items: OrderItem[]
  value: number
  totals: Total[]
  status: string
  statusDescription: string
  sequence: string
  salesChannel: string
  affiliateId: string | null
  origin: string | null
  authorizedDate: string | null
  invoicedDate: string | null
  marketingData?: MarketingData
  shippingData: ShippingData
  paymentData: PaymentData
  checkedInPickupPointId: number
  fulfillment?: Fulfillment
  customData: { customApps: any[] }
}

interface ShippingData {
  availableAddresses?: Address[] | null
  selectedAddress?: Address | null
  address?: Address | null
  completed?: boolean
  addressAlternative?: Address | null
}

export interface Address {
  addressId: string
  addressType: string
  city: string
  complement?: string
  country: string
  geoCoordinates: GeoCoordinates
  isDisposable?: boolean
  neighborhood: string
  number?: string
  postalCode: string
  receiverName: string
  reference?: string
  state: string
  street: string
  completed?: boolean
  selectedSlaId?: string
}

interface GeoCoordinates {
  latitude: string
  longitude: string
}

interface ClientProfileData {
  email: string
  firstName: string
  lastName: string
  documentType: string
  document: string
  phone: string
  corporateName: string | null
  tradeName: string | null
  corporateDocument: string | null
  stateInscription: string | null
  corporatePhone: string | null
  isCorporate: boolean
  userProfileId: string | null
}

interface OrderItem {
  seller: string
  quantity: number
  description: string | null
  ean: string | null
  refId: string | null
  id: string
  productId: string
  sellingPrice: number
  listPrice: number
  price: number
  imageUrl: string | null
  detailUrl: string
  skuName: string | null
  name: string
  bundleItems: Bundle[]
  additionalInfo: ItemAdditionalInfo
}

interface ItemAdditionalInfo {
  categories: ProductCategory[]
  brandName: string
}

export type ProductCategory = {
  id: number
  name: string
}

interface Bundle {
  id: string
  attachments: Attachment[]
  name: string
  price: number
  quantity: number
  imageUrl: string | null
  measurementUnit: string
  unitMultiplier: number
}

interface Total {
  id: string
  name: string
  value: number
}

interface MarketingData {
  coupon: string
}
