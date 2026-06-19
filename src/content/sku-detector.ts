// Extracts SKU from PDP pages. Strategy order:
// 1. JSON-LD structured data
// 2. itemprop="sku" (Magento 2 Luma theme)
// 3. Meta tag product:retailer_item_id
// 4. .product.attribute.sku .value (Magento 2 fallback)

function extractSku(): string | null {
  // 1. JSON-LD
  const scripts = document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]')
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent ?? '')
      const items = Array.isArray(data) ? data : [data]
      for (const item of items) {
        if (item['@type'] === 'Product' && item.sku) return String(item.sku)
      }
    } catch {
      // malformed JSON-LD, skip
    }
  }

  // 2. itemprop="sku" — Magento 2 Luma theme standard
  const itemprop = document.querySelector('[itemprop="sku"]')
  if (itemprop?.textContent?.trim()) return itemprop.textContent.trim()

  // 3. Meta tag
  const meta = document.querySelector<HTMLMetaElement>('meta[property="product:retailer_item_id"]')
  if (meta?.content) return meta.content

  // 4. Magento 2 .product.attribute.sku .value fallback
  const skuEl = document.querySelector('.product.attribute.sku .value')
  if (skuEl?.textContent?.trim()) return skuEl.textContent.trim()

  return null
}

function getLocale(): string {
  const hostname = window.location.hostname
  const hostnameMap: Record<string, string> = {
    'de.ledchampion.magento2.led.p.maxserv.io': 'de_DE',
  }
  if (hostnameMap[hostname]) return hostnameMap[hostname]

  const tld = hostname.split('.').pop() ?? 'nl'
  const tldMap: Record<string, string> = { nl: 'nl_NL', be: 'nl_BE', de: 'de_DE' }
  return tldMap[tld] ?? 'nl_NL'
}

// Respond to popup asking for SKU on demand
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_SKU') {
    sendResponse({ sku: extractSku() })
  }
})

// Also push SKU proactively on page load
const sku = extractSku()
if (sku) {
  chrome.runtime.sendMessage({ type: 'SKU_DETECTED', sku, locale: getLocale() })
}
