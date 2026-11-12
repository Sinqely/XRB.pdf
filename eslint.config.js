// Lintregler, inklusive de testbara arkitekturreglerna R1 och R3 och byggblockens gränser
// (docs/architecture.md 5.2 och 8.8).
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const natverk = ['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'RTCPeerConnection']
  .map((name) => ({ name, message: 'R1: nätverks-API:er är förbjudna i PDF-bagaren (ADR-002).' }))
const lagring = ['localStorage', 'sessionStorage', 'indexedDB', 'caches']
  .map((name) => ({ name, message: 'R3: beständig lagring får bara användas i src/karna/tema.ts (FR-ALM-008).' }))
const natverkEgenskaper = [
  { object: 'navigator', property: 'sendBeacon', message: 'R1: nätverks-API:er är förbjudna.' },
  { object: 'window', property: 'fetch', message: 'R1: nätverks-API:er är förbjudna.' },
  { object: 'self', property: 'fetch', message: 'R1: nätverks-API:er är förbjudna.' },
  ...['localStorage', 'sessionStorage', 'indexedDB', 'caches'].map((property) => ({ object: 'window', property, message: 'R3: lagring bara i tema.ts.' })),
]
const grans = (fran, forbjudna) => ({
  files: [`src/${fran}/**/*.{ts,tsx}`],
  rules: {
    'no-restricted-imports': ['error', { patterns: forbjudna.map((f) => ({ group: [`**/${f}/**`, `../${f}/*`], message: `Gräns: ${fran} får inte importera från ${f} (architecture.md 5.2).` })) }],
  },
})

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'test-results', 'playwright-report', 'docs'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      'no-restricted-globals': ['error', ...natverk, ...lagring],
      'no-restricted-properties': ['error', ...natverkEgenskaper],
    },
  },
  { files: ['src/karna/tema.ts'], rules: { 'no-restricted-globals': ['error', ...natverk] } },
  { files: ['tests/**', 'scripts/**', '*.config.*'], rules: { 'no-restricted-globals': 'off', 'no-restricted-properties': 'off' } },
  // Kärnan och arbetstrådarnas kod får inte bero på gränssnittet; läs- och byggdelarna inte på varandra.
  grans('karna', ['ui', 'las', 'bygg']),
  grans('las', ['ui', 'bygg']),
  grans('bygg', ['ui', 'las']),
)
