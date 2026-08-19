import type { PdpScrapedData } from '../types/akeneo'

function readJsonLdProduct(doc: Document): Record<string, unknown> | null {
  const scripts = doc.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]')
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent ?? '')
      const items = Array.isArray(data) ? data : [data]
      for (const item of items) {
        if (item['@type'] === 'Product') return item as Record<string, unknown>
      }
    } catch {
      // malformed JSON-LD, skip
    }
  }
  return null
}

function scrapeTitle(doc: Document, jsonLd: Record<string, unknown> | null): string | null {
  if (typeof jsonLd?.name === 'string' && jsonLd.name.trim()) return jsonLd.name.trim()

  const ogTitle = doc.querySelector<HTMLMetaElement>('meta[property="og:title"]')
  if (ogTitle?.content?.trim()) return ogTitle.content.trim()

  const h1 = doc.querySelector('h1.page-title')
  if (h1?.textContent?.trim()) return h1.textContent.trim()

  return null
}

function scrapePrice(doc: Document, jsonLd: Record<string, unknown> | null): string | null {
  const offers = jsonLd?.offers
  const offer = Array.isArray(offers) ? offers[0] : offers
  const offerPrice = (offer as { price?: unknown } | undefined)?.price
  if (typeof offerPrice === 'number') return String(offerPrice)
  if (typeof offerPrice === 'string' && offerPrice.trim()) return offerPrice.trim()

  const metaPrice = doc.querySelector<HTMLMetaElement>('meta[property="product:price:amount"]')
  if (metaPrice?.content?.trim()) return metaPrice.content.trim()

  const finalPrice = doc.querySelector('.price-final_price .price, [data-price-type="finalPrice"] .price')
  if (finalPrice?.textContent?.trim()) return finalPrice.textContent.trim()

  return null
}

function scrapeEan(doc: Document, jsonLd: Record<string, unknown> | null): string | null {
  for (const key of ['gtin13', 'gtin', 'gtin8', 'gtin14']) {
    const val = jsonLd?.[key]
    if (typeof val === 'string' && val.trim()) return val.trim()
  }

  const itemprop = doc.querySelector('[itemprop="gtin13"], [itemprop="gtin"]')
  if (itemprop?.textContent?.trim()) return itemprop.textContent.trim()

  const eanEl = doc.querySelector('.product.attribute.ean .value')
  if (eanEl?.textContent?.trim()) return eanEl.textContent.trim()

  const dataEl = doc.querySelector('[data-ean]')
  const dataVal = dataEl?.getAttribute('data-ean')?.trim()
  if (dataVal) return dataVal

  return null
}

function scrapeImage(doc: Document, jsonLd: Record<string, unknown> | null): string | null {
  const jsonImage = jsonLd?.image
  const firstImage = Array.isArray(jsonImage) ? jsonImage[0] : jsonImage
  if (typeof firstImage === 'string' && firstImage.trim()) return firstImage.trim()

  const ogImage = doc.querySelector<HTMLMetaElement>('meta[property="og:image"]')
  if (ogImage?.content?.trim()) return ogImage.content.trim()

  const galleryImg = doc.querySelector<HTMLImageElement>('.gallery-placeholder img, .fotorama__stage__frame img')
  if (galleryImg?.src) return galleryImg.src

  return null
}

export function scrapePdpData(doc: Document = document): PdpScrapedData {
  const jsonLd = readJsonLdProduct(doc)
  return {
    title: scrapeTitle(doc, jsonLd),
    price: scrapePrice(doc, jsonLd),
    ean: scrapeEan(doc, jsonLd),
    image: scrapeImage(doc, jsonLd),
  }
}
