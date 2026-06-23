import { useEffect, useState } from 'react'
import type { ExtensionResponse, AttributeValue, ProductLookupResult } from '../types/akeneo'
import { DOMAIN_LOCALE_MAP, HOSTNAME_LOCALE_MAP } from '../types/akeneo'

// Design tokens from DESIGN.md
const PRIMARY       = '#4386F0'
const PRIMARY_DARK  = '#2D6DE0'
const PRIMARY_LIGHT = '#E8F0FE'
const PRIMARY_MID   = '#C5D8FC'
const CANVAS        = '#FFFFFF'
const BODY_BG       = '#F8FAFC'
const INK           = '#333333'
const BODY          = '#4B5563'
const MUTED         = '#6B7280'
const HAIRLINE      = '#E2E8F0'
const DANGER        = '#DC2626'
const DANGER_BG     = '#FEF2F2'
const DANGER_TEXT   = '#991B1B'
const DANGER_BORDER = '#FECACA'
const SUCCESS       = '#22C55E'

const FONT_HEADING = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
const FONT_BODY    = "'Open Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif"

const UNIT_MAP: Record<string, string> = {
  WATT: 'W', KILOWATT: 'kW',
  KILOGRAM: 'kg', GRAM: 'g', MILLIGRAM: 'mg',
  METER: 'm', CENTIMETER: 'cm', MILLIMETER: 'mm',
  LUMEN: 'lm', KELVIN: 'K', VOLT: 'V', AMPERE: 'A',
  CELSIUS: '°C', FAHRENHEIT: '°F',
}

function formatObj(obj: Record<string, unknown>): string {
  const { amount, unit, symbol, currency } = obj as { amount?: unknown; unit?: unknown; symbol?: unknown; currency?: unknown }
  const numericAmount = typeof amount === 'number' ? amount : (typeof amount === 'string' ? parseFloat(amount) : NaN)
  if (!isNaN(numericAmount) && typeof unit === 'string') {
    const displayUnit = typeof symbol === 'string' && symbol ? symbol : (UNIT_MAP[unit.toUpperCase()] ?? unit)
    return `${numericAmount} ${displayUnit}`
  }
  if (!isNaN(numericAmount) && typeof currency === 'string') {
    try {
      return new Intl.NumberFormat('nl-NL', { style: 'currency', currency }).format(numericAmount)
    } catch {
      return `${numericAmount} ${currency}`
    }
  }
  return Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join(', ')
}

function formatValue(data: unknown): string {
  if (data === null || data === undefined || data === '') return '—'
  if (typeof data === 'boolean') return data ? 'Ja' : 'Nee'
  if (Array.isArray(data)) {
    if (data.length === 0) return '—'
    return data
      .map((v) => (typeof v === 'object' && v !== null ? formatObj(v as Record<string, unknown>) : String(v)))
      .join(', ')
  }
  if (typeof data === 'object') return formatObj(data as Record<string, unknown>)
  return String(data)
}

function prettifyAttr(key: string): string {
  return key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
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
      padding: '2px 8px',
      background: PRIMARY_LIGHT,
      border: `1px solid ${PRIMARY_MID}`,
      borderRadius: 999,
      fontSize: 11,
      fontFamily: FONT_BODY,
      fontWeight: 600,
      color: PRIMARY,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
      lineHeight: 1.4,
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
        padding: '6px 12px 6px 0',
        color: MUTED,
        fontSize: 11,
        fontWeight: 600,
        fontFamily: FONT_BODY,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        verticalAlign: 'top',
        userSelect: 'none',
        width: '38%',
        lineHeight: 1.4,
      }}>
        <span style={{
          display: 'inline-block',
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: !missing ? SUCCESS : HAIRLINE,
          marginRight: 6,
          verticalAlign: 'middle',
          flexShrink: 0,
        }} />
        {prettifyAttr(attr)}
      </td>
      <td style={{
        padding: '6px 0',
        fontSize: 13,
        fontFamily: FONT_BODY,
        color: missing ? MUTED : BODY,
        wordBreak: 'break-word',
        lineHeight: 1.5,
      }}>
        {missing ? '—' : value}
      </td>
    </tr>
  )
}

const PIMPORT_DOWNLOAD_URL = 'https://github.com/KrijnErmerins/akeneo-companion/releases/latest/download/akeneo-companion.zip'

