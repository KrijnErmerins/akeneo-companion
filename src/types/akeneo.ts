export interface AkeneoCredentials {
  baseUrl: string
  clientId: string
  clientSecret: string
  username: string
  password: string
}

export interface AkeneoToken {
  accessToken: string
  expiresAt: number
}

export interface ProductCompleteness {
  channel: string
  locale: string
  ratio: number
}

export interface AkeneoProduct {
  identifier: string
  family: string | null
  enabled: boolean
  values: Record<string, unknown>
  completenesses?: ProductCompleteness[]
}

export interface AkeneoProductModel {
  code: string
  family_variant: string
  values: Record<string, unknown>
}

export type ProductType = 'product' | 'product-model'

export interface ProductLookupResult {
  type: ProductType
  identifier: string
  family: string | null
  completenesses: ProductCompleteness[]
}

export interface ExtensionMessage {
  type: 'GET_PRODUCT' | 'SKU_DETECTED'
  sku?: string
  locale?: string
}

export interface ExtensionResponse {
  success: boolean
  data?: ProductLookupResult
  error?: string
}

// Maps domain TLD to Akeneo locale
export const DOMAIN_LOCALE_MAP: Record<string, string> = {
  nl: 'nl_NL',
  be: 'nl_BE',
  de: 'de_DE',
}
