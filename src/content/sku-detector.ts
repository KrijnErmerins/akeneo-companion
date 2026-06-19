import { extractSku, getLocale } from './sku-logic'

// Respond to popup asking for SKU on demand
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_SKU') {
    sendResponse({ sku: extractSku() })
  }
})

// Also push SKU proactively on page load
const sku = extractSku()
if (sku) {
  chrome.runtime.sendMessage({
    type: 'SKU_DETECTED',
    sku,
    locale: getLocale(window.location.hostname),
  })
}
