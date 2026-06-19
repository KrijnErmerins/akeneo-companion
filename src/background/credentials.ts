import type { AkeneoCredentials } from '../types/akeneo'

export const credentials: AkeneoCredentials = {
  baseUrl: import.meta.env.VITE_AKENEO_BASE_URL,
  clientId: import.meta.env.VITE_AKENEO_CLIENT_ID,
  clientSecret: import.meta.env.VITE_AKENEO_CLIENT_SECRET,
  username: import.meta.env.VITE_AKENEO_USERNAME,
  password: import.meta.env.VITE_AKENEO_PASSWORD,
}
