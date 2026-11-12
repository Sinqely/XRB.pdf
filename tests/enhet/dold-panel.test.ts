// FEAT-008 panelen Dold information i kärnan: filtrering på resultatets sidor (FR-DOL-005, -011, -013),
// förifyllning (FR-DOL-003), val (FR-DOL-004, -006, -007, -009, -011) och "Ingen dold information" (FR-DOL-014).
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { granska } from '../../src/bygg/dold'
import { laggTillDokument, laggTillSida } from '../../src/karna/arbetsyta'
import { ingenDoldInformation, panelinnehall, resultatetsUppgifter, sattBorttagen, sattFaltBorttaget, sattKommentartext, sattUppgift } from '../../src/karna/dold'
import { tomArbetsyta, type Arbetsyta, type Dokument } from '../../src/karna/typer'
import { byggbegaran } from '../../src/ui/spara'

const bytes = new Uint8Array(readFileSync(new URL('../filer/dold.pdf', import.meta.url)))
const dok: Dokument = { id: 'd', namn: 'dold.pdf', bytes, sidantal: 3, storlekByte: bytes.length }
const med = (...sidor: number[]): Arbetsyta => sidor.reduce((y, s) => laggTillSida(y, 'd', s).yta, laggTillDokument(tomArbetsyta, dok).yta)

describe('panelens innehåll', async () => {
  const g = { d: await granska(bytes) }
  it('visar bara det som hör till resultatets sidor, med platser i resultatet (FR-DOL-005, -011, -013)', () => {
    const [del] = panelinnehall(med(1, 0), g)
    expect(del!.kommentarer.map((k) => [k.text, k.platser])).toEqual([['Kommentar pa sida 1', [2]]])
    expect(del!.falt.map((f) => [f.post.namn, f.platser])).toEqual([['Namn', [1]]])
    expect(del!.bilagor.map((b) => b.post.namn)).toEqual(['bilaga.txt'])
    expect(del!.skript.map((s) => s.kod)).toEqual(expect.arrayContaining(['oppna', 'dokumentskript', 'falt', 'programdata']))
    const [alla] = panelinnehall(med(0, 1, 2), g)
    expect(alla!.kommentarer).toHaveLength(2)
    expect(alla!.bilagor.map((b) => [b.post.namn, b.platser])).toEqual([['bilaga.txt', []], ['sidbilaga.txt', [3]]])
  })
  it('förifyller från första sidans dokument tills användaren ändrar (FR-DOL-003, FR-DOL-004)', () => {
    const y = med(0)
    const f = resultatetsUppgifter(y, g)
    expect(f).toEqual({ titel: 'Testtitel', forfattare: 'Testförfattare', amne: 'Testämne', nyckelord: 'testord' })
    const andrad = sattUppgift(y, f, 'forfattare', '').yta
    expect(resultatetsUppgifter(andrad, g)).toEqual({ ...f, forfattare: '' })
    expect(byggbegaran(andrad).uppgifter).toEqual({ ...f, forfattare: '' })
  })
  it('valen hamnar i byggbegäran för dokumentet (FR-DOL-006, -007, -009, -011)', () => {
    let y = med(0, 1)
    y = sattKommentartext(y, 'd', 'k:0:0', 'Ny', 'Kommentar pa sida 1').yta
    y = sattBorttagen(y, 'd', 'b:0', true, 'bilaga').yta
    y = sattFaltBorttaget(y, 'd', 'Namn', true).yta
    expect(byggbegaran(y).dold).toEqual({ d: { kommentartext: { 'k:0:0': 'Ny' }, taBort: ['b:0'], taBortFalt: ['Namn'] } })
    const [del] = panelinnehall(y, g)
    expect(del!.kommentarer[0]!.text).toBe('Ny')
    expect(del!.falt[0]!.borttagen).toBe(true)
    // Tillbaka till originaltexten och behåll igen
    y = sattKommentartext(y, 'd', 'k:0:0', 'Kommentar pa sida 1', 'Kommentar pa sida 1').yta
    y = sattFaltBorttaget(y, 'd', 'Namn', false).yta
    expect(byggbegaran(y).dold).toEqual({ d: { kommentartext: {}, taBort: ['b:0'], taBortFalt: [] } })
  })
  it('säger när det inte finns någon dold information (FR-DOL-014)', async () => {
    const a = new Uint8Array(readFileSync(new URL('../filer/arkivbar.pdf', import.meta.url)))
    const y = laggTillSida(laggTillDokument(tomArbetsyta, { ...dok, id: 'a', bytes: a, sidantal: 2 }).yta, 'a', 0).yta
    expect(ingenDoldInformation(panelinnehall(y, { a: await granska(a) }))).toBe(true)
    expect(ingenDoldInformation(panelinnehall(med(0), g))).toBe(false)
  })
})
