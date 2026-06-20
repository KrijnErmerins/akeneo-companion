import { useEffect, useState } from 'react'
import type { ExtensionResponse, AttributeValue, ProductLookupResult } from '../types/akeneo'
import { DOMAIN_LOCALE_MAP, HOSTNAME_LOCALE_MAP } from '../types/akeneo'

const CANVAS   = '#fdfcfc'
const INK      = '#201d1d'
const BODY     = '#424245'
const MUTE     = '#646262'
const ASH      = '#9a9898'
const HAIRLINE = 'rgba(15,0,0,0.12)'
const DANGER   = '#ff3b30'
const SURFACE  = '#f8f7f7'

const MONO = "'IBM Plex Mono', ui-monospace, monospace"

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

function Chip({ children }: { children: string }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '1px 6px',
      border: `1px solid ${HAIRLINE}`,
      borderRadius: 4,
      fontSize: 10,
      fontFamily: MONO,
      color: MUTE,
      letterSpacing: '0.02em',
    }}>
      {children}
    </span>
  )
}

function Row({ attr, value }: { attr: string; value: string }) {
  const missing = value === '—'
  return (
    <tr style={{ borderBottom: `1px solid ${HAIRLINE}`, cursor: 'default' }}>
      <td style={{
        padding: '5px 12px 5px 0',
        color: ASH,
        fontSize: 10,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        verticalAlign: 'top',
        userSelect: 'none',
        width: '38%',
      }}>
        {attr}
      </td>
      <td style={{
        padding: '5px 0',
        fontSize: 11,
        color: missing ? ASH : BODY,
        wordBreak: 'break-word',
        lineHeight: 1.5,
      }}>
        <span style={{ color: missing ? ASH : MUTE, marginRight: 4 }}>
          {missing ? '[-]' : '[+]'}
        </span>
        {missing ? '—' : value}
      </td>
    </tr>
  )
}

const PIMPORT_DOWNLOAD_URL = 'https://github.com/KrijnErmerins/akeneo-companion/releases/latest/download/akeneo-companion.zip'

function UpdateBanner({ version }: { version: string }) {
  return (
    <div style={{
      padding: '6px 16px',
      borderBottom: `1px solid ${HAIRLINE}`,
      background: SURFACE,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 10,
      fontFamily: MONO,
      color: MUTE,
      flexShrink: 0,
    }}>
      <span>[↑] v{version} beschikbaar —</span>
      <a
        href={PIMPORT_DOWNLOAD_URL}
        target="_blank"
        rel="noreferrer"
        style={{ color: INK, fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' }}
      >
        download
      </a>
    </div>
  )
}

function Loader() {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % 4), 220)
    return () => clearInterval(id)
  }, [])
  const dots = ['.  ', '.. ', '...', '.. '][frame]
  return (
    <div style={{ padding: '20px 16px', fontSize: 11, color: MUTE, fontFamily: MONO }}>
      [{dots}] Ophalen uit Akeneo
    </div>
  )
}

export default function App() {
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')
  const [sku, setSku] = useState<string | null>(null)
  const [locale, setLocale] = useState<string>('nl_NL')
  const [product, setProduct] = useState<ProductLookupResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [updateVersion, setUpdateVersion] = useState<string | null>(null)

  useEffect(() => {
    chrome.storage.local.get('updateState', (result) => {
      const state = result.updateState as { updateAvailable: boolean; latestVersion: string } | undefined
      if (state?.updateAvailable) setUpdateVersion(state.latestVersion)
    })
  }, [])

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
      width: 480,
      maxHeight: 560,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: MONO,
      background: CANVAS,
      color: INK,
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 16px',
        borderBottom: `1px solid ${HAIRLINE}`,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: INK }}>
            AKENEO COMPANION
          </div>
          {sku && (
            <div style={{ fontSize: 10, color: MUTE, marginTop: 2 }}>
              {sku}
            </div>
          )}
        </div>
        {sku && (
          <span style={{
            fontSize: 10,
            color: MUTE,
            border: `1px solid ${HAIRLINE}`,
            borderRadius: 4,
            padding: '1px 6px',
            flexShrink: 0,
            marginTop: 1,
          }}>
            {locale}
          </span>
        )}
      </div>

      {updateVersion && <UpdateBanner version={updateVersion} />}

      {/* Body */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {status === 'loading' && <Loader />}

        {status === 'error' && (
          <div style={{
            margin: 16,
            padding: '8px 12px',
            border: `1px solid ${HAIRLINE}`,
            borderRadius: 4,
            background: SURFACE,
            fontSize: 11,
            color: DANGER,
            lineHeight: 1.5,
          }}>
            <span style={{ marginRight: 6 }}>[!]</span>{errorMsg}
          </div>
        )}

        {status === 'done' && product && (
          <>
            {/* Meta bar */}
            <div style={{
              padding: '7px 16px',
              borderBottom: `1px solid ${HAIRLINE}`,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexShrink: 0,
            }}>
              <Chip>{product.type}</Chip>
              {product.family && <Chip>{product.family}</Chip>}
              <span style={{ marginLeft: 'auto', fontSize: 10, color: ASH }}>
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
                <p style={{ fontSize: 11, color: MUTE, padding: '16px 0' }}>
                  [-] Geen attributen gevonden.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
