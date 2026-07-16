import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { lookupProduct } from './akeneo'

vi.mock('./auth', () => ({
  getToken: vi.fn().mockResolvedValue('mock-token'),
}))

const CREDS = {
  baseUrl: 'https://akeneo.example.com',
  clientId: 'id',
  clientSecret: 'secret',
  username: 'user',
  password: 'pass',
}

function makeFetch(responses: Array<{ ok: boolean; status: number; body: unknown }>) {
  let call = 0
  return vi.fn().mockImplementation(() => {
    const { ok, status, body } = responses[call++]
    return Promise.resolve({ ok, status, json: () => Promise.resolve(body) })
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('lookupProduct — product found', () => {
  it('returns product result when product endpoint responds 200', async () => {
    vi.stubGlobal('fetch', makeFetch([{
      ok: true, status: 200,
      body: { identifier: 'LST-001', family: 'led_strips', values: { name: [] } },
    }]))

    const result = await lookupProduct('LST-001', CREDS)

    expect(result).toEqual({
      type: 'product',
      identifier: 'LST-001',
      family: 'led_strips',
      values: { name: [] },
    })
  })

  it('uses Bearer token in Authorization header', async () => {
    vi.stubGlobal('fetch', makeFetch([{
      ok: true, status: 200,
      body: { identifier: 'X', family: null, values: {} },
    }]))

    await lookupProduct('X', CREDS)

    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit]
    expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer mock-token')
  })

  it('URL-encodes the SKU in the request path', async () => {
    vi.stubGlobal('fetch', makeFetch([{
      ok: true, status: 200,
      body: { identifier: 'SKU/WITH/SLASH', family: null, values: {} },
    }]))

    await lookupProduct('SKU/WITH/SLASH', CREDS)

    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string]
    expect(url).toContain('SKU%2FWITH%2FSLASH')
  })

  it('falls back family to null when not present in response', async () => {
    vi.stubGlobal('fetch', makeFetch([{
      ok: true, status: 200,
      body: { identifier: 'NO-FAM', values: {} },
    }]))

    const result = await lookupProduct('NO-FAM', CREDS)

    expect(result.family).toBeNull()
  })
})

describe('lookupProduct — product-model fallback', () => {
  it('tries product-model endpoint when product returns 404', async () => {
    vi.stubGlobal('fetch', makeFetch([
      { ok: false, status: 404, body: {} },
      { ok: true, status: 200, body: { code: 'MODEL-42', family_variant: 'clothing_color_size', values: {} } },
    ]))

    const result = await lookupProduct('MODEL-42', CREDS)

    expect(result).toEqual({
      type: 'product-model',
      identifier: 'MODEL-42',
      family: 'clothing_color_size',
      values: {},
    })
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('second call targets the product-models endpoint', async () => {
    vi.stubGlobal('fetch', makeFetch([
      { ok: false, status: 404, body: {} },
      { ok: true, status: 200, body: { code: 'M', family_variant: null, values: {} } },
    ]))

    await lookupProduct('M', CREDS)

    const [secondUrl] = (fetch as ReturnType<typeof vi.fn>).mock.calls[1] as [string]
    expect(secondUrl).toContain('/product-models/')
  })
})

describe('lookupProduct — error handling', () => {
  it('throws on non-404 product error', async () => {
    vi.stubGlobal('fetch', makeFetch([{ ok: false, status: 500, body: {} }]))

    await expect(lookupProduct('BAD', CREDS)).rejects.toThrow('Akeneo product fetch failed: 500')
  })

  it('throws when both product and product-model return 404', async () => {
    vi.stubGlobal('fetch', makeFetch([
      { ok: false, status: 404, body: {} },
      { ok: false, status: 404, body: {} },
    ]))

    await expect(lookupProduct('GHOST', CREDS)).rejects.toThrow('"GHOST" not found')
  })
})
