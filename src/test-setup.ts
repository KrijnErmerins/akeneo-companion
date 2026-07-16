import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Minimal Chrome extension API mock
const chromeMock = {
  storage: {
    local: {
      get: vi.fn((_keys: unknown, cb: (result: Record<string, unknown>) => void) => cb({})),
      set: vi.fn((_items: unknown, cb?: () => void) => cb?.()),
    },
  },
  runtime: {
    lastError: undefined as chrome.runtime.LastError | undefined,
    sendMessage: vi.fn(),
    getManifest: vi.fn(() => ({
      version: '1.0.0',
      content_scripts: [{ js: ['content/index.js'] }],
    })),
    openOptionsPage: vi.fn(),
  },
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn(),
    create: vi.fn(),
  },
  scripting: {
    executeScript: vi.fn(),
  },
}

vi.stubGlobal('chrome', chromeMock)
