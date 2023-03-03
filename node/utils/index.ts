import { toLower } from 'ramda'

export const isAtLeastOneValueUndefined = (values: any): boolean => {
  return values.includes(undefined) || values.includes(null)
}

export const formatNumber = (value: number | undefined): string => {
  if (value === 0 || value === undefined) {
    return '0.00'
  }

  return (value / 100).toFixed(2)
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

export function formatDateToReviewerDate(dateValue: string): string {
  const date = new Date(dateValue)

  const year = date.toLocaleString('default', { year: 'numeric' })
  const month = date.toLocaleString('default', { month: '2-digit' })
  const day = date.toLocaleString('default', { day: '2-digit' })
  const hour = date.toLocaleString('default', {
    hour: '2-digit',
    hour12: false,
  })

  const minute = date
    .toLocaleString('default', { minute: '2-digit' })
    .padStart(2, '0')

  const second = date
    .toLocaleString('default', { second: '2-digit' })
    .padStart(2, '0')

  return `${month}/${day}/${year} ${hour}:${minute}:${second}`
}

export function formatDateToCreatedAt(dateValue: string): string {
  const date = new Date(dateValue)

  const year = date.toLocaleString('default', { year: 'numeric' })
  const month = date.toLocaleString('default', { month: '2-digit' })
  const day = date.toLocaleString('default', { day: '2-digit' })
  const hour = date.toLocaleString('default', {
    hour: '2-digit',
    hour12: false,
  })

  const minute = date
    .toLocaleString('default', { minute: '2-digit' })
    .padStart(2, '0')

  return `${year}-${month}-${day} ${hour}:${minute}`
}
