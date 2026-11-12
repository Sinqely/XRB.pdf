// Körs efter vite build. Lägger in innehållspolicyn (CSP) först i <head> med hash för varje
// inbakat skript (ADR-002) och kontrollerar reglerna R2 och R7 (docs/architecture.md 8.8).
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'

const fil = new URL('../dist/index.html', import.meta.url)
let html = readFileSync(fil, 'utf8')

// R7: exakt en fil i dist.
const filer = readdirSync(new URL('../dist/', import.meta.url))
if (filer.length !== 1 || filer[0] !== 'index.html') fel(`R7: dist ska bara innehålla index.html, fann ${filer.join(', ')}`)

// Externa resurser får inte finnas (R2).
if (/<script[^>]+src=/i.test(html)) fel('R2: <script src> finns i den byggda filen')
if (/<link[^>]+href=/i.test(html)) fel('R2: <link href> finns i den byggda filen')
if (/\b(?:src|href)=["']https?:/i.test(html)) fel('R2: extern adress i src/href')

const hashar = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(
  (m) => `'sha256-${createHash('sha256').update(m[1], 'utf8').digest('base64')}'`,
)
const csp = [
  "default-src 'none'",
  `script-src ${hashar.join(' ')}`,
  "style-src 'unsafe-inline'",
  'img-src blob: data:',
  'font-src data:',
  'worker-src blob:',
  "connect-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
].join('; ')
if (html.includes('Content-Security-Policy')) fel('CSP finns redan; bygg om från början')
html = html.replace(/<head>/i, `<head>\n    <meta http-equiv="Content-Security-Policy" content="${csp}">`)
writeFileSync(fil, html)

// R2: policyn är första elementet i head och innehåller spärrarna.
const forsta = html.match(/<head>\s*(<[^>]+>)/i)?.[1] ?? ''
if (!forsta.includes('Content-Security-Policy') || !forsta.includes("connect-src 'none'") || !forsta.includes("default-src 'none'"))
  fel('R2: CSP är inte första elementet i head')

const mb = statSync(fil).size / 1024 / 1024
console.log(`dist/index.html: ${mb.toFixed(2)} MB, ${hashar.length} inbakade skript, CSP satt (R2 och R7 godkända)`)
if (mb > 8) console.warn('Varning: filen är större än målet 8 MB (architecture.md 8.5)')

function fel(t) {
  console.error(t)
  process.exit(1)
}
