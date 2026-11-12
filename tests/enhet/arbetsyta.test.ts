// FEAT-001 AC-3, AC-4, AC-6, AC-7, AC-9, AC-10 (technical-design.md §3.1, §6).
import { describe, expect, it } from 'vitest'
import * as A from '../../src/karna/arbetsyta'
import { tomArbetsyta, type Arbetsyta, type Dokument } from '../../src/karna/typer'

const dok = (id: string, namn: string, sidantal: number): Dokument => ({ id, namn, bytes: new Uint8Array(), sidantal, storlekByte: 1 })
const beslut = dok('b', 'Beslut.pdf', 3)
const underskrift = dok('u', 'Underskrift.pdf', 1)
const sidor = (y: Arbetsyta) => y.resultat.map((r) => `${r.dokumentId}${r.sidindex + 1}`)

function med(...steg: ((y: Arbetsyta) => A.Andring)[]): Arbetsyta {
  return steg.reduce((y, s) => s(y).yta, tomArbetsyta)
}
const tvaDok = (y: Arbetsyta) => A.laggTillDokument(A.laggTillDokument(y, beslut).yta, underskrift)

describe('inläsning och borttagning av dokument', () => {
  it('nytt dokument läggs inte i resultatet (B1) och befintligt resultat är oförändrat (FR-FIL-003)', () => {
    const fore = med((y) => A.laggTillDokument(y, beslut), (y) => A.laggTillAlla(y, 'b'))
    const efter = A.laggTillDokument(fore, underskrift)
    expect(efter.yta.resultat).toBe(fore.resultat)
    expect(efter.yta.dokument.map((d) => d.id)).toEqual(['b', 'u'])
    expect(efter.meddelande).toBe('Underskrift.pdf inläst, 1 sida.')
  })

  it('borttaget dokument tar med sig sina sidor och övriga behåller ordningen (FR-FIL-005)', () => {
    const y = med(tvaDok, (y) => A.laggTillSida(y, 'b', 2), (y) => A.laggTillSida(y, 'u', 0), (y) => A.laggTillSida(y, 'b', 0))
    const a = A.taBortDokument(y, 'b')
    expect(a.yta.dokument.map((d) => d.id)).toEqual(['u'])
    expect(sidor(a.yta)).toEqual(['u1'])
    expect(a.meddelande).toBe('Beslut.pdf borttagen. 2 sidor togs bort ur resultatet.')
  })
})

describe('välja sidor', () => {
  it('lägger sidan sist och växlar bort den igen (FR-SID-002, FR-SID-003)', () => {
    let y = med(tvaDok, (y) => A.laggTillSida(y, 'u', 0))
    const a = A.vaxlaSida(y, 'b', 1)
    expect(sidor(a.yta)).toEqual(['u1', 'b2'])
    expect(a.meddelande).toBe('Sida 2 ur Beslut.pdf tillagd på plats 2.')
    y = a.yta
    const b = A.vaxlaSida(y, 'b', 1)
    expect(sidor(b.yta)).toEqual(['u1'])
    expect(b.meddelande).toBe('Sida 2 ur Beslut.pdf borttagen ur resultatet.')
  })

  it('"Lägg till alla" lägger ej valda sidor sist i dokumentets ordning (FR-SID-004)', () => {
    const y = med(tvaDok, (y) => A.laggTillSida(y, 'b', 1), (y) => A.laggTillSida(y, 'u', 0))
    const a = A.laggTillAlla(y, 'b')
    expect(sidor(a.yta)).toEqual(['b2', 'u1', 'b1', 'b3'])
    expect(a.meddelande).toBe('2 sidor ur Beslut.pdf tillagda. Resultatet har 4 sidor.')
    expect(A.laggTillAlla(a.yta, 'b').yta).toBe(a.yta)
  })

  it('"Ta bort ur resultatet" tar bort dokumentets alla sidor (FR-SID-005)', () => {
    const y = med(tvaDok, (y) => A.laggTillAlla(y, 'b'), (y) => A.laggTillAlla(y, 'u'))
    const a = A.taBortAlla(y, 'b')
    expect(sidor(a.yta)).toEqual(['u1'])
    expect(a.meddelande).toBe('Alla sidor ur Beslut.pdf borttagna ur resultatet.')
    expect(A.taBortAlla(a.yta, 'b').meddelande).toBe('')
  })

  it('ignorerar okända dokument och sidor utanför dokumentet', () => {
    const y = med(tvaDok)
    expect(A.laggTillSida(y, 'x', 0).yta).toBe(y)
    expect(A.laggTillSida(y, 'b', 3).yta).toBe(y)
    expect(A.taBortDokument(y, 'x')).toEqual({ yta: y, meddelande: '' })
  })
})

