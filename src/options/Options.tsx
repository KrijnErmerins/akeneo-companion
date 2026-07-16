import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import type { AkeneoCredentials } from '../types/akeneo'
import { credentials as buildTimeCredentials } from '../background/credentials'
import {
  PRIMARY, PRIMARY_DARK, PRIMARY_LIGHT,
  CANVAS, BODY_BG, INK, BODY, MUTED, HAIRLINE, BORDER_STRONG,
  SUCCESS, SUCCESS_TEXT, DANGER_BG, DANGER_TEXT, DANGER_BORDER,
  FONT_HEADING, FONT_BODY,
} from '../tokens'

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
      setForm((credentials as AkeneoCredentials | undefined) ?? buildTimeCredentials)
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
    <div style={{
      maxWidth: 480,
      margin: '0 auto',
      fontFamily: FONT_BODY,
      fontSize: 14,
      color: INK,
    }}>
      {/* Card */}
      <div style={{
        background: CANVAS,
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}>
        {/* Card header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${HAIRLINE}`,
          background: BODY_BG,
        }}>
          <h1 style={{
            fontSize: 20,
            fontWeight: 700,
            fontFamily: FONT_HEADING,
            letterSpacing: '-0.025em',
            color: INK,
            lineHeight: 1.2,
            margin: 0,
          }}>
            Akeneo Companion
          </h1>
          <p style={{ fontSize: 13, color: MUTED, marginTop: 4, fontFamily: FONT_BODY }}>
            Instellingen
          </p>
        </div>

        {/* Card body */}
        <div style={{ padding: 20 }}>
          {FIELDS.map(({ key, label, placeholder, type }) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 500,
                fontFamily: FONT_BODY,
                color: BODY,
                marginBottom: 6,
              }}>
                {label}
              </label>
              <input
                type={type ?? 'text'}
                value={form[key]}
                placeholder={placeholder}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '7px 12px',
                  border: `1px solid ${HAIRLINE}`,
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: FONT_BODY,
                  color: INK,
                  background: CANVAS,
                  outline: 'none',
                  boxSizing: 'border-box',
                  lineHeight: 1.5,
                  transition: 'border-color 150ms, box-shadow 150ms',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = PRIMARY
                  e.target.style.boxShadow = `0 0 0 3px ${PRIMARY_LIGHT}`
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = HAIRLINE
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          ))}

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
            <button
              onClick={save}
              style={{
                padding: '7px 14px',
                background: PRIMARY,
                color: '#000000',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                fontFamily: FONT_BODY,
                lineHeight: 1.4,
                transition: 'background 150ms',
              }}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = PRIMARY_DARK }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = saved ? PRIMARY : PRIMARY }}
            >
              {saved ? 'Opgeslagen!' : 'Opslaan'}
            </button>
            <button
              onClick={testConnection}
              disabled={testStatus === 'testing'}
              style={{
                padding: '7px 14px',
                background: CANVAS,
                color: BODY,
                border: `1px solid ${BORDER_STRONG}`,
                borderRadius: 8,
                cursor: testStatus === 'testing' ? 'wait' : 'pointer',
                fontSize: 14,
                fontWeight: 500,
                fontFamily: FONT_BODY,
                lineHeight: 1.4,
                transition: 'background 150ms, border-color 150ms',
              }}
              onMouseEnter={(e) => {
                const btn = e.target as HTMLButtonElement
                if (!btn.disabled) {
                  btn.style.background = BODY_BG
                  btn.style.borderColor = BORDER_STRONG
                }
              }}
              onMouseLeave={(e) => {
                const btn = e.target as HTMLButtonElement
                btn.style.background = CANVAS
                btn.style.borderColor = BORDER_STRONG
              }}
            >
              {testStatus === 'testing' ? 'Testen…' : 'Test verbinding'}
            </button>
            {testStatus === 'ok' && (
              <span style={{
                color: SUCCESS_TEXT,
                fontSize: 13,
                fontWeight: 500,
                fontFamily: FONT_BODY,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <span style={{ color: SUCCESS }}>✓</span> Verbinding OK
              </span>
            )}
          </div>

          {testStatus === 'error' && (
            <div style={{
              marginTop: 12,
              padding: '12px 14px',
              background: DANGER_BG,
              border: `1px solid ${DANGER_BORDER}`,
              borderRadius: 12,
              fontSize: 13,
              fontFamily: FONT_BODY,
              color: DANGER_TEXT,
              lineHeight: 1.5,
            }}>
              {testError}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode><OptionsApp /></StrictMode>
)
