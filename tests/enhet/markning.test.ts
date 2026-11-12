// FEAT-006 operationer för vattenstämpeln: FR-STA-001, FR-STA-003, FR-STA-004, FR-STA-007..010, FR-STA-012, FR-PLC-007.
import { describe, expect, it } from 'vitest'
import { laggTillAlla, laggTillDokument, laggTillSida } from '../../src/karna/arbetsyta'
import { sattAllaSidor, sattOpacitet, sattPlacering, sattStampelbild, sattStampelbredd, sidorMed, taBortStampel, vaxlaPaSida } from '../../src/karna/markning'
import { forval } from '../../src/karna/layout'
import { tomArbetsyta, type Dokument } from '../../src/karna/typer'
import { bildkontroll, bildtyp, jpegKomponenter, MAX_BILDSTORLEK } from '../../src/karna/validering'
import { readFileSync } from 'node:fs'

const dok: Dokument = { id: 'a', namn: 'Beslut.pdf', bytes: new Uint8Array([1]), sidantal: 3, storlekByte: 1 }
const bild = (namn = 'namn.png') => ({ namn, bild: new Uint8Array([1, 2]), typ: 'png' as const, pxBredd: 400, pxHojd: 200 })
const bas = () => laggTillAlla(laggTillDokument(tomArbetsyta, dok).yta, 'a').yta
const las = (n: string) => new Uint8Array(readFileSync(new URL(`../filer/${n}`, import.meta.url)))

describe('vattenstämpel', () => {
  it('ny stämpel: 100 % opacitet, nedre högra hörnet 10 mm, alla sidor (FR-STA-001, FR-STA-003, FR-PLC-007)', () => {
    const { yta, meddelande } = sattStampelbild(bas(), bild(), 40)
    expect(yta.vattenstampel).toMatchObject({ namn: 'namn.png', opacitet: 100, breddMm: 40, allaSidor: true, placering: forval('nedre-hoger', 10) })
    expect(sidorMed(yta, 'stampel')).toEqual([1, 2, 3])
    expect(meddelande).toContain('namn.png')
  })
  it('byte av bild behåller opacitet, storlek, placering och sidval (FR-STA-009)', () => {
    let y = sattStampelbild(bas(), bild(), 40).yta
    y = sattOpacitet(y, 55).yta
    y = sattStampelbredd(y, 61).yta
    y = sattPlacering(y, 'stampel', forval('sidhuvud', 20)).yta
    y = vaxlaPaSida(y, 'stampel', y.resultat[1]!.id).yta
    const efter = sattStampelbild(y, { ...bild('ny.jpg'), typ: 'jpeg', pxBredd: 10, pxHojd: 30 }, 40).yta
    expect(efter.vattenstampel).toMatchObject({ namn: 'ny.jpg', typ: 'jpeg', pxHojd: 30, opacitet: 55, breddMm: 61, placering: forval('sidhuvud', 20), allaSidor: false })
    expect(sidorMed(efter, 'stampel')).toEqual([1, 3])
  })
  it('opaciteten hålls mellan 0 och 100 (FR-STA-004)', () => {
    const y = sattStampelbild(bas(), bild(), 40).yta
    expect(sattOpacitet(y, 140).yta.vattenstampel!.opacitet).toBe(100)
    expect(sattOpacitet(y, -5).yta.vattenstampel!.opacitet).toBe(0)
    expect(sattOpacitet(y, 33.4).yta.vattenstampel!.opacitet).toBe(33)
    expect(sattOpacitet(y, Number.NaN).yta).toBe(y)
  })
  it('alla sidor och val per sida (FR-STA-007, FR-STA-008, FR-STA-012)', () => {
    let y = sattStampelbild(bas(), bild(), 40).yta
    const ids = y.resultat.map((r) => r.id)
    y = sattAllaSidor(y, 'stampel', false, ids[1]!).yta
    expect(sidorMed(y, 'stampel')).toEqual([2])
    y = vaxlaPaSida(y, 'stampel', ids[2]!).yta
    expect(sidorMed(y, 'stampel')).toEqual([2, 3])
    // ny sida utan "alla sidor" får ingen stämpel
    y = laggTillSida(laggTillDokument(y, { ...dok, id: 'b', namn: 'B.pdf', sidantal: 1 }).yta, 'b', 0).yta
    expect(sidorMed(y, 'stampel')).toEqual([2, 3])
    y = sattAllaSidor(y, 'stampel', true, null).yta
    expect(sidorMed(y, 'stampel')).toEqual([1, 2, 3, 4])
    // med "alla sidor" får en ny sida stämpeln (FR-STA-012)
    y = laggTillDokument(y, { ...dok, id: 'c', namn: 'C.pdf', sidantal: 1 }).yta
    y = laggTillSida(y, 'c', 0).yta
    expect(sidorMed(y, 'stampel')).toEqual([1, 2, 3, 4, 5])
    // att ta bort stämpeln på en sida gör att "alla sidor" inte längre gäller
    y = vaxlaPaSida(y, 'stampel', y.resultat[0]!.id).yta
    expect(y.vattenstampel!.allaSidor).toBe(false)
  })
  it('ta bort stämpeln tar bort den från alla sidor (FR-STA-010)', () => {
    const y = taBortStampel(sattStampelbild(bas(), bild(), 40).yta).yta
    expect(y.vattenstampel).toBeNull()
    expect(sidorMed(y, 'stampel')).toEqual([])
  })
})

describe('bildkontroll (FR-STA-011)', () => {
  it('känner igen PNG och JPEG på innehållet', () => {
    expect(bildtyp(las('stampel.png'))).toBe('png')
    expect(bildtyp(las('stampel.jpg'))).toBe('jpeg')
    expect(bildkontroll(10, las('inte-bild.png'))).toBe('fel-typ')
    expect(bildkontroll(10, las('beslut.pdf'))).toBe('fel-typ')
    expect(bildkontroll(MAX_BILDSTORLEK + 1, las('stampel.png'))).toBe('for-stor')
    expect(bildkontroll(MAX_BILDSTORLEK, las('stampel.png'))).toBeNull()
  })
  it('läser antalet färgkomponenter i JPEG', () => {
    expect(jpegKomponenter(las('stampel.jpg'))).toBe(3)
    expect(jpegKomponenter(las('stampel-cmyk.jpg'))).toBe(4)
  })
})
