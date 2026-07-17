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
