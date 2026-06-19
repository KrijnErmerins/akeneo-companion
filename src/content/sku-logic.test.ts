import { describe, it, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'
import { extractSku, getLocale } from './sku-logic'

// Helper to build a minimal document from HTML string
function makeDoc(html: string): Document {
  return new JSDOM(html).window.document
}

// ─── extractSku ──────────────────────────────────────────────────────────────

describe('extractSku — JSON-LD', () => {
  it('extracts sku from Product JSON-LD', () => {
    const doc = makeDoc(`
      <script type="application/ld+json">
        {"@type":"Product","name":"LED Strip","sku":"LST-001"}
      </script>
    `)
    expect(extractSku(doc)).toBe('LST-001')
  })

  it('extracts sku from array JSON-LD with Product item', () => {
    const doc = makeDoc(`
      <script type="application/ld+json">
        [{"@type":"WebPage"},{"@type":"Product","sku":"ARR-999"}]
      </script>
    `)
    expect(extractSku(doc)).toBe('ARR-999')
  })

  it('skips malformed JSON-LD and falls through', () => {
    const doc = makeDoc(`
      <script type="application/ld+json">{ broken json</script>
      <span itemprop="sku">FALLBACK-SKU</span>
    `)
    expect(extractSku(doc)).toBe('FALLBACK-SKU')
  })

  it('skips JSON-LD without @type=Product', () => {
    const doc = makeDoc(`
      <script type="application/ld+json">{"@type":"WebPage"}</script>
      <span itemprop="sku">WEB-SKU</span>
    `)
    expect(extractSku(doc)).toBe('WEB-SKU')
  })
})

describe('extractSku — itemprop', () => {
  it('extracts sku from itemprop="sku"', () => {
    const doc = makeDoc(`<span itemprop="sku">ITEM-123</span>`)
    expect(extractSku(doc)).toBe('ITEM-123')
  })

  it('trims whitespace from itemprop value', () => {
    const doc = makeDoc(`<span itemprop="sku">  ITEM-456  </span>`)
    expect(extractSku(doc)).toBe('ITEM-456')
  })

  it('ignores empty itemprop value', () => {
    const doc = makeDoc(`
      <span itemprop="sku">   </span>
      <meta property="product:retailer_item_id" content="META-789" />
    `)
    expect(extractSku(doc)).toBe('META-789')
  })
})

describe('extractSku — meta tag', () => {
  it('extracts sku from product:retailer_item_id meta', () => {
    const doc = makeDoc(`<meta property="product:retailer_item_id" content="META-001" />`)
    expect(extractSku(doc)).toBe('META-001')
  })
})

describe('extractSku — Magento 2 DOM fallback', () => {
  it('extracts sku from .product.attribute.sku .value', () => {
    const doc = makeDoc(`
      <div class="product attribute sku">
        <div class="value">MAG-777</div>
      </div>
    `)
    expect(extractSku(doc)).toBe('MAG-777')
  })
})

describe('extractSku — no match', () => {
  it('returns null when no SKU signal present', () => {
    const doc = makeDoc(`<p>Hello world</p>`)
    expect(extractSku(doc)).toBeNull()
  })
})

// ─── getLocale ───────────────────────────────────────────────────────────────

describe('getLocale — TLD mapping', () => {
  it('maps .nl → nl_NL', () => {
    expect(getLocale('www.ledkoning.nl')).toBe('nl_NL')
  })

  it('maps .be → nl_BE', () => {
    expect(getLocale('www.ledkoning.be')).toBe('nl_BE')
  })

  it('maps .de → de_DE', () => {
    expect(getLocale('www.ledchampion.de')).toBe('de_DE')
  })

  it('defaults unknown TLD to nl_NL', () => {
    expect(getLocale('example.com')).toBe('nl_NL')
  })
})

describe('getLocale — full-hostname override', () => {
  it('maps staging DE domain → de_DE', () => {
    expect(getLocale('de.ledchampion.magento2.led.p.maxserv.io')).toBe('de_DE')
  })
})
