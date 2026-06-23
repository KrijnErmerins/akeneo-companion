const GITHUB_REPO = 'KrijnErmerins/akeneo-companion'
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000 // 1 day

interface UpdateState {
  latestVersion: string
  checkedAt: number
  updateAvailable: boolean
}

function parseVersion(tag: string): string {
  return tag.replace(/^v/, '')
}

function isNewer(latest: string, current: string): boolean {
  const toNum = (v: string) => v.split('.').map(Number)
  const [la, lb, lc] = toNum(latest)
  const [ca, cb, cc] = toNum(current)
  if (la !== ca) return la > ca
  if (lb !== cb) return lb > cb
  return lc > cc
}

export async function checkForUpdate(): Promise<void> {
  const stored = await chrome.storage.local.get('updateState')
  const state = stored.updateState as UpdateState | undefined
  const currentVersion = chrome.runtime.getManifest().version

  if (state?.updateAvailable && !isNewer(state.latestVersion, currentVersion)) {
    await chrome.storage.local.set({ updateState: { ...state, updateAvailable: false } })
    chrome.action.setBadgeText({ text: '' })
    return
  }

  if (state && Date.now() - state.checkedAt < CHECK_INTERVAL_MS) return

  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
      { headers: { Accept: 'application/vnd.github+json' } },
    )
    if (!res.ok) return

    const json = await res.json() as { tag_name: string }
    const latestVersion = parseVersion(json.tag_name)
    const updateAvailable = isNewer(latestVersion, currentVersion)

    const newState: UpdateState = { latestVersion, checkedAt: Date.now(), updateAvailable }
    await chrome.storage.local.set({ updateState: newState })

    if (updateAvailable) {
      chrome.action.setBadgeText({ text: '↑' })
      chrome.action.setBadgeBackgroundColor({ color: '#7c3aed' })
    }
  } catch {
    // silently ignore — no network, rate limit, etc.
  }
}
