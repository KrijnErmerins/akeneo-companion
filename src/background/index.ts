import type { AkeneoCredentials, AttributeValue, ExtensionMessage, ExtensionResponse, FamilyAttribute, FamilyAttributesResponse, ProductLookupResult } from '../types/akeneo'
import { getAttributeOptions, getAttributeTypes, getFamilyAttributes, lookupProduct } from './akeneo'
import { credentials as buildTimeCredentials } from './credentials'
import { checkForUpdate } from './update-checker'

checkForUpdate()

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install' && buildTimeCredentials.baseUrl) {
    chrome.storage.local.get('credentials', ({ credentials }) => {
      if (!credentials) {
        chrome.storage.local.set({ credentials: buildTimeCredentials })
      }
    })
  }
})

const productCache = new Map<string, { data: ProductLookupResult; expires: number }>()
const familyCache = new Map<string, { data: FamilyAttribute[]; expires: number }>()
const attributeTypeCache = new Map<string, { data: Map<string, string>; expires: number }>()
const attributeOptionsCache = new Map<string, { data: Map<string, Record<string, string>>; expires: number }>()
const CACHE_TTL_MS = 5 * 60 * 1000

function isFilled(values: AttributeValue[] | undefined, locale?: string): boolean {
  if (!values) return false
  const match = values.find((v) => v.locale === (locale ?? null)) ?? values.find((v) => v.locale === null) ?? values[0]
  const data = match?.data
  return data !== null && data !== undefined && data !== '' && !(Array.isArray(data) && data.length === 0)
}

function updateBadge(product: ProductLookupResult, locale?: string): void {
  const entries = Object.values(product.values)
  if (entries.length === 0) {
    chrome.action.setBadgeText({ text: '' })
    return
  }
  const filled = entries.filter((v) => isFilled(v, locale)).length
  const pct = Math.round((filled / entries.length) * 100)
  const color = pct >= 80 ? '#22C55E' : pct >= 50 ? '#F59E0B' : '#DC2626'
  chrome.action.setBadgeText({ text: `${pct}%` })
  chrome.action.setBadgeBackgroundColor({ color })
}

function loadCredentials(): Promise<AkeneoCredentials> {
  return new Promise((resolve) => {
    chrome.storage.local.get('credentials', ({ credentials }) => {
      resolve((credentials as AkeneoCredentials | undefined) ?? buildTimeCredentials)
    })
  })
}

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse: (r: ExtensionResponse | FamilyAttributesResponse) => void) => {
    if (message.type === 'GET_PRODUCT') {
      if (!message.sku) {
        sendResponse({ success: false, error: 'Invalid message' })
        return false
      }
      const cacheKey = `${message.sku}:${message.locale ?? ''}`
      const cached = productCache.get(cacheKey)
      if (cached && cached.expires > Date.now()) {
        updateBadge(cached.data, message.locale)
        sendResponse({ success: true, data: cached.data })
        return false
      }
      loadCredentials()
        .then((creds) => lookupProduct(message.sku!, creds))
        .then((data) => {
          productCache.set(cacheKey, { data, expires: Date.now() + CACHE_TTL_MS })
          updateBadge(data, message.locale)
          sendResponse({ success: true, data })
        })
        .catch((err) => sendResponse({ success: false, error: (err as Error).message }))
      return true
    }

    if (message.type === 'GET_FAMILY_ATTRIBUTES') {
      if (!message.familyCode) {
        sendResponse({ success: false, error: 'Missing familyCode' })
        return false
      }
      const cached = familyCache.get(message.familyCode)
      if (cached && cached.expires > Date.now()) {
        sendResponse({ success: true, data: cached.data })
        return false
      }
      loadCredentials()
        .then((creds) => getFamilyAttributes(message.familyCode!, creds))
        .then((data) => {
          familyCache.set(message.familyCode!, { data, expires: Date.now() + CACHE_TTL_MS })
          sendResponse({ success: true, data })
        })
        .catch((err) => sendResponse({ success: false, error: (err as Error).message }))
      return true
    }

    if (message.type === 'GET_ATTRIBUTE_TYPES') {
      if (!message.familyCode) {
        sendResponse({ success: false, error: 'Missing familyCode' })
        return false
      }
      const cached = attributeTypeCache.get(message.familyCode)
      if (cached && cached.expires > Date.now()) {
        sendResponse({ success: true, data: cached.data as unknown as FamilyAttribute[] })
        return false
      }
      loadCredentials()
        .then((creds) => getAttributeTypes(message.familyCode!, creds))
        .then((data) => {
          attributeTypeCache.set(message.familyCode!, { data, expires: Date.now() + CACHE_TTL_MS })
          sendResponse({ success: true, data: data as unknown as FamilyAttribute[] })
        })
        .catch((err) => sendResponse({ success: false, error: (err as Error).message }))
      return true
    }

    if (message.type === 'GET_ATTRIBUTE_OPTIONS') {
      if (!message.attributeCode) {
        sendResponse({ success: false, error: 'Missing attributeCode' })
        return false
      }
      const cached = attributeOptionsCache.get(message.attributeCode)
      if (cached && cached.expires > Date.now()) {
        sendResponse({ success: true, data: cached.data as unknown as FamilyAttribute[] })
        return false
      }
      loadCredentials()
        .then((creds) => getAttributeOptions(message.attributeCode!, creds))
        .then((data) => {
          attributeOptionsCache.set(message.attributeCode!, { data, expires: Date.now() + CACHE_TTL_MS })
          sendResponse({ success: true, data: data as unknown as FamilyAttribute[] })
        })
        .catch((err) => sendResponse({ success: false, error: (err as Error).message }))
      return true
    }

    sendResponse({ success: false, error: 'Invalid message' })
    return false
  },
)
