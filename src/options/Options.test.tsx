import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { OptionsApp } from './Options'

vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({ render: vi.fn() })),
}))

vi.mock('../background/credentials', () => ({
  credentials: {
    baseUrl: 'https://build.akeneo.example.com',
    clientId: 'build-client-id',
    clientSecret: 'build-secret',
    username: 'build-user',
    password: 'build-pass',
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(chrome.storage.local.get).mockImplementation((_keys, cb) => {
    ;(cb as (r: Record<string, unknown>) => void)({})
    return Promise.resolve()
  })
  vi.mocked(chrome.storage.local.set).mockImplementation((_items, cb) => {
    cb?.()
    return Promise.resolve()
  })
})

describe('OptionsApp — credential loading', () => {
  it('falls back to build-time credentials when storage is empty', async () => {
    await act(async () => { render(<OptionsApp />) })
    expect(screen.getByDisplayValue('https://build.akeneo.example.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('build-user')).toBeInTheDocument()
  })

  it('populates form with stored credentials on mount', async () => {
    vi.mocked(chrome.storage.local.get).mockImplementation((_keys, cb) => {
      ;(cb as (r: Record<string, unknown>) => void)({
        credentials: {
          baseUrl: 'https://stored.akeneo.com',
          clientId: 'stored-client',
          clientSecret: 'stored-secret',
          username: 'stored-user',
          password: 'stored-pass',
        },
      })
      return Promise.resolve()
    })

    await act(async () => { render(<OptionsApp />) })

    expect(screen.getByDisplayValue('https://stored.akeneo.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('stored-client')).toBeInTheDocument()
    expect(screen.getByDisplayValue('stored-user')).toBeInTheDocument()
  })
})

describe('OptionsApp — save', () => {
  it('calls chrome.storage.local.set with current form values', async () => {
    await act(async () => { render(<OptionsApp />) })

    fireEvent.click(screen.getByText('Opslaan'))

    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({
        credentials: expect.objectContaining({ baseUrl: 'https://build.akeneo.example.com' }),
      }),
      expect.any(Function),
    )
  })

  it('shows "Opgeslagen!" after save and reverts to "Opslaan" after 2 seconds', async () => {
    vi.useFakeTimers()

    await act(async () => { render(<OptionsApp />) })
    await act(async () => { fireEvent.click(screen.getByText('Opslaan')) })

    expect(screen.getByText('Opgeslagen!')).toBeInTheDocument()

    await act(async () => { vi.advanceTimersByTime(2000) })

    expect(screen.getByText('Opslaan')).toBeInTheDocument()

    vi.useRealTimers()
  })
})

describe('OptionsApp — test connection', () => {
  it('shows "Verbinding OK" after a successful connection test', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    }))

    await act(async () => { render(<OptionsApp />) })
    await act(async () => { fireEvent.click(screen.getByText('Test verbinding')) })

    expect(screen.getByText('Verbinding OK')).toBeInTheDocument()
  })

  it('shows Dutch error message when connection fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: vi.fn().mockResolvedValue('Unauthorized'),
    }))

    await act(async () => { render(<OptionsApp />) })
    await act(async () => { fireEvent.click(screen.getByText('Test verbinding')) })

    expect(screen.getByText(/Auth mislukt: HTTP 401/)).toBeInTheDocument()
  })
})

describe('OptionsApp — field input', () => {
  it('updates form state when a field value is changed', async () => {
    await act(async () => { render(<OptionsApp />) })

    const urlInput = screen.getByDisplayValue('https://build.akeneo.example.com')
    fireEvent.change(urlInput, { target: { value: 'https://new.akeneo.com' } })

    expect(screen.getByDisplayValue('https://new.akeneo.com')).toBeInTheDocument()
  })

  it('saves updated field value to storage', async () => {
    await act(async () => { render(<OptionsApp />) })

    const urlInput = screen.getByDisplayValue('https://build.akeneo.example.com')
    fireEvent.change(urlInput, { target: { value: 'https://custom.akeneo.com' } })
    fireEvent.click(screen.getByText('Opslaan'))

    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({
        credentials: expect.objectContaining({ baseUrl: 'https://custom.akeneo.com' }),
      }),
      expect.any(Function),
    )
  })
})
