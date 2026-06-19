import { useEffect, useState } from 'react'
import type { ExtensionResponse, AttributeValue, ProductLookupResult } from '../types/akeneo'
import { DOMAIN_LOCALE_MAP, HOSTNAME_LOCALE_MAP } from '../types/akeneo'

const ACCENT = '#7c3aed'
const ACCENT_LIGHT = '#f5f3ff'
const TEXT = '#111827'
const TEXT_MUTED = '#6b7280'
const BORDER = '#e5e7eb'
const ERROR = '#dc2626'
const BG = '#ffffff'
const ROW_HOVER = '#fafafa'

function formatValue(data: unknown): string {
  if (data === null || data === undefined || data === '') return '—'
  if (typeof data === 'boolean') return data ? 'Ja' : 'Nee'
  if (Array.isArray(data)) {
    if (data.length === 0) return '—'
    return data
      .map((v) => (typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v)))
      .join(', ')
  }
  if (typeof data === 'object') return JSON.stringify(data)
  return String(data)
}

function resolveValue(values: AttributeValue[], locale: string): string {
  const match =
    values.find((v) => v.locale === locale) ??
    values.find((v) => v.locale === null) ??
    values[0]
  return match ? formatValue(match.data) : '—'
}

function Badge({ children }: { children: string }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      background: ACCENT_LIGHT,
      color: ACCENT,
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.02em',
    }}>
      {children}
    </span>
  )
}

function MetaTag({ children }: { children: string }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '1px 6px',
      background: '#f3f4f6',
      color: TEXT_MUTED,
      borderRadius: 4,
      fontSize: 10,
      fontWeight: 500,
    }}>
      {children}
    </span>
  )
}

function Row({ attr, value }: { attr: string; value: string }) {
  return (
    <tr
      style={{ borderBottom: `1px solid ${BORDER}`, cursor: 'default' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = ROW_HOVER }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      <td style={{
        padding: '6px 12px 6px 0',
        color: TEXT_MUTED,
        fontSize: 11,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        verticalAlign: 'top',
        userSelect: 'none',
        width: '40%',
      }}>
        {attr}
      </td>
      <td style={{
        padding: '6px 0',
        fontSize: 12,
        color: value === '—' ? '#d1d5db' : TEXT,
        wordBreak: 'break-word',
        lineHeight: 1.5,
      }}>
        {value}
      </td>
    </tr>
  )
}

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: TEXT_MUTED, fontSize: 13 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
        <circle cx="12" cy="12" r="10" stroke="#e5e7eb" strokeWidth="3" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" />
      </svg>
      Ophalen uit Akeneo…
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default function App() {
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')
  const [sku, setSku] = useState<string | null>(null)
  const [locale, setLocale] = useState<string>('nl_NL')
  const [product, setProduct] = useState<ProductLookupResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>('')

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      const url = tab?.url ?? ''
      const hostname = new URL(url).hostname
      const tld = hostname.split('.').pop() ?? 'nl'
      const detectedLocale = HOSTNAME_LOCALE_MAP[hostname] ?? DOMAIN_LOCALE_MAP[tld] ?? 'nl_NL'
      setLocale(detectedLocale)

      chrome.tabs.sendMessage(tab!.id!, { type: 'GET_SKU' }, (response) => {
        if (chrome.runtime.lastError || !response?.sku) {
          setStatus('error')
          setErrorMsg('Geen SKU gevonden op deze pagina.')
          return
        }

        const detectedSku: string = response.sku
        setSku(detectedSku)

        chrome.runtime.sendMessage(
          { type: 'GET_PRODUCT', sku: detectedSku, locale: detectedLocale },
          (res: ExtensionResponse) => {
            if (res.success && res.data) {
              setProduct(res.data)
              setStatus('done')
            } else {
              setStatus('error')
              setErrorMsg(res.error ?? 'Onbekende fout')
            }
          },
        )
      })
    })
  }, [])

  const entries = product ? Object.entries(product.values) : []
  const filledCount = entries.filter(([, v]) => resolveValue(v, locale) !== '—').length

  return (
    <div style={{
      width: 380,
      maxHeight: 560,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      background: BG,
      color: TEXT,
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: ACCENT_LIGHT,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>Akeneo Companion</div>
          {sku && (
            <div style={{ fontSize: 10, color: TEXT_MUTED, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {sku}
            </div>
          )}
        </div>
        {sku && <Badge>{locale}</Badge>}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {status === 'loading' && (
          <div style={{ padding: 20 }}>
            <Spinner />
          </div>
        )}

        {status === 'error' && (
          <div style={{
            margin: 16,
            padding: '10px 12px',
            background: '#fef2f2',
            border: `1px solid #fecaca`,
            borderRadius: 8,
            fontSize: 12,
            color: ERROR,
            lineHeight: 1.5,
          }}>
            {errorMsg}
          </div>
        )}

        {status === 'done' && product && (
          <>
            {/* Meta bar */}
            <div style={{
              padding: '8px 16px',
              borderBottom: `1px solid ${BORDER}`,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexShrink: 0,
            }}>
              <MetaTag>{product.type}</MetaTag>
              {product.family && <MetaTag>{product.family}</MetaTag>}
              <span style={{ marginLeft: 'auto', fontSize: 11, color: TEXT_MUTED }}>
                {filledCount}/{entries.length} ingevuld
              </span>
            </div>

            {/* Table */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '0 16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {entries.map(([attr, vals]) => (
                    <Row key={attr} attr={attr} value={resolveValue(vals, locale)} />
                  ))}
                </tbody>
              </table>
              {entries.length === 0 && (
                <p style={{ fontSize: 12, color: TEXT_MUTED, padding: '16px 0' }}>
                  Geen attributen gevonden.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
