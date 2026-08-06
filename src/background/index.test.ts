import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import * as akeneo from './akeneo'
import type { ExtensionMessage } from '../types/akeneo'

vi.mock('./akeneo', () => ({
  lookupProduct: vi.fn(),
  getFamilyAttributes: vi.fn(),
  getAttributeTypes: vi.fn(),
  getAttributeOptions: vi.fn(),
}))

vi.mock('./credentials', () => ({
  credentials: {
    baseUrl: 'https://akeneo.example.com',
    clientId: 'c',
    clientSecret: 's',
    username: 'u',
    password: 'p',
  },
}))

vi.mock('./update-checker', () => ({
  checkForUpdate: vi.fn(),
}))

type MsgListener = (
  msg: ExtensionMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (r: unknown) => void,
) => boolean | void

let listener!: MsgListener

beforeAll(async () => {
  ;(chrome.runtime as Record<string, unknown>).onMessage = {
    addListener: vi.fn((cb: MsgListener) => { listener = cb }),
  }
  ;(chrome.runtime as Record<string, unknown>).onInstalled = {
    addListener: vi.fn(),
  }
  await import('./index')
})

const BUILD_CREDS = { baseUrl: 'https://akeneo.example.com', clientId: 'c', clientSecret: 's', username: 'u', password: 'p' }

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(akeneo.lookupProduct).mockResolvedValue({ type: 'product', identifier: 'X', family: null, values: {} })
  vi.mocked(akeneo.getFamilyAttributes).mockResolvedValue([])
  vi.mocked(akeneo.getAttributeTypes).mockResolvedValue(new Map())
  vi.mocked(akeneo.getAttributeOptions).mockResolvedValue(new Map())
  vi.mocked(chrome.storage.local.get).mockImplementation((_k, cb) => {
    ;(cb as (r: Record<string, unknown>) => void)({})
    return Promise.resolve()
  })
})

// Invoke the listener and return its synchronous return value plus a promise that resolves when sendResponse is called.
function invoke(msg: ExtensionMessage): { returnValue: boolean | void; response: Promise<unknown> } {
  let ret!: boolean | void
  const response = new Promise<unknown>((resolve) => {
    ret = listener(msg, {} as chrome.runtime.MessageSender, resolve)
  })
  return { returnValue: ret, response }
}

describe('GET_PRODUCT', () => {
  it('returns false and sends error when sku is missing', () => {
    const respond = vi.fn()
    const ret = listener({ type: 'GET_PRODUCT' }, {} as chrome.runtime.MessageSender, respond)
    expect(ret).toBe(false)
    expect(respond).toHaveBeenCalledWith({ success: false, error: 'Invalid message' })
  })

  it('returns true, calls lookupProduct, responds with data', async () => {
    const product = { type: 'product' as const, identifier: 'PROD-A', family: null, values: {} }
    vi.mocked(akeneo.lookupProduct).mockResolvedValue(product)

    const { returnValue, response } = invoke({ type: 'GET_PRODUCT', sku: 'PROD-A' })
    expect(returnValue).toBe(true)
    expect(await response).toEqual({ success: true, data: product })
    expect(akeneo.lookupProduct).toHaveBeenCalledWith('PROD-A', BUILD_CREDS)
  })

  it('passes stored credentials to lookupProduct when set in storage', async () => {
    const storedCreds = { baseUrl: 'https://stored.com', clientId: 'sc', clientSecret: 'ss', username: 'su', password: 'sp' }
    vi.mocked(chrome.storage.local.get).mockImplementation((_k, cb) => {
      ;(cb as (r: Record<string, unknown>) => void)({ credentials: storedCreds })
      return Promise.resolve()
    })

    const { response } = invoke({ type: 'GET_PRODUCT', sku: 'CREDS-TEST' })
    await response

    expect(akeneo.lookupProduct).toHaveBeenCalledWith('CREDS-TEST', storedCreds)
  })

  it('returns cached result on second call without re-fetching', async () => {
    const { response: p1 } = invoke({ type: 'GET_PRODUCT', sku: 'CACHE-PROD' })
    await p1
    vi.mocked(akeneo.lookupProduct).mockClear()

    const respond2 = vi.fn()
    listener({ type: 'GET_PRODUCT', sku: 'CACHE-PROD' }, {} as chrome.runtime.MessageSender, respond2)

    expect(akeneo.lookupProduct).not.toHaveBeenCalled()
    expect(respond2).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })

  it('re-fetches after cache TTL expires', async () => {
    vi.useFakeTimers()
    const { response: p1 } = invoke({ type: 'GET_PRODUCT', sku: 'TTL-PROD' })
    await p1

    vi.advanceTimersByTime(5 * 60 * 1000 + 1)
    vi.mocked(akeneo.lookupProduct).mockClear()

    const { response: p2 } = invoke({ type: 'GET_PRODUCT', sku: 'TTL-PROD' })
    await p2

    expect(akeneo.lookupProduct).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })

  it('responds with error when lookupProduct rejects', async () => {
    vi.mocked(akeneo.lookupProduct).mockRejectedValue(new Error('Product niet gevonden'))

    const { response } = invoke({ type: 'GET_PRODUCT', sku: 'ERR-PROD' })
    expect(await response).toEqual({ success: false, error: 'Product niet gevonden' })
  })
})

