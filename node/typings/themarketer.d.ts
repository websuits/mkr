interface TheMarketerOrders {
  orders: TheMarketerOrder[]
}

interface TheMarketerOrder {
  order_no: string
  order_status: string | undefined
  refund_value: string
  created_at: string
  firstname: string
  lastname: string
  email_address: string
  phone: string
  discount_code: string
  discount_value: string
  shipping_price: string
  total_value: string
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

interface TheMarketerFeedProductItem {
  id: number
  sku: number
  name: string
  description: string
  url: string
  category: string
  brand: string
  acquisiton_price?: string
  price: string
  sale_price: string
  sale_price_start_date?: string
  sale_price_end_date?: string
  availability: number
  stock: number
  media_gallery: strings[]
  variations: Variation[]
  created_at: string
}

interface Variation {
  id: string
  sku: number
  acquisiton_price?: string
  price: string
  sale_price: string
  size: string
  color: string
  availability: number
  stock: number
}

interface TheMarketerSubscriberUser {
  email: string
  name?: string
  phone?: string
}

interface TheMarketerProductReviews {
  reviews: {
    review: Review | Review[] | string
  }
}

interface Review {
  review_id: string
  review_date: string
  review_author: string
  rating: string
  product_id: string
  product_sku: string
  review_text: string
}
