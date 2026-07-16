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

export type AttributeValue = {
  locale: string | null
  scope: string | null
  data: unknown
}

export type ProductType = 'product' | 'product-model'

export interface ProductLookupResult {
  type: ProductType
  identifier: string
  family: string | null
  values: Record<string, AttributeValue[]>
}

export interface FamilyAttribute {
  code: string
  required: boolean
}

export interface ExtensionMessage {
  type: 'GET_PRODUCT' | 'SKU_DETECTED' | 'GET_FAMILY_ATTRIBUTES'
  sku?: string
  locale?: string
  familyCode?: string
}

export interface ExtensionResponse {
  success: boolean
  data?: ProductLookupResult
  error?: string
}

export interface FamilyAttributesResponse {
  success: boolean
  data?: FamilyAttribute[]
  error?: string
}

// Maps domain TLD to Akeneo locale
export const DOMAIN_LOCALE_MAP: Record<string, string> = {
  nl: 'nl_NL',
  be: 'nl_BE',
  de: 'de_DE',
}

// Full-hostname overrides (staging/test domains that don't have a meaningful TLD)
export const HOSTNAME_LOCALE_MAP: Record<string, string> = {
  'de.ledchampion.magento2.led.p.maxserv.io': 'de_DE',
  'de.ledchampion.magento2.led.a.maxserv.dev': 'de_DE',
}
