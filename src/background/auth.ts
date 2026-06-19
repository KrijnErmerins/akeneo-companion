import type { AkeneoCredentials, AkeneoToken } from '../types/akeneo'

let cachedToken: AkeneoToken | null = null

export async function getToken(credentials: AkeneoCredentials): Promise<string> {
  const now = Date.now()

  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.accessToken
  }

  const response = await fetch(`${credentials.baseUrl}/api/oauth/v1/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${btoa(`${credentials.clientId}:${credentials.clientSecret}`)}`,
    },
    body: JSON.stringify({
      grant_type: 'password',
      username: credentials.username,
      password: credentials.password,
    }),
  })

  if (!response.ok) {
    throw new Error(`Akeneo auth failed: ${response.status}`)
  }

  const data = await response.json()

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  }

  return cachedToken.accessToken
}

export function clearTokenCache() {
  cachedToken = null
}
