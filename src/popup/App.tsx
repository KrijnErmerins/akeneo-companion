import { useEffect, useState } from 'react'
import type { ExtensionResponse, ProductCompleteness } from '../types/akeneo'
import { DOMAIN_LOCALE_MAP } from '../types/akeneo'

function CompletenessBar({ ratio }: { ratio: number }) {
  const color = ratio === 100 ? '#22c55e' : ratio >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
        <span style={{ color: '#6b7280' }}>Completeness</span>
        <span style={{ fontWeight: 600, color }}>{ratio}%</span>
      </div>
      <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3 }}>
        <div style={{ height: '100%', width: `${ratio}%`, background: color, borderRadius: 3, transition: 'width .3s' }} />
      </div>
    </div>
  )
}

export default function App() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('loading')
  const [sku, setSku] = useState<string | null>(null)
  const [locale, setLocale] = useState<string>('nl_NL')
  const [completenesses, setCompletenesses] = useState<ProductCompleteness[]>([])
  const [errorMsg, setErrorMsg] = useState<string>('')

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      const url = tab?.url ?? ''
      const tld = new URL(url).hostname.split('.').pop() ?? 'nl'
      const detectedLocale = DOMAIN_LOCALE_MAP[tld] ?? 'nl_NL'
      setLocale(detectedLocale)

      // Ask content script for SKU via scripting
      chrome.tabs.sendMessage(tab!.id!, { type: 'GET_SKU' }, (response) => {
        const detectedSku: string | null = response?.sku ?? null
        setSku(detectedSku)

        if (!detectedSku) {
          setStatus('error')
          setErrorMsg('Geen SKU gevonden op deze pagina.')
          return
        }

        chrome.runtime.sendMessage(
          { type: 'GET_PRODUCT', sku: detectedSku, locale: detectedLocale },
          (res: ExtensionResponse) => {
            if (res.success && res.data) {
              setCompletenesses(res.data.completenesses)
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

  const relevant = completenesses.filter((c) => c.locale === locale)

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <strong style={{ fontSize: 14 }}>Akeneo Companion</strong>
        {sku && <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 'auto' }}>{sku}</span>}
      </div>

      {status === 'loading' && <p style={{ fontSize: 13, color: '#6b7280' }}>Ophalen...</p>}

      {status === 'error' && (
        <p style={{ fontSize: 13, color: '#ef4444' }}>{errorMsg}</p>
      )}

      {status === 'done' && relevant.length === 0 && (
        <p style={{ fontSize: 13, color: '#6b7280' }}>Geen completeness-data voor {locale}.</p>
      )}

      {status === 'done' &&
        relevant.map((c) => (
          <div key={`${c.channel}-${c.locale}`}>
            <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
              {c.channel} / {c.locale}
            </p>
            <CompletenessBar ratio={c.ratio} />
          </div>
        ))}

      <button
        onClick={() => chrome.runtime.openOptionsPage()}
        style={{ marginTop: 12, fontSize: 11, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        Instellingen
      </button>
    </div>
  )
}
