import type { AkeneoCredentials, ExtensionMessage, ExtensionResponse } from '../types/akeneo'
import { lookupProduct } from './akeneo'

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse: (r: ExtensionResponse) => void) => {
    if (message.type !== 'GET_PRODUCT' || !message.sku) {
      sendResponse({ success: false, error: 'Invalid message' })
      return false
    }

    chrome.storage.local.get('credentials', async ({ credentials }) => {
      if (!credentials) {
        sendResponse({ success: false, error: 'No Akeneo credentials configured. Open extension options.' })
        return
      }

      try {
        const data = await lookupProduct(message.sku!, credentials as AkeneoCredentials)
        sendResponse({ success: true, data })
      } catch (err) {
        sendResponse({ success: false, error: (err as Error).message })
      }
    })

    return true // keep message channel open for async response
  },
)
