import { useEffect, useState } from 'react'
import DOMPurify from 'dompurify'
import type { ExtensionResponse, AttributeValue, FamilyAttribute, FamilyAttributesResponse, ProductLookupResult } from '../types/akeneo'
import { DOMAIN_LOCALE_MAP, HOSTNAME_LOCALE_MAP } from '../types/akeneo'
import {
  PRIMARY, PRIMARY_DARK, PRIMARY_LIGHT, PRIMARY_MID,
  CANVAS, BODY_BG, INK, BODY, MUTED, HAIRLINE,
  DANGER, DANGER_BG, DANGER_TEXT, DANGER_BORDER,
  SUCCESS, FONT_HEADING, FONT_BODY,
} from '../tokens'

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

function isHtml(str: string): boolean {
  return /<[a-z][\s\S]*>/i.test(str)
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
      padding: '4px 10px',
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

function Row({ attr, value, required }: { attr: string; value: string; required?: boolean }) {
  const missing = value === '—'
  const dotColor = missing ? (required ? DANGER : HAIRLINE) : SUCCESS
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
          background: dotColor,
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
        color: missing ? (required ? DANGER_TEXT : MUTED) : BODY,
        wordBreak: 'break-word',
        lineHeight: 1.5,
      }}>
        {missing ? '—' : isHtml(value)
          ? <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(value) }} />
          : value
        }
      </td>
    </tr>
  )
}

const LOCALES = ['nl_NL', 'nl_BE', 'de_DE'] as const

const PIMPORT_DOWNLOAD_URL = 'https://github.com/KrijnErmerins/akeneo-companion/releases/latest/download/akeneo-companion.zip'

const UPDATE_STEPS = [
  'Klik op "Download" hieronder om de ZIP te downloaden.',
  'Pak het ZIP-bestand uit naar een vaste map (bijv. C:\\Extensions\\akeneo-companion).',
  'Ga naar chrome://extensions in een nieuw tabblad.',
  'Klik op het ververs-icoon (↺) bij Akeneo Companion — klaar!',
]

