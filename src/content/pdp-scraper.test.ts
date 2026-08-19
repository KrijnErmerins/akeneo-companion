import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import { scrapePdpData } from './pdp-scraper'

function makeDoc(html: string): Document {
  return new JSDOM(html).window.document
}

describe('scrapePdpData — JSON-LD', () => {
  it('extracts title, price, ean, image from Product JSON-LD', () => {
    const doc = makeDoc(`
      <script type="application/ld+json">
        {
          "@type": "Product",
          "name": "LED Strip 5m",
          "gtin13": "1234567890123",
          "image": ["https://cdn.example.com/img/led-strip-5m.jpg"],
          "offers": { "price": "49.95", "priceCurrency": "EUR" }
        }
      </script>
    `)
    expect(scrapePdpData(doc)).toEqual({
      title: 'LED Strip 5m',
      price: '49.95',
      ean: '1234567890123',
      image: 'https://cdn.example.com/img/led-strip-5m.jpg',
    })
  })

  it('handles offers as a single object (not array)', () => {
    const doc = makeDoc(`
      <script type="application/ld+json">
        {"@type":"Product","name":"X","offers":{"price":10.5}}
      </script>
    `)
    expect(scrapePdpData(doc).price).toBe('10.5')
  })

  it('skips malformed JSON-LD and falls through to DOM fallbacks', () => {
    const doc = makeDoc(`
      <script type="application/ld+json">{ broken json</script>
      <meta property="og:title" content="Fallback Title" />
      <meta property="product:price:amount" content="19.99" />
      <div class="product attribute ean"><div class="value">EAN-999</div></div>
      <meta property="og:image" content="https://cdn.example.com/fallback.jpg" />
    `)
    expect(scrapePdpData(doc)).toEqual({
      title: 'Fallback Title',
      price: '19.99',
      ean: 'EAN-999',
      image: 'https://cdn.example.com/fallback.jpg',
    })
  })
})

describe('scrapePdpData — DOM fallbacks', () => {
  it('extracts title from h1.page-title', () => {
    const doc = makeDoc(`<h1 class="page-title">My Product</h1>`)
    expect(scrapePdpData(doc).title).toBe('My Product')
  })

  it('extracts price from .price-final_price .price', () => {
    const doc = makeDoc(`<span class="price-final_price"><span class="price">€ 29,95</span></span>`)
    expect(scrapePdpData(doc).price).toBe('€ 29,95')
  })

  it('extracts ean from [data-ean]', () => {
    const doc = makeDoc(`<div data-ean="EAN-DATA-1"></div>`)
    expect(scrapePdpData(doc).ean).toBe('EAN-DATA-1')
  })

  it('extracts image from .gallery-placeholder img', () => {
    const doc = makeDoc(`<div class="gallery-placeholder"><img src="https://cdn.example.com/gallery.jpg" /></div>`)
    expect(scrapePdpData(doc).image).toBe('https://cdn.example.com/gallery.jpg')
  })

  it('returns all null when nothing is found', () => {
    const doc = makeDoc(`<p>Hello world</p>`)
    expect(scrapePdpData(doc)).toEqual({ title: null, price: null, ean: null, image: null })
  })
})
