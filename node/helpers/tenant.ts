import type { Binding, TenantClient } from '@vtex/api'
import { any, startsWith } from 'ramda'

export const TENANT_CACHE_TTL_S = 60 * 10
export const STORE_PRODUCT = 'vtex-storefront'

const validBinding = (path: string) => (binding: Binding) => {
  const isStoreBinding = binding.targetProduct === STORE_PRODUCT
  const matchesPath = any(startsWith(path), [
    binding.canonicalBaseAddress,
    ...binding.alternateBaseAddresses,
  ])

  return matchesPath && isStoreBinding
}

export const getBaseUrl = async (
  path: string,
  protocol: string,
  tenant: TenantClient
) => {
  const pathWithoutWorkspace = path.replace(/^(.)+--/, '')
  const tenantInfo = await tenant.info({
    forceMaxAge: TENANT_CACHE_TTL_S,
  })

  const binding = tenantInfo.bindings.filter(validBinding(pathWithoutWorkspace))

  const [{ canonicalBaseAddress }] = binding

  const canonicalBaseAddressStripped = canonicalBaseAddress.endsWith('/')
    ? canonicalBaseAddress.slice(0, -1)
    : canonicalBaseAddress

  return `${protocol}://${canonicalBaseAddressStripped}`
}