describe('ordna resultatet', () => {
  const start = () => med(tvaDok, (y) => A.laggTillAlla(y, 'b'), (y) => A.laggTillSida(y, 'u', 0))

  it('flyttar en sida till ny plats, som vid dra och släpp (FR-SID-007)', () => {
    const y = start()
    const a = A.flyttaSida(y, y.resultat[3].id, 1)
    expect(sidor(a.yta)).toEqual(['b1', 'u1', 'b2', 'b3'])
    expect(a.meddelande).toBe('Sida 1 ur Underskrift.pdf flyttad till plats 2.')
    expect(sidor(A.flyttaSida(y, y.resultat[0].id, 99).yta)).toEqual(['b2', 'b3', 'u1', 'b1'])
  })

  it('flyttar ett steg och säger till vid kanterna (FR-SID-008)', () => {
    const y = start()
    expect(sidor(A.flyttaSteg(y, y.resultat[1].id, -1).yta)).toEqual(['b2', 'b1', 'b3', 'u1'])
    expect(sidor(A.flyttaSteg(y, y.resultat[1].id, 1).yta)).toEqual(['b1', 'b3', 'b2', 'u1'])
    expect(A.flyttaSteg(y, y.resultat[0].id, -1)).toEqual({ yta: y, meddelande: 'Sidan är redan först.' })
    expect(A.flyttaSteg(y, y.resultat[3].id, 1)).toEqual({ yta: y, meddelande: 'Sidan är redan sist.' })
  })

  it('tar bort en förekomst ur resultatraden (FR-SID-009)', () => {
    const y = start()
    const a = A.taBortResultatsida(y, y.resultat[1].id)
    expect(sidor(a.yta)).toEqual(['b1', 'b3', 'u1'])
    expect(a.meddelande).toBe('Sida 2 ur Beslut.pdf borttagen ur resultatet.')
    expect(A.taBortResultatsida(a.yta, 'finns-inte').yta).toBe(a.yta)
  })

  it('ger varje förekomst ett eget id', () => {
    const y = start()
    expect(new Set(y.resultat.map((r) => r.id)).size).toBe(4)
  })
})

// FEAT-004: vrida (FR-SID-010) och lägga till en gång till (FR-SID-013).
describe('vrida och lägga till igen', () => {
  const d4 = { id: 'v', namn: 'Vrid.pdf', bytes: new Uint8Array([1]), sidantal: 2, storlekByte: 1 }
  const bas4 = () => A.laggTillAlla(A.laggTillDokument(tomArbetsyta, d4).yta, 'v').yta
  it('vrider 90 grader åt höger och vänster, runt hela varvet', () => {
    let y = bas4()
    const id = y.resultat[0]!.id
    const a = A.vridSida(y, id, 1)
    expect(a.yta.resultat[0]!.vridning).toBe(90)
    expect(a.meddelande).toBe('Sida 1 ur Vrid.pdf vriden åt höger, 90 grader från originalet.')
    y = A.vridSida(a.yta, id, -1).yta
    expect(y.resultat[0]!.vridning).toBe(0)
    y = A.vridSida(y, id, -1).yta
    expect(y.resultat[0]!.vridning).toBe(270)
    expect(y.resultat[1]!.vridning).toBe(0)
  })
  it('lägger till sidan en gång till direkt efter, med samma vridning', () => {
    let y = bas4()
    const id = y.resultat[0]!.id
    y = A.vridSida(y, id, 1).yta
    const a = A.laggTillIgen(y, id)
    expect(a.yta.resultat.map((r) => [r.sidindex, r.vridning])).toEqual([[0, 90], [0, 90], [1, 0]])
    expect(new Set(a.yta.resultat.map((r) => r.id)).size).toBe(3)
    expect(a.meddelande).toBe('Sida 1 ur Vrid.pdf tillagd en gång till på plats 2.')
  })
})
