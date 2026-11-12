// Genererar src/karna/om-data.ts för om-sidan (FEAT-011): version och datum, licensförteckning med
// licenstexter (FR-DOK-006), verifieringsrapporten (FR-DOK-007) och tillgänglighetsredogörelsen (FR-DOK-008).
// Körs före dev, build, lint och test, så att om-sidan alltid stämmer med det som bakas in.
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import fontkit from '@pdf-lib/fontkit'

const rot = new URL('../', import.meta.url)
const las = (p) => readFileSync(new URL(p, rot), 'utf8')
const paket = JSON.parse(las('package.json'))

// Versionsdatum ur CHANGELOG.md ("## 1.0.0 – 2026-11-12"); en version som inte finns där är inte släppt.
const rad = las('CHANGELOG.md').split('\n').find((r) => r.startsWith(`## ${paket.version} `))
const datum = rad?.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? ''

// Bibliotek: de som bakas in (produktionsberoenden). @napi-rs/canvas är pdf.js reserv i Node och följer aldrig med i webbläsaren.
const lista = JSON.parse(
  execFileSync('npx', ['license-checker-rseidelsohn', '--production', '--excludePrivatePackages', '--json'], { cwd: new URL('.', rot).pathname, encoding: 'utf8', maxBuffer: 1 << 24 }),
)
const bibliotek = Object.entries(lista)
  .filter(([id]) => !id.startsWith('@napi-rs/'))
  .map(([id, v]) => {
    const at = id.lastIndexOf('@')
    const namn = id.slice(0, at)
    let text = ''
    try {
      if (v.licenseFile && /licen[cs]e/i.test(v.licenseFile)) text = readFileSync(v.licenseFile, 'utf8')
    } catch {
      /* ingen licensfil */
    }
    if (!text) text = `${v.licenses}. Upphovsrätt: ${v.publisher ?? namn}. Licenstexten finns på ${v.repository ?? 'paketets sida'}.`
    return { namn, version: id.slice(at + 1), licens: String(v.licenses), typ: 'bibliotek', text: text.trim() }
  })
  .sort((a, b) => a.namn.localeCompare(b.namn))

const typsnitt = [
  ['Carlito', 'src/resurser/typsnitt/etikett/carlito-400-normal.ttf', 'src/resurser/typsnitt/etikett/OFL-carlito.txt', 'Gränssnittet och etiketten (utan seriffer)'],
  ['Tinos', 'src/resurser/typsnitt/etikett/tinos-400-normal.ttf', 'src/resurser/typsnitt/etikett/OFL-tinos.txt', 'Etiketten (med seriffer)'],
  ['Cousine', 'src/resurser/typsnitt/etikett/cousine-400-normal.ttf', 'src/resurser/typsnitt/etikett/OFL-cousine.txt', 'Etiketten (fast teckenbredd)'],
].map(([namn, ttf, licens, anvands]) => {
  const v = fontkit.create(readFileSync(new URL(ttf, rot))).version ?? ''
  return { namn, version: String(v).match(/\d+(\.\d+)+/)?.[0] ?? '', licens: 'OFL-1.1', typ: 'typsnitt', anvands, text: las(licens).trim() }
})
const ikoner = [{ namn: 'Lucide (ikoner, ritade efter)', version: '', licens: 'ISC', typ: 'ikoner', text: las('src/resurser/ikoner/LICENS-lucide.txt').trim() }]

// Enkel Markdown till HTML för de två dokumenten: rubriker, stycken, punktlistor, tabeller, fetstil och kod.
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`(.+?)`/g, '<code>$1</code>')
function html(md) {
  const ut = []
  const rader = md.split('\n')
  for (let i = 0; i < rader.length; ) {
    const r = rader[i]
    if (!r.trim()) {
      i++
      continue
    }
    const h = r.match(/^(#{1,3}) (.*)/)
    if (h) {
      // Dokumentets egen rubrik visas som dialogens rubrik; övriga blir h3 och h4.
      if (h[1].length > 1) ut.push(`<h${h[1].length + 1}>${inline(h[2])}</h${h[1].length + 1}>`)
      i++
    } else if (r.startsWith('|')) {
      const tab = []
      while (i < rader.length && rader[i].startsWith('|')) tab.push(rader[i++])
      const cell = (t) => t.slice(1, -1).split('|').map((c) => c.trim())
      const [huvud, , ...kropp] = tab
      ut.push(
        `<div class="tabellyta" tabindex="0" role="region" aria-label="${esc(cell(huvud).join(', '))}"><table><thead><tr>${cell(huvud).map((c) => `<th scope="col">${inline(c)}</th>`).join('')}</tr></thead><tbody>${kropp
          .map((k) => `<tr>${cell(k).map((c, j) => (j === 0 ? `<th scope="row">${inline(c)}</th>` : `<td>${inline(c)}</td>`)).join('')}</tr>`)
          .join('')}</tbody></table></div>`,
      )
    } else if (r.startsWith('- ')) {
      const li = []
      while (i < rader.length && rader[i].startsWith('- ')) li.push(`<li>${inline(rader[i++].slice(2))}</li>`)
      ut.push(`<ul>${li.join('')}</ul>`)
    } else {
      const st = []
      while (i < rader.length && rader[i].trim() && !/^(#|\||- )/.test(rader[i])) st.push(rader[i++])
      ut.push(`<p>${inline(st.join(' '))}</p>`)
    }
  }
  return ut.join('\n')
}

const data = {
  namn: 'PDF-bagaren',
  version: paket.version,
  datum,
  licenser: [...bibliotek, ...typsnitt, ...ikoner],
  verifieringsrapport: html(las('docs/verifieringsrapport.md')),
  tillganglighet: html(las('docs/tillganglighetsredogorelse.md')),
}
writeFileSync(
  new URL('src/karna/om-data.ts', rot),
  `// Genereras av scripts/om-data.mjs. Ändra inte här.\nexport const omData = ${JSON.stringify(data, null, 1)} as const\n`,
)
console.log(`om-data: version ${data.version} (${data.datum || 'inte släppt'}), ${data.licenser.length} licenser`)