function UpdateBanner({ version }: { version: string }) {
  return (
    <div style={{
      padding: '8px 16px',
      borderBottom: `1px solid ${HAIRLINE}`,
      background: PRIMARY_LIGHT,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 12,
      fontFamily: FONT_BODY,
      color: PRIMARY,
      flexShrink: 0,
    }}>
      <span style={{ fontWeight: 500 }}>Update beschikbaar: v{version}</span>
      <a
        href={PIMPORT_DOWNLOAD_URL}
        target="_blank"
        rel="noreferrer"
        style={{ color: PRIMARY_DARK, fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', marginLeft: 'auto' }}
      >
        Download
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
  const dots = ['●  ', '●● ', '●●●', '●● '][frame]
  return (
    <div style={{
      padding: '24px 16px',
      fontSize: 13,
      fontFamily: FONT_BODY,
      color: MUTED,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      <span style={{ color: PRIMARY, letterSpacing: '0.15em', fontSize: 10 }}>{dots}</span>
      <span>Ophalen uit Akeneo</span>
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

      const tabId = tab!.id!

      const fetchSku = (callback: (sku: string | null) => void) => {
        chrome.tabs.sendMessage(tabId, { type: 'GET_SKU' }, (response) => {
          if (chrome.runtime.lastError || !response?.sku) {
            callback(null)
          } else {
            callback(response.sku as string)
          }
        })
      }

      const lookupAndRender = (sku: string) => {
        setSku(sku)
        chrome.runtime.sendMessage(
          { type: 'GET_PRODUCT', sku, locale: detectedLocale },
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
      }

      fetchSku((sku) => {
        if (sku) {
          lookupAndRender(sku)
          return
        }

        // Content script not present — inject it and retry once
        const files = (chrome.runtime.getManifest().content_scripts?.[0]?.js ?? []) as string[]
        if (files.length === 0) {
          setStatus('error')
          setErrorMsg('Geen SKU gevonden op deze pagina.')
          return
        }

        chrome.scripting.executeScript({ target: { tabId }, files }, () => {
          if (chrome.runtime.lastError) {
            setStatus('error')
            setErrorMsg('Geen SKU gevonden op deze pagina.')
            return
          }
          fetchSku((retrySku) => {
            if (retrySku) {
              lookupAndRender(retrySku)
            } else {
              setStatus('error')
              setErrorMsg('Geen SKU gevonden op deze pagina.')
            }
          })
        })
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
      fontFamily: FONT_BODY,
      background: CANVAS,
      color: INK,
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${HAIRLINE}`,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexShrink: 0,
        background: CANVAS,
      }}>
        <div>
          <div style={{
            fontSize: 16,
            fontWeight: 700,
            fontFamily: FONT_HEADING,
            letterSpacing: '-0.025em',
            color: INK,
            lineHeight: 1.2,
          }}>
            Akeneo Companion
          </div>
          {sku && (
            <div style={{
              fontSize: 12,
              color: MUTED,
              marginTop: 3,
              fontFamily: FONT_BODY,
              fontWeight: 400,
            }}>
              {sku}
            </div>
          )}
        </div>
        {sku && (
          <span style={{
            fontSize: 11,
            color: MUTED,
            background: BODY_BG,
            border: `1px solid ${HAIRLINE}`,
            borderRadius: 8,
            padding: '3px 8px',
            fontFamily: FONT_BODY,
            fontWeight: 500,
            flexShrink: 0,
            marginTop: 1,
            lineHeight: 1.4,
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
            padding: '12px 14px',
            border: `1px solid ${DANGER_BORDER}`,
            borderRadius: 12,
            background: DANGER_BG,
            fontSize: 13,
            fontFamily: FONT_BODY,
            color: DANGER_TEXT,
            lineHeight: 1.5,
          }}>
            <span style={{ marginRight: 6, color: DANGER }}>⚠</span>{errorMsg}
          </div>
        )}

        {status === 'done' && product && (
          <>
            {/* Meta bar */}
            <div style={{
              padding: '8px 16px',
              borderBottom: `1px solid ${HAIRLINE}`,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexShrink: 0,
              background: BODY_BG,
            }}>
              <Chip>{product.type}</Chip>
              {product.family && <Chip>{product.family}</Chip>}
              <span style={{ marginLeft: 'auto', fontSize: 11, color: MUTED, fontFamily: FONT_BODY }}>
                {filledCount}/{entries.length} ingevuld
              </span>
            </div>

            {/* Table */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '0 16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {entries.map(([attr, vals]) => {
                    const value = resolveValue(vals, locale)
                    return <Row key={attr} attr={attr} value={value} />
                  })}
                </tbody>
              </table>
              {entries.length === 0 && (
                <p style={{ fontSize: 13, color: MUTED, padding: '20px 0', fontFamily: FONT_BODY }}>
                  Geen attributen gevonden.
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 16px',
        borderTop: `1px solid ${HAIRLINE}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        fontSize: 11,
        color: MUTED,
        fontFamily: FONT_BODY,
        background: CANVAS,
      }}>
        <span>v{chrome.runtime.getManifest().version}</span>
        <a
          href={PIMPORT_DOWNLOAD_URL}
          target="_blank"
          rel="noreferrer"
          style={{ color: PRIMARY, textDecoration: 'none', cursor: 'pointer', fontWeight: 500 }}
        >
          Download
        </a>
      </div>
    </div>
  )
}
