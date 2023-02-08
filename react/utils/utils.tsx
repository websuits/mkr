import axios from 'axios'

export const getFullCategoryTree = () => {
  const url = window.location.protocol + "//" + window.location.host + "/api/catalog_system/pub/category/tree/100"

  return axios.get(url);
}
export const addItemToCartContent = (item: any, cart: Array<any>) => {
    let resultCart = [...cart];
    if (resultCart.some(cartItem => cartItem.itemId == item.itemId)) {
        resultCart.forEach(cartItem => {
            if (cartItem.itemId == item.itemId) {
                resultCart[cart.indexOf(cartItem)] = item;
            }
        });
    } else {
        resultCart.push(item);
    }
    saveCartToLocalStorage(resultCart);
    return resultCart;
};

export const removeItemFromCart = (item: any, cart: Array<any>) => {
    let resultCart = [...cart];
    cart.forEach(cartItem => {
        if (cartItem.itemId == item.itemId) {
            resultCart.splice(cart.indexOf(cartItem), 1);
        }
    });

    saveCartToLocalStorage(resultCart);
    return resultCart;
};

export const getVaraitionDetails = (items: Array<any>) => {
    let details: any = {};
    items.forEach((item: any) => {
        details[item.productId] = {
            "category_name": item.category,
            "category": item.category,
            "value": item.price * 0.01
        }
    });
    return details;
}

export const getCartChange = (products: Array<any>, cart: Array<any>) => {
    let removeItems: any = [];

    cart.forEach(cartItem => {
        if (!products.some(prod => prod.id === cartItem.itemId)) {
            removeItems.push(cartItem);
        }
    });
    return removeItems !== [] ? removeItems : false;
};

export const getVariationStock = (varaitionList: Array<any>) => {
    let stock: any = {};
    varaitionList.forEach(item => {
        stock[item.itemId] = item.sellers.some((offer: any) => offer.commertialOffer.AvailableQuantity > 0);
    });
    return stock;
};

export const getCategoryList = (categoryTree: Array<any>, belongId: string) => {
    let categoryList: Array<any> = [];

    categoryTree.forEach(category => {
        if (category.id == belongId)
            categoryList.push({
                "id": category.id,
                "name": category.name,
                "parent": getCategoryParentId(category.name, categoryTree),
                "breadcrumb": categoryTree.length > 0 && getCategoryParentId(category.name, categoryTree) !== false
                    ? getCategoryBreadcrumb(categoryTree, category.name)
                    : []
            })
    });

    return categoryList
};

export const clearCartFromLocalStorage = () => {
    window.localStorage.removeItem("cartContent");
};

export const getCartFromLocalStorage = () => {
    return JSON.parse(window.localStorage.getItem("cartContent") || "[]");
};

export const saveCartToLocalStorage = (cart: Array<any>) => {
    window.localStorage.setItem("cartContent", JSON.stringify(cart));
};

const getCategoryParentId = (name: string, categoryTree: Array<any>) => {
    let id;
    for (let i = 0; i < categoryTree.length; i++) {
      const category = categoryTree[i]
      if (!category.href.replace(/[-_]/g, ' ').includes(name.toLowerCase())) {
          id = category.id
          break;
      }
    }
    return id || false;
}

const getCategoryBreadcrumb = (categoryList: Array<any>, name: string) => {
    let list: Array<any> = [];
    if (categoryList.length > 0) {
        categoryList.forEach((category: any) => {
            if (!category.href.includes(name))
                list.push({
                    id: category.id,
                    name: category.name,
                    parent: getCategoryParentId(category.name, categoryList)
                })
        })
    }
    return list.slice(1);
};

export const getCategorytFromProducList = (productList: Array<any>) => {
    let categoryList: any = [];
    productList.forEach(product => {
        if (product.categories.length > categoryList.length) {
            categoryList = product.categories;
        }
    });
    return categoryList;
};

export const normalizeDiacritics = (line: string): string => {
  const mapRepl: { [key: string]: string } = {
    ă: 'a',
    â: 'a',
    ş: 's',
    ș: 's',
    ț: 't',
    î: 'i',
  }
  const regx = new RegExp(Object.keys(mapRepl).join('|'), 'gi')
  return line.replace(regx, matched => mapRepl[matched.toLowerCase()])
}

export const normalizePath = ():string[] => {
  const path = normalizeDiacritics(decodeURI(window.location.pathname).replace(/[-_]/g, ' ')).toLowerCase();
  return path.split('/').filter((v) => v.length != 0 && (!['ro', 'en gb'].includes(v)))
}

export const getCategory = () => {
  const url = normalizePath()

  console.log("URL is ", url);

  let q = [...window.categoryTree.map((categ: any) => ({
    name: categ.name,
    id: categ.id,
    url: categ.url,
    children: categ.children
  }))]

  console.log("Category tree is ", q)

  let breadcrumbs: any[] = []
  let parent = false

  url.forEach(path => {
    while(q && q.length > 0) {
      const current = q.pop()
      if (normalizeDiacritics(current.name).toLowerCase() === path.toLocaleLowerCase()) {

        breadcrumbs.push({
          name: current.name,
          id: current.id,
          url: current.url,
          parent
        })

        parent = current.id
        q = [...current.children]
        break;
      }
    }
  })

  return {
    ...breadcrumbs[breadcrumbs.length -1],
    breadcrumb: breadcrumbs.slice(0, -1).map(((b: any) => { delete b.url; return b}))
  }
}
