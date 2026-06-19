import type { AkeneoCredentials } from '../types/akeneo'

export async function getCredentials(): Promise<AkeneoCredentials> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('credentials', ({ credentials }) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
        return
      }
      if (!credentials) {
        reject(
          new Error(
            'Credentials niet ingesteld. Rechtermuisklik op het extensie-icoon → Opties.',
          ),
        )
        return
      }
      resolve(credentials as AkeneoCredentials)
    })
  })
}