function UpdateBanner({ version }: { version: string }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div style={{
      borderBottom: `1px solid ${HAIRLINE}`,
      background: PRIMARY_LIGHT,
      flexShrink: 0,
    }}>
      <div style={{
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 12,
        fontFamily: FONT_BODY,
        color: PRIMARY,
      }}>
        <span style={{ fontWeight: 500 }}>Update beschikbaar: v{version}</span>
        <button
          onClick={() => setExpanded((e) => !e)}
          title={expanded ? 'Verberg instructies' : 'Toon update-instructies'}
          style={{
            background: 'none',
            border: 'none',
            padding: '0 4px',
            cursor: 'pointer',
            color: PRIMARY,
            fontSize: 11,
            fontFamily: FONT_BODY,
            fontWeight: 500,
            textDecoration: 'underline',
          }}
        >
          {expanded ? 'Verberg' : 'Hoe updaten?'}
        </button>
        <a
          href={PIMPORT_DOWNLOAD_URL}
          target="_blank"
          rel="noreferrer"
          style={{ color: PRIMARY_DARK, fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', marginLeft: 'auto' }}
        >
          Download
        </a>
      </div>
      {expanded && (
        <div style={{
          padding: '0 16px 10px',
          fontSize: 12,
          fontFamily: FONT_BODY,
          color: PRIMARY,
        }}>
          <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
            {UPDATE_STEPS.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}
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
  const [familyAttrs, setFamilyAttrs] = useState<FamilyAttribute[] | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [updateVersion, setUpdateVersion] = useState<string | null>(null)
  const [akeneoBaseUrl, setAkeneoBaseUrl] = useState<string>(import.meta.env.VITE_AKENEO_BASE_URL as string ?? '')
  const [filterQuery, setFilterQuery] = useState<string>('')
  const [localeHover, setLocaleHover] = useState(false)

  useEffect(() => {
    chrome.storage.local.get('credentials', ({ credentials }) => {
      const baseUrl = (credentials as { baseUrl?: string } | undefined)?.baseUrl
      if (baseUrl) setAkeneoBaseUrl(baseUrl)
    })
  }, [])

  useEffect(() => {
    chrome.storage.local.get('updateState', (result) => {
      const state = result.updateState as { updateAvailable: boolean; latestVersion: string } | undefined
      if (state?.updateAvailable) {
        const cur = chrome.runtime.getManifest().version.split('.').map(Number)
        const lat = state.latestVersion.split('.').map(Number)
        let latestIsNewer = false
        for (let i = 0; i < 3; i++) {
          const l = lat[i] ?? 0; const c = cur[i] ?? 0
          if (l > c) { latestIsNewer = true; break }
          if (l < c) break
        }
        if (latestIsNewer) setUpdateVersion(state.latestVersion)
      }
    })
  }, [])

  useEffect(() => {
    if (!product?.family) return
    chrome.runtime.sendMessage(
      { type: 'GET_FAMILY_ATTRIBUTES', familyCode: product.family },
      (res: FamilyAttributesResponse) => {
        if (res.success && res.data) setFamilyAttrs(res.data)
      },
    )
  }, [product?.family])

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
          setErrorMsg('Geen SKU gevonden. Zorg dat je op een productpagina staat en ververs de pagina (F5).')
          return
        }

        chrome.scripting.executeScript({ target: { tabId }, files }, () => {
          if (chrome.runtime.lastError) {
            setStatus('error')
            setErrorMsg('Geen SKU gevonden. Zorg dat je op een productpagina staat en ververs de pagina (F5).')
            return
          }
          // Use a second executeScript instead of sendMessage to avoid the listener race condition.
          // sku-detector.ts stores the extracted SKU on window.__lk_sku when it runs.
          chrome.scripting.executeScript({
            target: { tabId },
            func: () => (window as Window & { __lk_sku?: string | null }).__lk_sku ?? null,
          }, (results) => {
            const retrySku = results?.[0]?.result as string | null
            if (retrySku) {
              lookupAndRender(retrySku)
            } else {
              setStatus('error')
              setErrorMsg('Geen SKU gevonden. Zorg dat je op een productpagina staat en ververs de pagina (F5).')
            }
          })
        })
      })
    })
  }, [])

  const allEntries = product ? Object.entries(product.values) : []
  const requiredSet = new Set(familyAttrs?.filter((a) => a.required).map((a) => a.code) ?? [])

  const filteredEntries = filterQuery
    ? allEntries.filter(([attr]) => prettifyAttr(attr).toLowerCase().includes(filterQuery.toLowerCase()))
    : allEntries

  const sortedEntries = familyAttrs
    ? [...filteredEntries].sort(([a], [b]) => {
        const aReq = requiredSet.has(a)
        const bReq = requiredSet.has(b)
        if (aReq && !bReq) return -1
        if (!aReq && bReq) return 1
        return 0
      })
    : filteredEntries

  const FILL_LOCALES = [
    { key: 'nl_NL', label: 'NL' },
    { key: 'nl_BE', label: 'BE' },
    { key: 'de_DE', label: 'DE' },
  ]
  const fillByLocale = FILL_LOCALES.map(({ key, label }) => ({
    key, label,
    count: allEntries.filter(([, v]) => resolveValue(v, key) !== '—').length,
  }))

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginTop: 1 }}>
            <span
              title="Klik om locale te wisselen"
              onClick={() => {
                const idx = LOCALES.indexOf(locale as typeof LOCALES[number])
                setLocale(LOCALES[(idx + 1) % LOCALES.length])
              }}
              onMouseEnter={() => setLocaleHover(true)}
              onMouseLeave={() => setLocaleHover(false)}
              style={{
                fontSize: 11,
                color: localeHover ? PRIMARY : MUTED,
                background: localeHover ? PRIMARY_LIGHT : BODY_BG,
                border: `1px solid ${localeHover ? PRIMARY_MID : HAIRLINE}`,
                borderRadius: 8,
                padding: '3px 8px',
                fontFamily: FONT_BODY,
                fontWeight: 500,
                lineHeight: 1.4,
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'color 0.1s, background 0.1s, border-color 0.1s',
              }}
            >
              {locale}
            </span>
            {status === 'done' && product && (
              <button
                title="Bekijk in Akeneo"
                onClick={() => {
                  const segment = product.type === 'product-model' ? 'product-model' : 'product'
                  const identifier = product.type === 'product-model' ? sku : (product.uuid ?? sku)
                  chrome.tabs.create({ url: `${akeneoBaseUrl}/#/enrich/${segment}/${identifier}` })
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'none',
                  border: 'none',
                  padding: 2,
                  cursor: 'pointer',
                  color: PRIMARY,
                  borderRadius: 4,
                  lineHeight: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 2H2.5A1.5 1.5 0 0 0 1 3.5v8A1.5 1.5 0 0 0 2.5 13h8A1.5 1.5 0 0 0 12 11.5V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8.5 1H13v4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13 1L6.5 7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
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
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
                {fillByLocale.map(({ key, label, count }) => (
                  <span key={key} style={{
                    fontSize: 11,
                    fontFamily: FONT_BODY,
                    fontWeight: key === locale ? 700 : 400,
                    color: key === locale ? INK : MUTED,
                  }}>
                    {label} {count}/{allEntries.length}
                  </span>
                ))}
              </div>
            </div>

            {/* Search */}
            <div style={{
              padding: '8px 16px',
              borderBottom: `1px solid ${HAIRLINE}`,
              flexShrink: 0,
              background: CANVAS,
            }}>
              <div style={{ position: 'relative' }}>
                <svg
                  width="13" height="13" viewBox="0 0 13 13" fill="none"
                  style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: MUTED, pointerEvents: 'none' }}
                >
                  <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M8.5 8.5L11 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Zoek attribuut…"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    paddingLeft: 28,
                    paddingRight: filterQuery ? 28 : 10,
                    paddingTop: 6,
                    paddingBottom: 6,
                    fontSize: 12,
                    fontFamily: FONT_BODY,
                    color: INK,
                    background: BODY_BG,
                    border: `1px solid ${HAIRLINE}`,
                    borderRadius: 8,
                    outline: 'none',
                  }}
                />
                {filterQuery && (
                  <button
                    onClick={() => setFilterQuery('')}
                    style={{
                      position: 'absolute',
                      right: 7,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      color: MUTED,
                      lineHeight: 0,
                      fontSize: 14,
                    }}
                    title="Wis filter"
                  >×</button>
                )}
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '0 16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {sortedEntries.map(([attr, vals]) => {
                    const value = resolveValue(vals, locale)
                    return <Row key={attr} attr={attr} value={value} required={requiredSet.has(attr)} />
                  })}
                </tbody>
              </table>
              {filteredEntries.length === 0 && (
                <p style={{ fontSize: 13, color: MUTED, padding: '20px 0', fontFamily: FONT_BODY }}>
                  {filterQuery ? `Geen resultaten voor "${filterQuery}".` : 'Geen attributen gevonden.'}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => chrome.runtime.openOptionsPage()}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              color: MUTED,
              fontSize: 11,
              fontFamily: FONT_BODY,
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Instellingen
          </button>
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
    </div>
  )
}
