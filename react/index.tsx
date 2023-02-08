import { canUseDOM } from 'vtex.render-runtime'

import { sendEnhancedEcommerceEvents } from './modules/enhancedEcommerceEvents'
import { sendExtraEvents } from './modules/extraEvents'
import { sendLegacyEvents } from './modules/legacyEvents'
import { PixelMessage } from './typings/events'
import {
  addItemToCartContent,
  removeItemFromCart,
  getVaraitionDetails,
  getCartChange,
  clearCartFromLocalStorage,
  getVariationStock,
  getCategoryList,
  getCartFromLocalStorage,
  saveCartToLocalStorage,
  getFullCategoryTree,
  getCategory
} from './utils/utils';

// no-op for extension point
export default function () {
  return null
}

export function handleEvents(e: PixelMessage) {
  sendEnhancedEcommerceEvents(e)
  sendExtraEvents(e)
  sendLegacyEvents(e)

  var _ra: any = window._ra;
  if (_ra && _ra.ready) {
    let cartContent = getCartFromLocalStorage();
    switch (e.data.eventName) {
      case 'vtex:userData': {
        if (e.data.isAuthenticated) {
          _ra.setEmail({
            "email": e.data.email,
            "name": e.data.firstName + ' ' + e.data.lastName,
            "phone": e.data.phone,
          })
        }
        break
      }
      case 'vtex:addToCart': {
        const { items } = e.data;
        let itemId = items[0].productId;
        let quantity = items[0].quantity;
        let details = getVaraitionDetails(items);

        let variation = {
          "code": items[0].productRefId,
          "stock": true,
          "details": details
        };

        addItemToCartContent({ itemId, quantity, variation }, cartContent);
        _ra.addToCart(itemId, quantity, variation);

        break
      }
      case 'vtex:categoryView': {
        const categoryData = getCategory()

        console.log("Category View ", categoryData)
        _ra.sendCategory(categoryData);
        break
      }
      case 'vtex:departmentView': {
        // Category without parent
        const categoryData = getCategory();
        console.log("Department View ", categoryData)

        _ra.sendCategory(categoryData);

        break
      }
      case 'vtex:cartChanged': {
        const { items } = e.data;
        let checkoutIds: any = [];

        items.map((product: any) => {
          checkoutIds.push(product.productId);
        });

        cartContent.forEach((cartItem: any) => {
          if (!checkoutIds.some((id: any) => id === cartItem.itemId)) {
            cartContent.splice(cartContent.indexOf(cartItem), 1);
          }
        });

        saveCartToLocalStorage(cartContent);

        if (checkoutIds.length > 0) _ra.checkoutIds(checkoutIds)

        break
      }



      case 'vtex:orderPlaced': {
        let saveOrderInfo = {
          'order_no': e.data.transactionId,
          'lastname': e.data.visitorContactInfo[1],
          'firstname': e.data.visitorContactInfo[2],
          'email': e.data.visitorContactInfo[0],
          'phone': e.data.visitorContactPhone,
          'state': e.data.visitorAddressState,
          'city': e.data.visitorAddressCity,
          'address': e.data.visitorAddressStreet + ' ' + e.data.visitorAddressNumber,
          'discount_code': "",
          'discount': e.data.transactionDiscounts,
          'shipping': e.data.transactionShipping,
          'rebates': 0,
          'fees': e.data.transactionTax,
          'total': e.data.transactionTotal
        };

        let saveOrderProducts: any = [];

        e.data.transactionProducts.map((product: any) => {
          saveOrderProducts.push({ id: product.id, quantity: product.quantity, price: product.price, variation_code: product.skuName })
        });

        let itemsRemoveFromCart: any = getCartChange(saveOrderProducts, cartContent);

        if (itemsRemoveFromCart) {
          itemsRemoveFromCart.forEach((removeItem: any) => {
            _ra.removeFromCart(removeItem.itemId, removeItem.quantity, removeItem.variation);
          });
        };

        _ra.saveOrder(saveOrderInfo, saveOrderProducts);
        clearCartFromLocalStorage();
        break;
      }

      case 'vtex:productView': {
        const { product } = e.data;
        const prodData = {
          "id": product.productId,
          "name": product.productName,
          "url": window.location.href,
          "img": product.selectedSku.imageUrl,
          "price": product.selectedSku.sellers[0].commertialOffer.Price,
          "promo": 0,
          "stock": product.selectedSku.sellers[0].commertialOffer.AvailableQuantity,
          "brand": {
            "id": product.brandId,
            "name": product.brand
          },
          "category": getCategoryList(product.categoryTree.reverse(), product.categoryId),
          "inventory": {
            "variations": product.items.length > 1,
            "stock": product.items.length > 1
              ? getVariationStock(product.items)
              : product.items[0].sellers.some((offer: any) => offer.commertialOffer.AvailableQuantity > 0)
          }
        }
        _ra.sendProduct(prodData);
        break
      }
      case "vtex:removeFromCart": {
        const { items } = e.data;

        let itemId = items[0].productId;
        let quantity = items[0].quantity;
        let details = getVaraitionDetails(items)

        let variation = {
          "code": items[0].productRefId,
          "stock": true,
          "details": details
        };

        removeItemFromCart({ itemId, quantity, variation }, cartContent);
        _ra.removeFromCart(itemId, quantity, variation);
      }
      default: break
    }
  }
}

if (canUseDOM) {
  window.addEventListener('message', handleEvents)

  if (!window.categoryTree) {
    getFullCategoryTree()
      .then((({data}) => window.categoryTree = data))
      .catch(e => console.log(e));
  }
}
