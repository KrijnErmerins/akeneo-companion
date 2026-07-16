import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import App from './App'
import type { ExtensionResponse, FamilyAttributesResponse, ProductLookupResult } from '../types/akeneo'

// Stub import.meta.env values used by App
vi.stubEnv('VITE_AKENEO_BASE_URL', 'https://akeneo.example.com')

// Helper: make chrome.tabs.query resolve with a tab on the given URL
function stubTab(url: string) {
  vi.mocked(chrome.tabs.query).mockImplementation((_q, cb) => {
    cb([{ id: 1, url } as chrome.tabs.Tab])
    return Promise.resolve([])
  })
}

// Helper: make chrome.tabs.sendMessage respond with a SKU (or nothing)
function stubSku(sku: string | null) {
  vi.mocked(chrome.tabs.sendMessage).mockImplementation((_id, _msg, cb) => {
    cb?.(sku ? { sku } : null)
    return Promise.resolve()
  })
}

// Helper: make chrome.runtime.sendMessage handle both GET_PRODUCT and GET_FAMILY_ATTRIBUTES
function stubProduct(product: ProductLookupResult) {
  vi.mocked(chrome.runtime.sendMessage).mockImplementation((msg, cb) => {
    const message = msg as { type: string }
    if (message.type === 'GET_PRODUCT') {
      const response: ExtensionResponse = { success: true, data: product }
      ;(cb as (r: ExtensionResponse) => void)?.(response)
    } else if (message.type === 'GET_FAMILY_ATTRIBUTES') {
      const response: FamilyAttributesResponse = { success: true, data: [] }
      ;(cb as (r: FamilyAttributesResponse) => void)?.(response)
    }
    return Promise.resolve()
  })
}

// Helper: make chrome.runtime.sendMessage respond with a product error
function stubProductError(error: string) {
  vi.mocked(chrome.runtime.sendMessage).mockImplementation((_msg, cb) => {
    const response: ExtensionResponse = { success: false, error }
    ;(cb as (r: ExtensionResponse) => void)?.(response)
    return Promise.resolve()
  })
}

beforeEach(() => {
  vi.mocked(chrome.storage.local.get).mockImplementation((_keys, cb) => {
    cb({})
    return Promise.resolve()
  })
})

describe('App — loading state', () => {
  it('renders loader text while awaiting chrome.tabs.query', () => {
    // tabs.query never calls back → stays in loading state
    vi.mocked(chrome.tabs.query).mockReturnValue(new Promise(() => {}))

    render(<App />)

    expect(screen.getByText('Ophalen uit Akeneo')).toBeInTheDocument()
  })
})

describe('App — error state', () => {
  it('shows the error message returned by the background', async () => {
    stubTab('https://www.ledkoning.nl/product/lst-001')
    stubSku('LST-001')
    stubProductError('Akeneo auth failed: 401')

    await act(async () => {
      render(<App />)
    })

    expect(screen.getByText(/Akeneo auth failed: 401/)).toBeInTheDocument()
  })

  it('shows a no-SKU message when content script finds nothing', async () => {
    stubTab('https://www.ledkoning.nl/')
    stubSku(null)
    // executeScript for injection also finds nothing
    vi.mocked(chrome.scripting.executeScript)
      .mockImplementationOnce((_opts, cb) => { cb?.([]); return Promise.resolve([]) })
      .mockImplementationOnce((_opts, cb) => {
        cb?.([{ result: null } as chrome.scripting.InjectionResult])
        return Promise.resolve([])
      })

    await act(async () => {
      render(<App />)
    })

    expect(screen.getByText(/Geen SKU gevonden/)).toBeInTheDocument()
  })
})

describe('App — done state', () => {
  it('renders the product identifier and attribute table', async () => {
    stubTab('https://www.ledkoning.nl/product/lst-001')
    stubSku('LST-001')
    stubProduct({
      type: 'product',
      identifier: 'LST-001',
      family: null,
      values: {
        name: [{ locale: 'nl_NL', scope: null, data: 'LED Strip 5m' }],
      },
    })

    await act(async () => {
      render(<App />)
    })

    expect(screen.getByText('LST-001')).toBeInTheDocument()
    expect(screen.getByText('LED Strip 5m')).toBeInTheDocument()
  })

  it('shows fill-rate badge with correct counts', async () => {
    stubTab('https://www.ledkoning.nl/product/lst-002')
    stubSku('LST-002')
    stubProduct({
      type: 'product',
      identifier: 'LST-002',
      family: null,
      values: {
        name: [{ locale: 'nl_NL', scope: null, data: 'Strip' }],
        color: [{ locale: null, scope: null, data: null }],
      },
    })

    await act(async () => {
      render(<App />)
    })

    // 1 filled out of 2 attributes
    expect(screen.getByText('1/2 ingevuld')).toBeInTheDocument()
  })

  it('renders product type chip', async () => {
    stubTab('https://www.ledkoning.nl/product/lst-003')
    stubSku('LST-003')
    stubProduct({
      type: 'product-model',
      identifier: 'LST-003',
      family: 'led_strips',
      values: {},
    })

    await act(async () => {
      render(<App />)
    })

    expect(screen.getByText('product-model')).toBeInTheDocument()
    expect(screen.getByText('led_strips')).toBeInTheDocument()
  })
})
