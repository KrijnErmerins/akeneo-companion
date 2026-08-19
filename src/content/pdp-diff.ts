import type { AttributeValue, DiffField, DiffFieldKey, PdpScrapedData, ProductLookupResult } from '../types/akeneo'

// Candidate Akeneo attribute codes per PDP field, tried in order — first match wins.
const ATTRIBUTE_CANDIDATES: Record<DiffFieldKey, string[]> = {
  title: ['name', 'title', 'product_name'],
  price: ['price', 'prijs'],
  ean: ['ean', 'gtin', 'barcode', 'ean_code'],
  image: ['image', 'main_image', 'hoofdafbeelding', 'thumbnail'],
}

function findAttributeCode(values: Record<string, AttributeValue[]>, candidates: string[]): string | null {
  return candidates.find((code) => code in values) ?? null
}

function resolveRawValue(values: AttributeValue[], locale: string): unknown {
  const match = values.find((v) => v.locale === locale) ?? values.find((v) => v.locale === null) ?? values[0]
  return match?.data
}

function stringifyPrice(data: unknown): string | null {
  const obj = Array.isArray(data) ? data[0] : data
  if (obj && typeof obj === 'object') {
    const amount = (obj as { amount?: unknown }).amount
    if (typeof amount === 'number') return String(amount)
    if (typeof amount === 'string' && amount.trim()) return amount.trim()
  }
  if (typeof data === 'number') return String(data)
  if (typeof data === 'string' && data.trim()) return data.trim()
  return null
}

function stringifyImage(data: unknown): string | null {
  if (typeof data === 'string' && data.trim()) return data.trim()
  if (data && typeof data === 'object') {
    const path = (data as { code?: unknown; filePath?: unknown }).code ?? (data as { filePath?: unknown }).filePath
    if (typeof path === 'string' && path.trim()) return path.trim()
  }
  return null
}

function akeneoValueToString(field: DiffFieldKey, data: unknown): string | null {
  if (data === null || data === undefined || data === '') return null
  if (field === 'price') return stringifyPrice(data)
  if (field === 'image') return stringifyImage(data)
  if (typeof data === 'string') return data.trim() || null
  return String(data)
}

function normalizeText(str: string): string {
  return str.trim().toLowerCase().replace(/\s+/g, ' ')
}

function normalizeNumeric(str: string): number | null {
  const cleaned = str.replace(/[^\d.,-]/g, '').replace(/\.(?=\d{3}(?:\D|$))/g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}

function filename(url: string): string {
  const withoutQuery = url.split('?')[0]
  const segments = withoutQuery.split('/')
  return decodeURIComponent(segments[segments.length - 1] ?? '').toLowerCase()
}

function valuesMatch(field: DiffFieldKey, scraped: string, akeneo: string): boolean {
  if (field === 'price') {
    const s = normalizeNumeric(scraped)
    const a = normalizeNumeric(akeneo)
    return s !== null && a !== null && Math.abs(s - a) < 0.01
  }
  if (field === 'ean') {
    return scraped.replace(/[\s-]/g, '') === akeneo.replace(/[\s-]/g, '')
  }
  if (field === 'image') {
    const s = filename(scraped)
    const a = filename(akeneo)
    return s === a || s.includes(a) || a.includes(s)
  }
  return normalizeText(scraped) === normalizeText(akeneo)
}

export function diffPdpWithAkeneo(
  scraped: PdpScrapedData,
  product: ProductLookupResult,
  locale: string,
): DiffField[] {
  return (Object.keys(ATTRIBUTE_CANDIDATES) as DiffFieldKey[]).map((field) => {
    const scrapedValue = scraped[field]
    const akeneoCode = findAttributeCode(product.values, ATTRIBUTE_CANDIDATES[field])
    const akeneoValue = akeneoCode ? akeneoValueToString(field, resolveRawValue(product.values[akeneoCode], locale)) : null

    let status: DiffField['status']
    if (!akeneoCode) {
      status = 'unavailable'
    } else if (!scrapedValue && !akeneoValue) {
      status = 'match'
    } else if (!scrapedValue) {
      status = 'missing-scraped'
    } else if (!akeneoValue) {
      status = 'missing-akeneo'
    } else {
      status = valuesMatch(field, scrapedValue, akeneoValue) ? 'match' : 'mismatch'
    }

    return { field, akeneoCode, scrapedValue, akeneoValue, status }
  })
}
