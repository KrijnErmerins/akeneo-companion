import type { ExtensionMessage, ExtensionResponse } from '../types/akeneo'
import { lookupProduct } from './akeneo'
import { credentials } from './credentials'

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse: (r: ExtensionResponse) => void) => {
    if (message.type !== 'GET_PRODUCT' || !message.sku) {
      sendResponse({ success: false, error: 'Invalid message' })
      return false
    }

    lookupProduct(message.sku!, credentials)
      .then((data) => sendResponse({ success: true, data }))
      .catch((err) => sendResponse({ success: false, error: (err as Error).message }))

    return true // keep message channel open for async response
  },
)
