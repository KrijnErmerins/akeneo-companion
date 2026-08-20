import type { AkeneoCredentials, FamilyAttribute, ProductLookupResult } from '../types/akeneo'
import { getToken, clearTokenCache } from './auth'

// On 401: clear cache and retry once with a fresh token. Second 401 → Dutch error.
async function authedFetch(url: string, credentials: AkeneoCredentials): Promise<Response> {
  const token = await getToken(credentials)
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (res.status !== 401) return res

  clearTokenCache()
  const freshToken = await getToken(credentials)
  const retry = await fetch(url, { headers: { Authorization: `Bearer ${freshToken}` } })
  if (retry.status === 401) {
    throw new Error('Credentials verlopen. Ga naar Instellingen om opnieuw in te loggen.')
  }
  return retry
}

async function apiFetch(baseUrl: string, path: string, credentials: AkeneoCredentials) {
  return authedFetch(`${baseUrl}${path}`, credentials)
}

export async function lookupProduct(
  sku: string,
  credentials: AkeneoCredentials,
): Promise<ProductLookupResult> {
  // Try simple product first
  const productRes = await apiFetch(
    credentials.baseUrl,
    `/api/rest/v1/products/${encodeURIComponent(sku)}`,
    credentials,
  )

  if (productRes.ok) {
    const product = await productRes.json()
    return {
      type: 'product',
      identifier: product.identifier,
      uuid: product.uuid,
      family: product.family ?? null,
      values: product.values ?? {},
    }
  }

  if (productRes.status !== 404) {
    throw new Error(`Akeneo product fetch failed: ${productRes.status}`)
  }

  // Fallback: product model
  const modelRes = await apiFetch(
    credentials.baseUrl,
    `/api/rest/v1/product-models/${encodeURIComponent(sku)}`,
    credentials,
  )

  if (modelRes.ok) {
    const model = await modelRes.json()
    return {
      type: 'product-model',
      identifier: model.code,
      family: model.family ?? null,
      values: model.values ?? {},
    }
  }

  throw new Error(`SKU "${sku}" not found in Akeneo (tried product + product-model)`)
}

export async function getFamilyAttributes(
  familyCode: string,
  credentials: AkeneoCredentials,
): Promise<FamilyAttribute[]> {
  const res = await apiFetch(
    credentials.baseUrl,
    `/api/rest/v1/families/${encodeURIComponent(familyCode)}`,
    credentials,
  )
  if (!res.ok) throw new Error(`Family fetch failed: ${res.status}`)
  const data = await res.json() as {
    attributes?: string[]
    attribute_requirements?: Record<string, string[]>
  }
  const allAttributes = data.attributes ?? []
  const requiredSet = new Set(Object.values(data.attribute_requirements ?? {}).flat())
  return allAttributes.map((code) => ({ code, required: requiredSet.has(code) }))
}

async function fetchAllPages<T>(
  baseUrl: string,
  firstPath: string,
  credentials: AkeneoCredentials,
): Promise<T[]> {
  const results: T[] = []
  let nextUrl: string | null = `${baseUrl}${firstPath}`
  while (nextUrl) {
    const res = await authedFetch(nextUrl, credentials)
    if (!res.ok) throw new Error(`Akeneo fetch failed: ${res.status}`)
    const page = await res.json() as { _embedded?: { items?: T[] }; _links?: { next?: { href?: string } } }
    results.push(...(page._embedded?.items ?? []))
    const nextHref = page._links?.next?.href
    nextUrl = nextHref ?? null
  }
  return results
}

export async function getAttributeTypes(
  familyCode: string,
  credentials: AkeneoCredentials,
): Promise<Map<string, { type: string; group: string }>> {
  const familyRes = await apiFetch(
    credentials.baseUrl,
    `/api/rest/v1/families/${encodeURIComponent(familyCode)}`,
    credentials,
  )
  if (!familyRes.ok) throw new Error(`Family fetch failed: ${familyRes.status}`)
  const familyData = await familyRes.json() as { attributes?: string[] }
  const codes = familyData.attributes ?? []
  const map = new Map<string, { type: string; group: string }>()
  if (codes.length === 0) return map

  const search = JSON.stringify({ code: [{ operator: 'IN', value: codes }] })
  const items = await fetchAllPages<{ code: string; type: string; group: string }>(
    credentials.baseUrl,
    `/api/rest/v1/attributes?search=${encodeURIComponent(search)}&limit=100`,
    credentials,
  )
  for (const item of items) map.set(item.code, { type: item.type, group: item.group })
  return map
}

export async function getAttributeGroups(
  credentials: AkeneoCredentials,
): Promise<Map<string, { labels: Record<string, string>; sortOrder: number }>> {
  const items = await fetchAllPages<{ code: string; sort_order: number; labels: Record<string, string> }>(
    credentials.baseUrl,
    `/api/rest/v1/attribute-groups?limit=100`,
    credentials,
  )
  const map = new Map<string, { labels: Record<string, string>; sortOrder: number }>()
  for (const item of items) map.set(item.code, { labels: item.labels ?? {}, sortOrder: item.sort_order })
  return map
}

export async function getAttributeOptions(
  attributeCode: string,
  credentials: AkeneoCredentials,
): Promise<Map<string, Record<string, string>>> {
  const items = await fetchAllPages<{ code: string; labels: Record<string, string> }>(
    credentials.baseUrl,
    `/api/rest/v1/attributes/${encodeURIComponent(attributeCode)}/options?limit=100`,
    credentials,
  )
  const map = new Map<string, Record<string, string>>()
  for (const item of items) map.set(item.code, item.labels ?? {})
  return map
}
