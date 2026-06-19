import { defineManifest } from '@crxjs/vite-plugin'
import packageJson from './package.json'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default defineManifest({
  manifest_version: 3,
  name: 'Akeneo Companion',
  version: packageJson.version,
  description: 'Check Akeneo product completeness from any LedKoning PDP',
  icons: {
    '16': 'icons/icon16.png',
    '48': 'icons/icon48.png',
    '128': 'icons/icon128.png',
  },
  action: {
    default_popup: 'src/popup/index.html',
    default_icon: 'icons/icon48.png',
  },
  options_ui: {
    page: 'src/options/index.html',
    open_in_tab: true,
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: [
        'https://ledkoning.nl/*',
        'https://ledkoning.be/*',
        'https://ledstripkoning.nl/*',
        'https://ledstripkoning.be/*',
        'https://solarlampkoning.nl/*',
        'https://solarlampkoning.be/*',
        'https://bouwlampkoning.nl/*',
        'https://bouwlampkoning.be/*',
        'https://smarthomekoning.nl/*',
        'https://smarthomekoning.be/*',
        'https://ledprofielkoning.nl/*',
        'https://ledprofielkoning.be/*',
        'https://ledchampion.de/*',
        'https://de.ledchampion.magento2.led.p.maxserv.io/*',
      ],
      js: ['src/content/sku-detector.ts'],
    },
  ],
  host_permissions: [
    'https://ledkoning.nl/*',
    'https://ledkoning.be/*',
    'https://ledstripkoning.nl/*',
    'https://ledstripkoning.be/*',
    'https://solarlampkoning.nl/*',
    'https://solarlampkoning.be/*',
    'https://bouwlampkoning.nl/*',
    'https://bouwlampkoning.be/*',
    'https://smarthomekoning.nl/*',
    'https://smarthomekoning.be/*',
    'https://ledprofielkoning.nl/*',
    'https://ledprofielkoning.be/*',
    'https://ledchampion.de/*',
    'https://de.ledchampion.magento2.led.p.maxserv.io/*',
    'https://*.akeneo.com/*',
    'https://api.github.com/*',
  ],
  permissions: ['storage', 'activeTab'],
} as any)
