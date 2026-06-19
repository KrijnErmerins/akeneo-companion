import { DOMAIN_LOCALE_MAP, HOSTNAME_LOCALE_MAP } from '../types/akeneo'

export function extractSku(doc: Document = document): string | null {
  // 1. JSON-LD structured data
  const scripts = doc.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]')
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
  const itemprop = doc.querySelector('[itemprop="sku"]')
  if (itemprop?.textContent?.trim()) return itemprop.textContent.trim()

  // 3. Meta tag product:retailer_item_id
  const meta = doc.querySelector<HTMLMetaElement>('meta[property="product:retailer_item_id"]')
  if (meta?.content) return meta.content

  // 4. Magento 2 .product.attribute.sku .value fallback
  const skuEl = doc.querySelector('.product.attribute.sku .value')
  if (skuEl?.textContent?.trim()) return skuEl.textContent.trim()

  return null
}

export function getLocale(hostname: string): string {
  if (HOSTNAME_LOCALE_MAP[hostname]) return HOSTNAME_LOCALE_MAP[hostname]
  const tld = hostname.split('.').pop() ?? 'nl'
  return DOMAIN_LOCALE_MAP[tld] ?? 'nl_NL'
}
