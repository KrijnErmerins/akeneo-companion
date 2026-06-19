import type { AkeneoCredentials, ProductLookupResult, ProductCompleteness } from '../types/akeneo'
import { getToken } from './auth'

async function apiFetch(baseUrl: string, path: string, token: string) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response
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
    const completenesses: ProductCompleteness[] = product.completenesses ?? []
    return {
      type: 'product',
      identifier: product.identifier,
      family: product.family ?? null,
      completenesses,
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
      completenesses: [],
    }
  }

  throw new Error(`SKU "${sku}" not found in Akeneo (tried product + product-model)`)
}
