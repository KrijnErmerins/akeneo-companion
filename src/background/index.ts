import type { ExtensionMessage, ExtensionResponse } from '../types/akeneo'
import { lookupProduct } from './akeneo'
import { getCredentials } from './credentials'
import { checkForUpdate } from './update-checker'

checkForUpdate()

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse: (r: ExtensionResponse) => void) => {
    if (message.type !== 'GET_PRODUCT' || !message.sku) {
      sendResponse({ success: false, error: 'Invalid message' })
      return false
    }

    getCredentials()
      .then((creds) => lookupProduct(message.sku!, creds))
      .then((data) => sendResponse({ success: true, data }))
      .catch((err) => sendResponse({ success: false, error: (err as Error).message }))

    return true
  },
)
