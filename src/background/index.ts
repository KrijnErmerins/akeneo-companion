import type { ExtensionMessage, ExtensionResponse, ProductLookupResult } from '../types/akeneo'
import { lookupProduct } from './akeneo'
import { credentials } from './credentials'
import { checkForUpdate } from './update-checker'

checkForUpdate()

const productCache = new Map<string, { data: ProductLookupResult; expires: number }>()
const CACHE_TTL_MS = 5 * 60 * 1000

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

    lookupProduct(message.sku!, credentials)
      .then((data) => {
        productCache.set(cacheKey, { data, expires: Date.now() + CACHE_TTL_MS })
        sendResponse({ success: true, data })
      })
      .catch((err) => sendResponse({ success: false, error: (err as Error).message }))

    return true
  },
)
