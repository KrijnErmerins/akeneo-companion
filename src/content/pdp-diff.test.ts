import { describe, it, expect } from 'vitest'
import { diffPdpWithAkeneo } from './pdp-diff'
import type { PdpScrapedData, ProductLookupResult } from '../types/akeneo'

const LOCALE = 'nl_NL'

function makeProduct(values: ProductLookupResult['values']): ProductLookupResult {
  return { type: 'product', identifier: 'SKU-1', family: 'fam', values }
}

describe('diffPdpWithAkeneo — matches', () => {
  it('reports match when title, price, ean, image all align', () => {
    const scraped: PdpScrapedData = {
      title: 'LED Strip 5m',
      price: '49.95',
      ean: '1234567890123',
      image: 'https://cdn.example.com/img/led-strip-5m.jpg',
    }
    const product = makeProduct({
      name: [{ locale: LOCALE, scope: null, data: 'LED Strip 5m' }],
      price: [{ locale: null, scope: null, data: [{ amount: '49.95', currency: 'EUR' }] }],
      ean: [{ locale: null, scope: null, data: '1234567890123' }],
      image: [{ locale: null, scope: null, data: 'led-strip-5m.jpg' }],
    })
    const result = diffPdpWithAkeneo(scraped, product, LOCALE)
    expect(result.every((d) => d.status === 'match')).toBe(true)
  })

  it('normalizes EAN spacing/dashes before comparing', () => {
    const scraped: PdpScrapedData = { title: null, price: null, ean: '1234-5678-9012-3', image: null }
    const product = makeProduct({ ean: [{ locale: null, scope: null, data: '123456789012 3' }] })
    const result = diffPdpWithAkeneo(scraped, product, LOCALE)
    expect(result.find((d) => d.field === 'ean')?.status).toBe('match')
  })

  it('tolerates price formatting differences (comma vs dot)', () => {
    const scraped: PdpScrapedData = { title: null, price: '€ 29,95', ean: null, image: null }
    const product = makeProduct({ price: [{ locale: null, scope: null, data: [{ amount: '29.95', currency: 'EUR' }] }] })
    const result = diffPdpWithAkeneo(scraped, product, LOCALE)
    expect(result.find((d) => d.field === 'price')?.status).toBe('match')
  })
})

describe('diffPdpWithAkeneo — mismatches', () => {
  it('flags a title mismatch', () => {
    const scraped: PdpScrapedData = { title: 'Site Title', price: null, ean: null, image: null }
    const product = makeProduct({ name: [{ locale: LOCALE, scope: null, data: 'Akeneo Title' }] })
    const result = diffPdpWithAkeneo(scraped, product, LOCALE)
    const titleDiff = result.find((d) => d.field === 'title')
    expect(titleDiff?.status).toBe('mismatch')
    expect(titleDiff?.scrapedValue).toBe('Site Title')
    expect(titleDiff?.akeneoValue).toBe('Akeneo Title')
  })

  it('flags missing-akeneo when scraped has a value but Akeneo is empty', () => {
    const scraped: PdpScrapedData = { title: null, price: null, ean: 'EAN-1', image: null }
    const product = makeProduct({ ean: [{ locale: null, scope: null, data: '' }] })
    const result = diffPdpWithAkeneo(scraped, product, LOCALE)
    expect(result.find((d) => d.field === 'ean')?.status).toBe('missing-akeneo')
  })

  it('flags missing-scraped when Akeneo has a value but the site does not', () => {
    const scraped: PdpScrapedData = { title: null, price: null, ean: null, image: null }
    const product = makeProduct({ ean: [{ locale: null, scope: null, data: 'EAN-1' }] })
    const result = diffPdpWithAkeneo(scraped, product, LOCALE)
    expect(result.find((d) => d.field === 'ean')?.status).toBe('missing-scraped')
  })
})

describe('diffPdpWithAkeneo — unavailable attributes', () => {
  it('marks a field unavailable when no matching Akeneo attribute code exists', () => {
    const scraped: PdpScrapedData = { title: 'X', price: null, ean: null, image: null }
    const product = makeProduct({})
    const result = diffPdpWithAkeneo(scraped, product, LOCALE)
    expect(result.every((d) => d.status === 'unavailable')).toBe(true)
    expect(result.find((d) => d.field === 'title')?.akeneoCode).toBeNull()
  })

  it('picks the first matching candidate code', () => {
    const scraped: PdpScrapedData = { title: null, price: null, ean: 'EAN-1', image: null }
    const product = makeProduct({ gtin: [{ locale: null, scope: null, data: 'EAN-1' }] })
    const result = diffPdpWithAkeneo(scraped, product, LOCALE)
    expect(result.find((d) => d.field === 'ean')?.akeneoCode).toBe('gtin')
  })
})
