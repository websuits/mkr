import { toLower } from 'ramda'

import type { Address } from '../typings/oms'

export const isAtLeastOneValueUndefined = (values: any): boolean => {
  return values.includes(undefined) || values.includes(null)
}

export const formatNumber = (value: number | undefined): string => {
  if (value === 0 || value === undefined) {
    return '0.00'
  }

  return (value / 100).toFixed(2)
}

export const formatAddress = (address: Address | undefined | null): string => {
  if (!address) {
    return 'N/A'
  }

  return address?.street + (address?.number ? `, ${address.number}` : '')
}

const from =
  'ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆÍÌÎÏŇÑÓÖÒÔÕØŘŔŠŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇíìîïňñóöòôõøðřŕšťúůüùûýÿžþÞĐđßÆa·/_,:;'

const to =
  'AAAAAACCCDEEEEEEEEIIIINNOOOOOORRSTUUUUUYYZaaaaaacccdeeeeeeeeiiiinnooooooorrstuuuuuyyzbBDdBAa------'

const removeAccents = (str: string) => {
  let newStr = str.slice(0)

  for (let i = 0; i < from.length; i++) {
    newStr = newStr.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
  }

  return newStr
}

export function catalogSlugify(str: string) {
  const replaced = str.replace(/[*+~.()'"!:@&[\]`,/ %$#?{}|><=_^]/g, '-')

  return toLower(removeAccents(replaced))
}
