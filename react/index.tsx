import type {
  PixelMessage,
  SearchPageInfoData,
  AddToCartData,
  RemoveToCartData,
} from './typings/events'
import push from './modules/push'

export function handleEvents(e: PixelMessage) {
  switch (e.data.eventName) {
    case 'vtex:productView': {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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
      const saveOrderInfo = {
        event: '__sm__order',
        number: e.data.transactionId,
        email: e.data.visitorContactInfo[0],
        phone: e.data.visitorContactPhone,
        firstname: e.data.visitorContactInfo[2],
        lastname: e.data.visitorContactInfo[1],
        city: e.data.visitorAddressCity,
        county: e.data.visitorAddressState,
        address: `${e.data.visitorAddressStreet} ${e.data.visitorAddressNumber}`,
        discount_value: e.data.transactionDiscounts,
        discount_code: '',
        shipping: e.data.transactionShipping,
        fees: e.data.transactionTax,
        total: e.data.transactionTotal,
      }

      const products: any = []

      // eslint-disable-next-line array-callback-return
      e.data.transactionProducts.map((product: any) => {
        products.push({
          product_id: product.id,
          price: product.price,
          quantity: product.quantity,
          variation_sku: product.skuName,
        })
      })

      const content = {
        saveOrderInfo,
        products,
      }

      push(content)

      break
    }

    // eslint-disable-next-line no-fallthrough
    default: {
      break
    }
  }
}
