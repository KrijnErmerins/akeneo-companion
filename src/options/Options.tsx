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

type TestStatus = 'idle' | 'testing' | 'ok' | 'error'

async function testAkeneoConnection(creds: AkeneoCredentials): Promise<void> {
  const res = await fetch(`${creds.baseUrl}/api/oauth/v1/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${btoa(`${creds.clientId}:${creds.clientSecret}`)}`,
    },
    body: JSON.stringify({
      grant_type: 'password',
      username: creds.username,
      password: creds.password,
    }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Auth mislukt: HTTP ${res.status}${body ? ` — ${body.slice(0, 120)}` : ''}`)
  }
  await res.json()
}

function OptionsApp() {
  const [form, setForm] = useState<AkeneoCredentials>({
    baseUrl: '',
    clientId: '',
    clientSecret: '',
    username: '',
    password: '',
  })
  const [saved, setSaved] = useState(false)
  const [testStatus, setTestStatus] = useState<TestStatus>('idle')
  const [testError, setTestError] = useState('')

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

  async function testConnection() {
    setTestStatus('testing')
    setTestError('')
    try {
      await testAkeneoConnection(form)
      setTestStatus('ok')
    } catch (err) {
      setTestStatus('error')
      setTestError((err as Error).message)
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '32px auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: 14 }}>
      <h1 style={{ fontSize: 18, marginBottom: 24 }}>Akeneo Companion — Instellingen</h1>
      {FIELDS.map(({ key, label, placeholder, type }) => (
        <div key={key} style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{label}</label>
          <input
            type={type ?? 'text'}
            value={form[key]}
            placeholder={placeholder}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }}
          />
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
        <button
          onClick={save}
          style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
        >
          {saved ? 'Opgeslagen!' : 'Opslaan'}
        </button>
        <button
          onClick={testConnection}
          disabled={testStatus === 'testing'}
          style={{ padding: '8px 16px', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: 6, cursor: testStatus === 'testing' ? 'wait' : 'pointer', fontSize: 13 }}
        >
          {testStatus === 'testing' ? 'Testen…' : 'Test verbinding'}
        </button>
        {testStatus === 'ok' && (
          <span style={{ color: '#16a34a', fontSize: 13, fontWeight: 500 }}>✓ Verbinding OK</span>
        )}
      </div>
      {testStatus === 'error' && (
        <div style={{ marginTop: 12, padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, fontSize: 12, color: '#dc2626', lineHeight: 1.5 }}>
          {testError}
        </div>
      )}
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode><OptionsApp /></StrictMode>
)
