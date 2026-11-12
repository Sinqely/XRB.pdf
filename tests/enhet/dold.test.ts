// FEAT-008 Dold information: granskning (FR-DOL-002, -005, -008, -011, -012), val som följer med i filen
// (FR-DOL-003, -004, -006, -007, -009, -010, -011), inget från bortvalda sidor (FR-DOL-013) och PDF/A med veraPDF.
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { PDFArray, PDFDict, PDFDocument, PDFHexString, PDFName, PDFRawStream, PDFRef, PDFString } from '@cantoo/pdf-lib'
import { granska } from '../../src/bygg/dold'
import { bakaIhop, kontrollera, type Byggbegaran } from '../../src/bygg/export'

const las = (n: string) => new Uint8Array(readFileSync(new URL(`../filer/${n}`, import.meta.url)))
const dold = las('dold.pdf')
const N = PDFName.of
const datum = Date.UTC(2026, 10, 12, 20, 0, 0)

const sidor12 = [
  { dokumentId: 'd', sidindex: 0 },
  { dokumentId: 'd', sidindex: 1 },
]
const bygg = async (b: Partial<Byggbegaran> = {}) => PDFDocument.load(await bakaIhop({ dokument: { d: dold }, sidor: sidor12, datum, ...b }), { updateMetadata: false })

function annots(doc: PDFDocument, i: number): PDFDict[] {
  const a = doc.getPage(i).node.lookup(N('Annots'))
  return a instanceof PDFArray ? a.asArray().map((x) => doc.context.lookup(x) as PDFDict) : []
}
const typ = (d: PDFDict) => (d.get(N('Subtype')) as PDFName).decodeText()
const str = (o: unknown) => (o instanceof PDFString || o instanceof PDFHexString ? o.decodeText() : '')
function allaObjekt(doc: PDFDocument) {
  return doc.context.enumerateIndirectObjects().map(([, o]) => o)
}
const sidobjekt = (doc: PDFDocument) => allaObjekt(doc).filter((o) => o instanceof PDFDict && o.get(N('Type'))?.toString() === '/Page').length

describe('granskning av ett dokument', () => {
  it('läser metadata (FR-DOL-002)', async () => {
    const g = await granska(dold)
    expect(g.info).toEqual({
      titel: 'Testtitel',
      forfattare: 'Testförfattare',
      amne: 'Testämne',
      nyckelord: 'testord',
      program: 'Testprogram',
      skapad: '2025-01-02T03:04:05.000Z',
      andrad: '2025-06-07T08:09:10.000Z',
    })
  })
  it('listar kommentarer med sida, bilagor med storlek och formulärfält (FR-DOL-005, -008, -011)', async () => {
    const g = await granska(dold)
    expect(g.kommentarer.map((k) => [k.sidindex, k.typ, k.text, k.forfattare])).toEqual([
      [0, 'Text', 'Kommentar pa sida 1', 'Granskare'],
      [2, 'Text', 'Kommentar pa sida 3', 'Granskare'],
    ])
    expect(g.bilagor).toEqual([
      { nyckel: 'b:0', namn: 'bilaga.txt', storlek: 30, sidindex: null },
      { nyckel: 'k:2:2', namn: 'sidbilaga.txt', storlek: 31, sidindex: 2 },
    ])
    expect(g.falt).toEqual([{ namn: 'Namn', sidor: [1], varde: 'Påhittat namn' }])
  })
  it('hittar skript och programdata (FR-DOL-012)', async () => {
    const g = await granska(dold)
    expect(g.skript).toEqual(
      expect.arrayContaining([
        { kod: 'oppna', sidindex: null },
        { kod: 'dokumentskript', sidindex: null },
        { kod: 'falt', sidindex: 1 },
        { kod: 'programdata', sidindex: 1 },
      ]),
    )
  })
  it('hittar ingen dold information i en vanlig fil (FR-DOL-014)', async () => {
    const g = await granska(las('arkivbar.pdf'))
    expect([g.kommentarer, g.bilagor, g.falt, g.skript]).toEqual([[], [], [], []])
  })
})

