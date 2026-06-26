import type { AkeneoCredentials, ExtensionMessage, ExtensionResponse, ProductLookupResult } from '../types/akeneo'
import { lookupProduct } from './akeneo'
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
const CACHE_TTL_MS = 5 * 60 * 1000

function loadCredentials(): Promise<AkeneoCredentials> {
  return new Promise((resolve) => {
    chrome.storage.local.get('credentials', ({ credentials }) => {
      resolve((credentials as AkeneoCredentials | undefined) ?? buildTimeCredentials)
    })
  })
}

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse: (r: ExtensionResponse) => void) => {
    if (message.type !== 'GET_PRODUCT' || !message.sku) {
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
  },
)
