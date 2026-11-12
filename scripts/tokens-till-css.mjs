// Genererar src/ui/tokens.css ur docs/tokens.json (DTCG). Körs före dev, build och test.
// tokens.json är enda källan för värden (docs/design.md §2).
import { readFileSync, writeFileSync } from 'node:fs'

const tokens = JSON.parse(readFileSync(new URL('../docs/tokens.json', import.meta.url), 'utf8'))

function slå_upp(ref) {
  const väg = ref.replace(/^\{|\}$/g, '').split('.')
  let nod = tokens
  for (const del of väg) nod = nod?.[del]
  if (!nod || nod.$value === undefined) throw new Error(`Okänd tokenreferens ${ref}`)
  return värde(nod.$value)
}
function värde(v) {
  if (typeof v === 'string' && v.startsWith('{')) return slå_upp(v)
  if (Array.isArray(v)) return v.map((f) => (/[\s]/.test(f) ? `"${f}"` : f)).join(', ')
  return v
}

const mörk = [], ljus = []
for (const [namn, t] of Object.entries(tokens.color.ui)) {
  if (namn.startsWith('$')) continue
  mörk.push(`  --ui-${namn}: ${värde(t.$value)};`)
  const l = t.$extensions?.modes?.ljus
  if (l) ljus.push(`  --ui-${namn}: ${värde(l)};`)
}
const övrigt = []
for (const [namn, t] of Object.entries(tokens.space)) övrigt.push(`  --space-${namn}: ${t.$value};`)
for (const [namn, t] of Object.entries(tokens.radius)) övrigt.push(`  --radie-${namn}: ${t.$value};`)
for (const [namn, t] of Object.entries(tokens.size)) övrigt.push(`  --storlek-${namn}: ${t.$value};`)
for (const [namn, t] of Object.entries(tokens.duration)) övrigt.push(`  --tid-${namn}: ${t.$value};`)
övrigt.push(`  --typsnitt-ui: ${värde(tokens.font.family.ui.$value)};`)
for (const [namn, t] of Object.entries(tokens.typography)) {
  const v = t.$value
  övrigt.push(`  --text-${namn}: ${v.fontStyle === 'italic' ? 'italic ' : ''}${v.fontWeight} ${v.fontSize}/${v.lineHeight} var(--typsnitt-ui);`)
}

const css = `/* Genererad av scripts/tokens-till-css.mjs ur docs/tokens.json. Redigera inte för hand. */
:root {
${mörk.join('\n')}
${övrigt.join('\n')}
  color-scheme: dark;
}
:root[data-theme="ljus"] {
${ljus.join('\n')}
  color-scheme: light;
}
`
writeFileSync(new URL('../src/ui/tokens.css', import.meta.url), css)
console.log(`tokens.css: ${mörk.length} färgroller, ${ljus.length} ljusa värden, ${övrigt.length} övriga`)
