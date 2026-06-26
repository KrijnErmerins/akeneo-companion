import { extractSku, getLocale } from './sku-logic'

// Tracks the most-recently-detected SKU so variant changes override the static JSON-LD value.
let currentSku: string | null = extractSku()
const locale = getLocale(window.location.hostname)

// Respond to popup asking for SKU on demand
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_SKU') {
    sendResponse({ sku: currentSku })
  }
})

// Push SKU proactively on page load
if (currentSku) {
  chrome.runtime.sendMessage({ type: 'SKU_DETECTED', sku: currentSku, locale })
}

// Watch [itemprop="sku"] for Magento 2 variant selection — text changes when a swatch is chosen.
// This overrides the static JSON-LD parent SKU with the selected child SKU.
const skuEl = document.querySelector('[itemprop="sku"]')
if (skuEl) {
  new MutationObserver(() => {
    const newSku = skuEl.textContent?.trim() ?? null
    if (newSku && newSku !== currentSku) {
      currentSku = newSku
      chrome.runtime.sendMessage({ type: 'SKU_DETECTED', sku: newSku, locale })
    }
  }).observe(skuEl, { childList: true, subtree: true, characterData: true })
}
