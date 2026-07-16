import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getToken, clearTokenCache } from './auth'

const BASE_CREDENTIALS = {
  baseUrl: 'https://akeneo.example.com',
  clientId: 'client-id',
  clientSecret: 'client-secret',
  username: 'user',
  password: 'pass',
}

function mockTokenResponse(overrides: Record<string, unknown> = {}) {
  return {
    access_token: 'test-token',
    expires_in: 3600,
    ...overrides,
  }
}

function makeFetchMock(body: unknown, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
  })
}

beforeEach(() => {
  clearTokenCache()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getToken — fresh fetch', () => {
  it('calls the Akeneo token endpoint and returns access_token', async () => {
    vi.stubGlobal('fetch', makeFetchMock(mockTokenResponse()))

    const token = await getToken(BASE_CREDENTIALS)

    expect(token).toBe('test-token')
    expect(fetch).toHaveBeenCalledOnce()
    expect(fetch).toHaveBeenCalledWith(
      'https://akeneo.example.com/api/oauth/v1/token',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('sends Basic auth header with base64-encoded clientId:clientSecret', async () => {
    vi.stubGlobal('fetch', makeFetchMock(mockTokenResponse()))

    await getToken(BASE_CREDENTIALS)

    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit]
    const authHeader = (init.headers as Record<string, string>)['Authorization']
    expect(authHeader).toBe(`Basic ${btoa('client-id:client-secret')}`)
  })

  it('sends username and password in request body', async () => {
    vi.stubGlobal('fetch', makeFetchMock(mockTokenResponse()))

    await getToken(BASE_CREDENTIALS)

    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit]
    const body = JSON.parse(init.body as string)
    expect(body).toMatchObject({
      grant_type: 'password',
      username: 'user',
      password: 'pass',
    })
  })
})

describe('getToken — token cache', () => {
  it('returns cached token without a second fetch when called twice', async () => {
    vi.stubGlobal('fetch', makeFetchMock(mockTokenResponse()))

    const first = await getToken(BASE_CREDENTIALS)
    const second = await getToken(BASE_CREDENTIALS)

    expect(first).toBe('test-token')
    expect(second).toBe('test-token')
    expect(fetch).toHaveBeenCalledOnce()
  })

  it('re-fetches when cache is cleared', async () => {
    const fetchMock = makeFetchMock(mockTokenResponse())
    vi.stubGlobal('fetch', fetchMock)

    await getToken(BASE_CREDENTIALS)
    clearTokenCache()
    await getToken(BASE_CREDENTIALS)

    expect(fetch).toHaveBeenCalledTimes(2)
  })
})

describe('getToken — error handling', () => {
  it('throws when the token endpoint returns a non-OK status', async () => {
    vi.stubGlobal('fetch', makeFetchMock({}, false, 401))

    await expect(getToken(BASE_CREDENTIALS)).rejects.toThrow('Akeneo auth failed: 401')
  })
})
