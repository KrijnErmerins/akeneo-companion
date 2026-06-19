import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import type { AkeneoCredentials } from '../types/akeneo'

const FIELDS: { key: keyof AkeneoCredentials; label: string; placeholder: string; type?: string }[] = [
  { key: 'baseUrl', label: 'Akeneo URL', placeholder: 'https://ledkoning.cloud.akeneo.com' },
  { key: 'clientId', label: 'Client ID', placeholder: '' },
  { key: 'clientSecret', label: 'Client Secret', placeholder: '', type: 'password' },
  { key: 'username', label: 'Gebruikersnaam', placeholder: '' },
  { key: 'password', label: 'Wachtwoord', placeholder: '', type: 'password' },
]

function OptionsApp() {
  const [form, setForm] = useState<AkeneoCredentials>({
    baseUrl: '',
    clientId: '',
    clientSecret: '',
    username: '',
    password: '',
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    chrome.storage.local.get('credentials', ({ credentials }) => {
      if (credentials) setForm(credentials as AkeneoCredentials)
    })
  }, [])

  function save() {
    chrome.storage.local.set({ credentials: form }, () => {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <div>
      <h1 style={{ fontSize: 18, marginBottom: 24 }}>Akeneo Companion — Instellingen</h1>
      {FIELDS.map(({ key, label, placeholder, type }) => (
        <div key={key} style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{label}</label>
          <input
            type={type ?? 'text'}
            value={form[key]}
            placeholder={placeholder}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }}
          />
        </div>
      ))}
      <button
        onClick={save}
        style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
      >
        {saved ? 'Opgeslagen!' : 'Opslaan'}
      </button>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode><OptionsApp /></StrictMode>
)
