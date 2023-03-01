import { canUseDOM } from 'vtex.render-runtime'

import type {
  PixelMessage,
  SearchPageInfoData,
  AddToCartData,
  RemoveToCartData,
  ProductOrder,
  ProductViewData,
  OrderPlacedData,
} from './typings/events'
import push from './modules/push'

export function handleEvents(e: PixelMessage) {
  switch (e.data.eventName) {
    case 'vtex:productView': {
      const { productId } = (e.data as ProductViewData).product

      const data = {
        event: '__sm__view_product',
        product_id: productId,
      }

      push(data)

      return
    }

    case 'vtex:addToCart': {
      const { items } = e.data as AddToCartData

      const data = {
        event: '__sm__add_to_cart',
        product_id: items[0].productId,
        quantity: items[0].quantity,
        variation: {
          id: items[0].skuId,
          sku: items[0].variant,
        },
      }

      push(data)

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

      push(data)

      break
    }

    case 'vtex:pageInfo': {
      const { eventType } = e.data

      switch (eventType) {
        case 'homeView': {
          push({
            event: '__sm__view_homepage',
          })

          break
        }

        case 'categoryView': {
          const data = e.data as SearchPageInfoData

          push({
            event: '__sm__view_category',
            category: data.category?.name,
          })
          break
        }

        case 'emptySearchView':

        // eslint-disable-next-line no-fallthrough
        case 'internalSiteSearchView': {
          const data = e.data as SearchPageInfoData

          push({
            event: '__sm__search',
            search_term: data.search?.term,
          })

          break
        }

        default: {
          break
        }
      }

      break
    }

    case 'vtex:cartLoaded': {
      push({
        event: '__sm__initiate_checkout',
      })

      break
    }

    case 'vtex:userData': {
      if (e.data.isAuthenticated) {
        push({
          event: '__sm__set_email',
          email_address: e.data.email,
          firstname: e.data.firstName,
          lastname: e.data.lastName,
        })
      }

      break
    }

    case 'vtex:email': {
      push({
        event: '__sm__set_email',
      })

      break
    }

    case 'vtex:orderPlaced': {
      const data = e.data as OrderPlacedData

      const saveOrderEvent: any = {
        event: '__sm__order',
        number: data.ordersInOrderGroup[0],
        email_address: data.visitorContactInfo[0],
        phone: data.visitorContactPhone,
        firstname: data.visitorContactInfo[1],
        lastname: data.visitorContactInfo[2],
        city: data.visitorAddressCity,
        county: data.visitorAddressState,
        address:
          `${e.data.visitorAddressStreet} ${e.data.visitorAddressNumber}`.trim(),
        discount_value: data.transactionDiscounts,
        discount_code: data.coupon ?? '',
        shipping: data.transactionShipping,
        tax: data.transactionTax,
        total_value: data.transactionTotal,
      }

      const products: Array<{
        product_id: number
        price: number
        quantity: number
        variation_sku: string
      }> = []

      e.data.transactionProducts.forEach((product: ProductOrder) => {
        products.push({
          product_id: Number(product.id),
          price: Number(product.price),
          quantity: product.quantity,
          variation_sku: product.skuName,
        })
      })

      push(saveOrderEvent)

      break
    }

    // eslint-disable-next-line no-fallthrough
    default: {
      break
    }
  }
}

if (canUseDOM) {
  window.addEventListener('message', handleEvents)
}
