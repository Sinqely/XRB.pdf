// FEAT-007 Textetikett: operationer (FR-TXT-001..004, FR-TXT-009..012, FR-TXT-014, FR-PLC-006), mått och saknade tecken
// (FR-TXT-013), och etiketten i resultatfilen på samma ställe som i förhandsvisningen (FR-SPA-008, MF-02) och som PDF/A-2b.
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import fontkit from '@pdf-lib/fontkit'
import { PDFDocument } from '@cantoo/pdf-lib'
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs'
import { bakaIhop } from '../../src/bygg/export'
import { etikettMatt, saknadeTecken, TEXTFUNKTIONER, type Glyfkalla } from '../../src/karna/etikett'
import { forval, ruta } from '../../src/karna/layout'
import { laggTillAlla, laggTillDokument, laggTillSida } from '../../src/karna/arbetsyta'
import { andraEtikett, etikettSyns, sattAllaSidor, sidorMed, taBortEtikett, vaxlaPaSida } from '../../src/karna/markning'
import { tomArbetsyta, type Dokument } from '../../src/karna/typer'

pdfjs.GlobalWorkerOptions.workerSrc = new URL('../../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).href
const ttf = (n: string) => new Uint8Array(readFileSync(new URL(`../../src/resurser/typsnitt/etikett/${n}.ttf`, import.meta.url)))
const las = (n: string) => new Uint8Array(readFileSync(new URL(`../filer/${n}`, import.meta.url)))
const dok: Dokument = { id: 'a', namn: 'Beslut.pdf', bytes: new Uint8Array([1]), sidantal: 3, storlekByte: 1 }
const bas = () => laggTillAlla(laggTillDokument(tomArbetsyta, dok).yta, 'a').yta

describe('etikettens operationer', () => {
  it('första texten skapar etiketten med förvalen på alla sidor (FR-TXT-001, FR-TXT-003, FR-PLC-006)', () => {
    const { yta, meddelande } = andraEtikett(bas(), { text: 'Utkast åäö' })
    expect(yta.textetikett).toMatchObject({ text: 'Utkast åäö', storlekPt: 12, farg: '#000000', bakgrund: null, typsnitt: 'sans', fet: false, kursiv: false, placering: forval('sidhuvud', 10), allaSidor: true })
    expect(sidorMed(yta, 'etikett')).toEqual([1, 2, 3])
    expect(meddelande).toBe('Textetikett tillagd på alla sidor.')
  })
  it('tom text ger ingen etikett på sidorna (FR-TXT-012)', () => {
    expect(andraEtikett(bas(), { text: '' }).yta.textetikett).toBeNull()
    const y = andraEtikett(andraEtikett(bas(), { text: 'A' }).yta, { text: '' }).yta
    expect(y.textetikett?.text).toBe('')
    expect(etikettSyns(y, y.resultat[0]!.id)).toBe(false)
    // val före texten sparas
    const f = andraEtikett(bas(), { farg: '#c00000' }).yta
    expect(f.textetikett?.farg).toBe('#c00000')
    expect(etikettSyns(f, f.resultat[0]!.id)).toBe(false)
  })
  it('högst 200 tecken på en rad och storlek 6–72 pt (FR-TXT-001, FR-TXT-002, FR-TXT-004)', () => {
    let y = andraEtikett(bas(), { text: 'x'.repeat(250) }).yta
    expect(y.textetikett!.text).toHaveLength(200)
    y = andraEtikett(y, { text: 'rad 1\nrad 2' }).yta
    expect(y.textetikett!.text).toBe('rad 1 rad 2')
    expect(andraEtikett(y, { storlekPt: 2 }).yta.textetikett!.storlekPt).toBe(6)
    expect(andraEtikett(y, { storlekPt: 99 }).yta.textetikett!.storlekPt).toBe(72)
    expect(andraEtikett(y, { storlekPt: 14 }).yta.textetikett!.storlekPt).toBe(14)
  })
  it('sidval oberoende av stämpeln, alla sidor och nya sidor, ta bort (FR-TXT-009..011, FR-TXT-014)', () => {
    let y = andraEtikett(bas(), { text: 'Utkast' }).yta
    const ids = y.resultat.map((r) => r.id)
    y = sattAllaSidor(y, 'etikett', false, ids[0]!).yta
    expect(sidorMed(y, 'etikett')).toEqual([1])
    y = vaxlaPaSida(y, 'etikett', ids[2]!).yta
    expect(sidorMed(y, 'etikett')).toEqual([1, 3])
    expect(sidorMed(y, 'stampel')).toEqual([])
    y = sattAllaSidor(y, 'etikett', true, null).yta
    y = laggTillSida(laggTillDokument(y, { ...dok, id: 'b', namn: 'B.pdf', sidantal: 1 }).yta, 'b', 0).yta
    expect(sidorMed(y, 'etikett')).toEqual([1, 2, 3, 4])
    y = taBortEtikett(y).yta
    expect(y.textetikett).toBeNull()
    expect(sidorMed(y, 'etikett')).toEqual([])
  })
})

describe('typsnitt och mått (ADR-007)', () => {
  const snitt = ['carlito', 'tinos', 'cousine'].flatMap((f) => ['400-normal', '400-italic', '700-normal', '700-italic'].map((s) => `${f}-${s}`))
  it('alla tolv snitt har svenska tecken och samma bredd som PDF-inbäddningen räknar med', async () => {
    const doc = await PDFDocument.create()
    doc.registerFontkit(fontkit)
    for (const n of snitt) {
      const bytes = ttf(n)
      const font = fontkit.create(bytes) as unknown as Glyfkalla
      expect(saknadeTecken(font, 'ÅÄÖåäö éü – € "Beslut"')).toEqual([])
      const pdfFont = await doc.embedFont(bytes, { subset: false, features: TEXTFUNKTIONER })
      const m = etikettMatt(font, { text: 'Avfärdad efter fika', storlekPt: 14, bakgrund: null })
      expect(m.textbredd).toBeCloseTo(pdfFont.widthOfTextAtSize('Avfärdad efter fika', 14), 6)
    }
  })
  it('namnger tecken som typsnittet saknar (FR-TXT-013)', () => {
    const font = fontkit.create(ttf('carlito-400-normal')) as unknown as Glyfkalla
    expect(saknadeTecken(font, 'Beslut 漢字 漢 ✓')).toEqual(['漢', '字', '✓'])
  })
  it('bakgrund ger marginal runt texten (FR-TXT-006)', () => {
    const font = fontkit.create(ttf('carlito-400-normal')) as unknown as Glyfkalla
    const utan = etikettMatt(font, { text: 'A', storlekPt: 10, bakgrund: null })
    const med = etikettMatt(font, { text: 'A', storlekPt: 10, bakgrund: '#ffdd00' })
    expect(med.bredd - utan.bredd).toBeCloseTo(6, 6)
    expect(med.baslinje - utan.baslinje).toBeCloseTo(3, 6)
  })
})

describe('etiketten i resultatfilen', () => {
  it('hamnar på samma ställe som i förhandsvisningen, med rätt text, även på vridna sidor, och godkänns som PDF/A-2b', async () => {
    const bytes = ttf('tinos-700-italic')
    const font = fontkit.create(bytes) as unknown as Glyfkalla
    const etikett = { text: 'Utkast – får ej spridas, ÅÄÖ', storlekPt: 16, farg: '#c00000', bakgrund: '#ffdd00', placering: forval('sidfot', 12), typsnitt: bytes }
    const sidor = [
      { dokumentId: 'm', sidindex: 0, etikett: true },
      { dokumentId: 'm', sidindex: 1, etikett: true },
      { dokumentId: 'a', sidindex: 0, vridning: 90, etikett: true },
      { dokumentId: 'a', sidindex: 1, etikett: false },
    ]
    const ut = await bakaIhop({ dokument: { m: las('blandade-format.pdf'), a: las('arkivbar.pdf') }, sidor, etikett, format: 'pdf', datum: 0 })
    const uppgift = pdfjs.getDocument({ data: ut.slice() })
    const doc = await uppgift.promise
    const m = etikettMatt(font, etikett)
    for (const [i, s] of sidor.entries()) {
      const sida = await doc.getPage(i + 1)
      const vy = sida.getViewport({ scale: 1 })
      const items = (await sida.getTextContent()).items.filter((t) => 'str' in t && t.str.includes('Utkast')) as { str: string; transform: number[] }[]
      if (!s.etikett) {
        expect(items).toEqual([])
        continue
      }
      expect(items.map((t) => t.str).join('')).toBe(etikett.text)
      const r = ruta({ bredd: vy.width, hojd: vy.height }, m, etikett.placering)
      const [x, y] = vy.convertToViewportPoint(items[0]!.transform[4]!, items[0]!.transform[5]!)
      expect(x).toBeCloseTo(r.x + m.marginal, 2)
      expect(y).toBeCloseTo(r.y + m.baslinje, 2)
    }
    await uppgift.destroy()
    // PDF/A-2b med den inbäddade etiketten (blandade-format.pdf har ej inbäddade typsnitt, så bara arkivbar.pdf här)
    const pdfa = await bakaIhop({ dokument: { a: las('arkivbar.pdf') }, sidor: sidor.slice(2).map((s) => ({ ...s, etikett: true })), etikett, format: 'pdfa', datum: 0 })
    const katalog = mkdtempSync(join(tmpdir(), 'etikett-'))
    writeFileSync(join(katalog, 'ut.pdf'), pdfa)
    const rapport = execFileSync('node', [new URL('../../scripts/verapdf.mjs', import.meta.url).pathname, join(katalog, 'ut.pdf')], { encoding: 'utf8' })
    expect(rapport).toMatch(/^PASS .* 2b$/m)
  }, 120_000)
})