describe('GET_FAMILY_ATTRIBUTES', () => {
  it('returns false and error when familyCode is missing', () => {
    const respond = vi.fn()
    const ret = listener({ type: 'GET_FAMILY_ATTRIBUTES' }, {} as chrome.runtime.MessageSender, respond)
    expect(ret).toBe(false)
    expect(respond).toHaveBeenCalledWith({ success: false, error: 'Missing familyCode' })
  })

  it('returns true, calls getFamilyAttributes, responds with data', async () => {
    const attrs = [{ code: 'name', required: true, type: 'pim_catalog_text' }]
    vi.mocked(akeneo.getFamilyAttributes).mockResolvedValue(attrs)

    const { returnValue, response } = invoke({ type: 'GET_FAMILY_ATTRIBUTES', familyCode: 'led_strips' })
    expect(returnValue).toBe(true)
    expect(await response).toEqual({ success: true, data: attrs })
  })

  it('returns cached result on second call', async () => {
    const { response: p1 } = invoke({ type: 'GET_FAMILY_ATTRIBUTES', familyCode: 'CACHE-FAM' })
    await p1
    vi.mocked(akeneo.getFamilyAttributes).mockClear()

    const respond2 = vi.fn()
    listener({ type: 'GET_FAMILY_ATTRIBUTES', familyCode: 'CACHE-FAM' }, {} as chrome.runtime.MessageSender, respond2)

    expect(akeneo.getFamilyAttributes).not.toHaveBeenCalled()
    expect(respond2).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })
})

describe('GET_ATTRIBUTE_TYPES', () => {
  it('returns false and error when familyCode is missing', () => {
    const respond = vi.fn()
    const ret = listener({ type: 'GET_ATTRIBUTE_TYPES' }, {} as chrome.runtime.MessageSender, respond)
    expect(ret).toBe(false)
    expect(respond).toHaveBeenCalledWith({ success: false, error: 'Missing familyCode' })
  })

  it('returns true and responds with attribute types', async () => {
    vi.mocked(akeneo.getAttributeTypes).mockResolvedValue(new Map([['name', 'pim_catalog_text']]))

    const { returnValue, response } = invoke({ type: 'GET_ATTRIBUTE_TYPES', familyCode: 'AT-FAM' })
    expect(returnValue).toBe(true)
    expect((await response as { success: boolean }).success).toBe(true)
  })

  it('returns cached result on second call', async () => {
    const { response: p1 } = invoke({ type: 'GET_ATTRIBUTE_TYPES', familyCode: 'CACHE-AT-FAM' })
    await p1
    vi.mocked(akeneo.getAttributeTypes).mockClear()

    const respond2 = vi.fn()
    listener({ type: 'GET_ATTRIBUTE_TYPES', familyCode: 'CACHE-AT-FAM' }, {} as chrome.runtime.MessageSender, respond2)

    expect(akeneo.getAttributeTypes).not.toHaveBeenCalled()
    expect(respond2).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })
})

describe('GET_ATTRIBUTE_OPTIONS', () => {
  it('returns false and error when attributeCode is missing', () => {
    const respond = vi.fn()
    const ret = listener({ type: 'GET_ATTRIBUTE_OPTIONS' }, {} as chrome.runtime.MessageSender, respond)
    expect(ret).toBe(false)
    expect(respond).toHaveBeenCalledWith({ success: false, error: 'Missing attributeCode' })
  })

  it('returns true and responds with attribute options', async () => {
    vi.mocked(akeneo.getAttributeOptions).mockResolvedValue(new Map([['color', { nl_NL: 'Rood' }]]))

    const { returnValue, response } = invoke({ type: 'GET_ATTRIBUTE_OPTIONS', attributeCode: 'color' })
    expect(returnValue).toBe(true)
    expect((await response as { success: boolean }).success).toBe(true)
  })

  it('returns cached result on second call', async () => {
    const { response: p1 } = invoke({ type: 'GET_ATTRIBUTE_OPTIONS', attributeCode: 'CACHE-ATTR' })
    await p1
    vi.mocked(akeneo.getAttributeOptions).mockClear()

    const respond2 = vi.fn()
    listener({ type: 'GET_ATTRIBUTE_OPTIONS', attributeCode: 'CACHE-ATTR' }, {} as chrome.runtime.MessageSender, respond2)

    expect(akeneo.getAttributeOptions).not.toHaveBeenCalled()
    expect(respond2).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })
})

describe('unknown / unhandled message type', () => {
  it('returns false and sends error for SKU_DETECTED (not handled by router)', () => {
    const respond = vi.fn()
    const ret = listener({ type: 'SKU_DETECTED', sku: 'X' }, {} as chrome.runtime.MessageSender, respond)
    expect(ret).toBe(false)
    expect(respond).toHaveBeenCalledWith({ success: false, error: 'Invalid message' })
  })
})
