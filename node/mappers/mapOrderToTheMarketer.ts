/* eslint-disable max-params */
import type { Order, OrderItem } from '../typings/oms'
import {
  formatDateToCreatedAt,
  formatNumber,
  isAtLeastOneValueUndefined,
} from '../utils'

export const mapOrderToTheMarketer = (
  order: Order,
  orderList: Array<{ orderId: string; status: string }>,
  baseUrl: string,
  totalRefundedValue: string
): TheMarketerOrder => {
  const orderStatus = orderList.find(
    (item: { status: string; orderId: string }) =>
      order.orderId === item.orderId
  )?.status

  const totalValue = order.totals.find(
    (item: { id: string; value: number }) => item.id === 'Items'
  )?.value

  const discountValue = order.totals.find(
    (item: { id: string; value: number }) => item.id === 'Discounts'
  )?.value

  const shippingValue = order.totals.find(
    (item: { id: string; value: number }) => item.id === 'Shipping'
  )?.value

  // it will never get here, added just for Typescript
  if (
    isAtLeastOneValueUndefined([
      orderStatus,
      totalValue,
      discountValue,
      shippingValue,
    ])
  ) {
    throw new TypeError(
      `These values should always be present for ${order.orderId}`
    )
  }

  return {
    order_no: order.orderId,
    order_status: orderStatus,
    refund_value: totalRefundedValue,
    created_at: formatDateToCreatedAt(order.creationDate),
    firstname: order.clientProfileData.firstName,
    lastname: order.clientProfileData.lastName,
    email_address: order.clientProfileData.email,
    phone: order.clientProfileData.phone,
    discount_code: order.marketingData?.coupon ?? '',
    discount_value: formatNumber(discountValue),
    shipping_price: formatNumber(shippingValue),
    total_value: formatNumber(totalValue),
    products: order.items.map((item: OrderItem) => {
      return {
        id: item.productId as string,
        sku: item.id,
        name: item.name,
        url: `${baseUrl}${item.detailUrl}`,
        main_image: item.imageUrl ?? '',
        category: item.additionalInfo.categories
          .reverse()
          .map((category: { id: number; name: string }) => category.name)
          .join('|'),
        brand: item.additionalInfo.brandName,
        variation_id: item.id,
        variation_sku: item.ean ?? '',
        quantity: item.quantity,
        price: formatNumber(item.price),
        sale_price: formatNumber(item.sellingPrice),
      }
    }),
  }
}
