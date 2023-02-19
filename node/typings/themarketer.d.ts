interface TheMarketerOrders {
  orders: TheMarketerOrder[]
}

interface TheMarketerOrder {
  order_no: string
  order_status: string | undefined
  refund_value: string
  created_at: string
  first_name: string
  last_name: string
  city: string
  county: string
  address: string
  customer_email: string
  phone: string
  discount_code: string
  discount_value: string
  shipping_price: string
  total_value: string
  tax: string
  products: Product[]
}

interface Product {
  id: string
  sku: string
  name: string
  url: string
  main_image: string
  category: string
  brand: string
  variation_id: string
  variation_sku: string
  quantity: number
  price: string
  sale_price: string
}

interface TheMarketerFeedCategoryItem {
  id: string
  name: string
  url: string
  hierarchy: string
}
