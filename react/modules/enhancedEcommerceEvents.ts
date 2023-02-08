import type { AnalyticsEcommerceProduct } from '../typings/gtm'
import updateEcommerce from './updateEcommerce'
import push from './push'
import type {
  Order,
  PixelMessage,
  // ProductOrder,
  // Impression,
  CartItem,
  AddToCartData,
  RemoveToCartData,
  ProductViewData,
  // Seller,
  // ProductClickData,
  // ProductViewReferenceId,
} from '../typings/events'

export async function sendEnhancedEcommerceEvents(e: PixelMessage) {
  // eslint-disable-next-line no-console
  console.log(e.data.eventName)

  switch (e.data.eventName) {
    case 'vtex:productView': {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { productId } = (e.data as ProductViewData).product

      const data = {
        event: '__sm__view_product',
        product_id: productId,
      }

      updateEcommerce('__sm__view_product', data)

      return
    }

    case 'vtex:addToCart': {
      const { items } = e.data as AddToCartData

      // eslint-disable-next-line no-console
      console.log(e.data)

      const data = {
        event: '__sm__add_to_cart',
        product_id: items[0].productId,
        quantity: items[0].quantity,
        variation: {
          id: items[0].skuId,
          sku: items[0].variant,
        },
      }

      updateEcommerce('addToCart', data)

      break
    }

    case 'vtex:removeFromCart': {
      const { items } = e.data as RemoveToCartData

      const data = {
        event: '__sm__remove_from_cart',
        product_id: items[0].productId,
        quantity: items[0].quantity,
        variation: {
          id: items[0].skuId,
          sku: items[0].variant,
        },
      }

      updateEcommerce('removeFromCart', data)

      break
    }

    case 'vtex:cartLoaded': {
      const { orderForm } = e.data

      push({
        event: 'checkout',
        ecommerce: {
          checkout: {
            actionField: {
              step: 1,
            },
            products: orderForm.items.map(getCheckoutProductObjectData),
          },
        },
      })

      break
    }

    case 'vtex:orderPlaced': {
      const order = e.data

      const data = {
        event: '__sm__order',
      }

      SaveOrder(order)

      updateEcommerce('orderPlaced', data)

      break
    }

    default: {
      break
    }
  }
}

function SaveOrder(order: Order) {
  fetch('https://api.themarketer.com/api/v1/save_order', {
    method: 'POST',
    body: JSON.stringify({
      k: order.accountName,
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  })
}

// function getPurchaseObjectData(order: Order) {
//   return {
//     id: order.orderGroup,
//     affiliation: order.transactionAffiliation,
//     coupon: order.coupon ? order.coupon : null,
//     revenue: order.transactionTotal,
//     shipping: order.transactionShipping,
//     tax: order.transactionTax,
//   }
// }
//
// function getProductObjectData(product: ProductOrder) {
//   const productName = getProductNameWithoutVariant(
//     product.name,
//     product.skuName
//   )
//
//   return {
//     brand: product.brand,
//     category: product.categoryTree?.join('/'),
//     id: product.id, // Product id
//     variant: product.sku, // SKU id
//     name: productName, // Product name
//     price: product.price,
//     quantity: product.quantity,
//     dimension1: product.productRefId ?? '',
//     dimension2: product.skuRefId ?? '',
//     dimension3: product.skuName, // SKU name (only variant)
//   }
// }

// function getCategory(rawCategories: string[]) {
//   if (!rawCategories || !rawCategories.length) {
//     return
//   }
//
//   return removeStartAndEndSlash(rawCategories[0])
// }

// Transform this: "/Apparel & Accessories/Clothing/Tops/"
// To this: "Apparel & Accessories/Clothing/Tops"
// function removeStartAndEndSlash(category?: string) {
//   return category?.replace(/^\/|\/$/g, '')
// }

// function getProductImpressionObjectData(list: string) {
//   return ({ product, position }: Impression) => ({
//     brand: product.brand,
//     category: getCategory(product.categories),
//     id: product.productId, // Product id
//     variant: product.sku.itemId, // SKU id
//     list,
//     name: product.productName,
//     position,
//     price: `${product.sku.seller.commertialOffer.Price}`,
//     dimension1: product.productReference ?? '',
//     dimension2: product.sku.referenceId?.Value ?? '',
//     dimension3: product.sku.name, // SKU name (variation only)
//   })
// }

function getCheckoutProductObjectData(
  item: CartItem
): AnalyticsEcommerceProduct {
  const productName = getProductNameWithoutVariant(item.name, item.skuName)

  return {
    id: item.productId, // Product id
    variant: item.id, // SKU id
    name: productName, // Product name without variant
    category: Object.keys(item.productCategories ?? {}).reduce(
      (categories, category) =>
        categories ? `${categories}/${category}` : category,
      ''
    ),
    brand: item.additionalInfo?.brandName ?? '',
    price: item.sellingPrice / 100,
    quantity: item.quantity,
    dimension1: item.productRefId ?? '',
    dimension2: item.referenceId ?? '', // SKU reference id
    dimension3: item.skuName,
  }
}

function getProductNameWithoutVariant(
  productNameWithVariant: string,
  variant: string
) {
  const indexOfVariant = productNameWithVariant.lastIndexOf(variant)

  if (indexOfVariant === -1 || indexOfVariant === 0) {
    return productNameWithVariant
  }

  return productNameWithVariant.substring(0, indexOfVariant - 1) // Removes the variant and the whitespace
}
