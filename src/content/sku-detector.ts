// Extracts SKU from LedKoning PDP and notifies the background service worker.
// Strategy order: JSON-LD structured data → URL slug → meta tags

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

  // 2. Meta tag (Magento often exposes product SKU here)
  const meta = document.querySelector<HTMLMetaElement>('meta[property="product:retailer_item_id"]')
  if (meta?.content) return meta.content

  // 3. URL — Magento PDP URLs often end in -<sku>.html or contain the SKU as a path segment
  // TODO: Add LedKoning-specific URL pattern once confirmed
  return null
}

function getLocaleFromDomain(): string {
  const tld = window.location.hostname.split('.').pop() ?? 'nl'
  const map: Record<string, string> = { nl: 'nl_NL', be: 'nl_BE', de: 'de_DE' }
  return map[tld] ?? 'nl_NL'
}

const sku = extractSku()

if (sku) {
  chrome.runtime.sendMessage({
    type: 'SKU_DETECTED',
    sku,
    locale: getLocaleFromDomain(),
  })
}
