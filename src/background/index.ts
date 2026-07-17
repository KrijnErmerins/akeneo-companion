import type { AkeneoCredentials, ExtensionMessage, ExtensionResponse, FamilyAttribute, FamilyAttributesResponse, ProductLookupResult } from '../types/akeneo'
import { getFamilyAttributes, lookupProduct } from './akeneo'
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
const CACHE_TTL_MS = 5 * 60 * 1000

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
        sendResponse({ success: true, data: cached.data })
        return false
      }
      loadCredentials()
        .then((creds) => lookupProduct(message.sku!, creds))
        .then((data) => {
          productCache.set(cacheKey, { data, expires: Date.now() + CACHE_TTL_MS })
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

    sendResponse({ success: false, error: 'Invalid message' })
    return false
  },
)
