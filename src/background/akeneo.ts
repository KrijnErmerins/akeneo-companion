import type { AkeneoCredentials, FamilyAttribute, ProductLookupResult } from '../types/akeneo'
import { getToken } from './auth'

async function apiFetch(baseUrl: string, path: string, token: string) {
  return fetch(`${baseUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function lookupProduct(
  sku: string,
  credentials: AkeneoCredentials,
): Promise<ProductLookupResult> {
  const token = await getToken(credentials)

  // Try simple product first
  const productRes = await apiFetch(
    credentials.baseUrl,
    `/api/rest/v1/products/${encodeURIComponent(sku)}`,
    token,
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
    token,
  )

  if (modelRes.ok) {
    const model = await modelRes.json()
    return {
      type: 'product-model',
      identifier: model.code,
      family: model.family_variant ?? null,
      values: model.values ?? {},
    }
  }

  throw new Error(`SKU "${sku}" not found in Akeneo (tried product + product-model)`)
}

export async function getFamilyAttributes(
  familyCode: string,
  credentials: AkeneoCredentials,
): Promise<FamilyAttribute[]> {
  const token = await getToken(credentials)
  const res = await apiFetch(
    credentials.baseUrl,
    `/api/rest/v1/families/${encodeURIComponent(familyCode)}`,
    token,
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
  token: string,
): Promise<T[]> {
  const results: T[] = []
  let nextUrl: string | null = `${baseUrl}${firstPath}`
  while (nextUrl) {
    const res = await fetch(nextUrl, { headers: { Authorization: `Bearer ${token}` } })
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
): Promise<Map<string, string>> {
  const token = await getToken(credentials)
  const items = await fetchAllPages<{ code: string; type: string }>(
    credentials.baseUrl,
    `/api/rest/v1/attributes?families[]=${encodeURIComponent(familyCode)}&limit=100`,
    token,
  )
  const map = new Map<string, string>()
  for (const item of items) map.set(item.code, item.type)
  return map
}

export async function getAttributeOptions(
  attributeCode: string,
  credentials: AkeneoCredentials,
): Promise<Map<string, Record<string, string>>> {
  const token = await getToken(credentials)
  const items = await fetchAllPages<{ code: string; labels: Record<string, string> }>(
    credentials.baseUrl,
    `/api/rest/v1/attributes/${encodeURIComponent(attributeCode)}/options?limit=100`,
    token,
  )
  const map = new Map<string, Record<string, string>>()
  for (const item of items) map.set(item.code, item.labels ?? {})
  return map
}