describe('resultatfilen', () => {
  it('förifylls med metadata från första sidans dokument och använder ändrade värden (FR-DOL-003, FR-DOL-004)', async () => {
    const forval = await bygg()
    expect([forval.getTitle(), forval.getAuthor(), forval.getSubject(), forval.getKeywords()]).toEqual(['Testtitel', 'Testförfattare', 'Testämne', 'testord'])
    expect(forval.getCreator()).toBe('PDF-bagaren')
    const andrad = await bygg({ uppgifter: { titel: 'Ny titel', forfattare: '', amne: '', nyckelord: '' } })
    expect([andrad.getTitle(), andrad.getAuthor(), andrad.getSubject(), andrad.getKeywords()]).toEqual(['Ny titel', undefined, undefined, undefined])
  })

  it('tar inte med något från sidor utanför resultatet (FR-DOL-013)', async () => {
    const ut = await bygg()
    expect(sidobjekt(ut)).toBe(2)
    const texter = allaObjekt(ut).flatMap((o) => (o instanceof PDFDict ? [str(o.get(N('Contents')))] : []))
    expect(texter).toContain('Kommentar pa sida 1')
    expect(texter).not.toContain('Kommentar pa sida 3')
    expect(texter).not.toContain('Sidbilaga')
    // Länken till sida 3 tas bort; länken till sida 2 pekar på sida 2 i resultatet.
    const lankar = annots(ut, 0).filter((a) => typ(a) === 'Link')
    expect(lankar).toHaveLength(1)
    expect((lankar[0]!.lookup(N('Dest')) as PDFArray).get(0)).toBe(ut.getPage(1).ref)
  })

  it('tar alltid bort skript och programdata (FR-DOL-012)', async () => {
    const ut = await bygg()
    expect(ut.catalog.has(N('OpenAction'))).toBe(false)
    const n = ut.catalog.lookup(N('Names'))
    expect(n instanceof PDFDict && n.has(N('JavaScript'))).toBe(false)
    expect(ut.getPage(1).node.has(N('PieceInfo'))).toBe(false)
    expect(allaObjekt(ut).some((o) => o instanceof PDFDict && (o.has(N('AA')) || o.has(N('JS'))))).toBe(false)
  })

  it('behåller kommentarer, formulärfält och bilagor som förval i vanlig PDF (FR-DOL-007, -009, -011)', async () => {
    const ut = await bygg()
    expect(annots(ut, 0).map(typ)).toEqual(['Text', 'Popup', 'Link'])
    const form = ut.getForm()
    expect(form.getFields().map((f) => f.getName())).toEqual(['Namn'])
    expect(form.getTextField('Namn').getText()).toBe('Påhittat namn')
    expect(Object.keys(await bilagor(ut))).toEqual(['bilaga.txt'])
  })

  it('ändrar och tar bort kommentarer, fält och bilagor enligt valen (FR-DOL-006, -007, -009, -011)', async () => {
    const ny = await bygg({ dold: { d: { kommentartext: { 'k:0:0': 'Ändrad åäö' } } } })
    const k = annots(ny, 0).find((a) => typ(a) === 'Text')!
    expect(str(k.get(N('Contents')))).toBe('Ändrad åäö')

    const bort = await bygg({ dold: { d: { taBort: ['k:0:0', 'b:0'], taBortFalt: ['Namn'] } } })
    expect(annots(bort, 0).map(typ)).toEqual(['Link'])
    expect(annots(bort, 1)).toEqual([])
    expect(bort.catalog.has(N('AcroForm'))).toBe(false)
    expect(bort.catalog.has(N('Names'))).toBe(false)
    expect(allaObjekt(bort).some((o) => o instanceof PDFDict && o.get(N('Type'))?.toString() === '/EmbeddedFile')).toBe(false)
  })

  it('tar bort bifogade filer i arkivformat och ger en fil som veraPDF godkänner (FR-DOL-010)', async () => {
    const b: Byggbegaran = { dokument: { d: dold }, sidor: [...sidor12, { dokumentId: 'd', sidindex: 2 }], datum, format: 'pdfa' }
    expect(await kontrollera(b)).toEqual([])
    const bytes = await bakaIhop(b)
    const ut = await PDFDocument.load(bytes, { updateMetadata: false })
    expect(annots(ut, 2).map(typ)).toEqual(['Text', 'Popup'])
    expect(ut.catalog.has(N('Names'))).toBe(false)
    expect(allaObjekt(ut).some((o) => o instanceof PDFRawStream && o.dict.get(N('Type'))?.toString() === '/EmbeddedFile')).toBe(false)
    const katalog = mkdtempSync(join(tmpdir(), 'dold-'))
    writeFileSync(join(katalog, 'ut.pdf'), bytes)
    const rapport = execFileSync('node', [new URL('../../scripts/verapdf.mjs', import.meta.url).pathname, join(katalog, 'ut.pdf')], { encoding: 'utf8' })
    expect(rapport).toMatch(/PASS/)
  }, 60_000)

  it('rör inte sidornas innehållsflöden (R8)', async () => {
    const kalla = await PDFDocument.load(dold)
    const ut = await bygg({ dold: { d: { taBort: ['k:0:0'], taBortFalt: ['Namn'] } } })
    const innehall = (d: PDFDocument, i: number) => {
      const c = d.getPage(i).node.get(N('Contents'))
      const refs = c instanceof PDFArray ? c.asArray() : [c]
      return refs.map((r) => Buffer.from((d.context.lookup(r as PDFRef) as PDFRawStream).getContents()).toString('hex')).join('|')
    }
    for (const i of [0, 1]) expect(innehall(ut, i)).toBe(innehall(kalla, i))
  })
})

async function bilagor(doc: PDFDocument): Promise<Record<string, PDFRef | PDFDict>> {
  const n = doc.catalog.lookup(N('Names'))
  if (!(n instanceof PDFDict)) return {}
  const ef = n.lookup(N('EmbeddedFiles')) as PDFDict
  const lista = (ef.lookup(N('Names')) as PDFArray).asArray()
  const ut: Record<string, PDFRef | PDFDict> = {}
  for (let i = 0; i < lista.length; i += 2) ut[str(lista[i])] = lista[i + 1] as PDFRef
  return ut
}
