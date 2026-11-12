// Layoutmodellen (ADR-006, R4): FR-PLC-001, FR-PLC-003..011, FR-STA-005, FR-STA-006.
import { describe, expect, it } from 'vitest'
import { avstand, flytta, forval, forvaldStampelMm, inomMarginal, MM, overlappar, placeringFranRuta, ruta, rymsPa, stampelMatt, storstaStampelMm } from '../../src/karna/layout'
import type { Ankare } from '../../src/karna/typer'

const A4 = { bredd: 595.28, hojd: 841.89 }
const A4L = { bredd: 841.89, hojd: 595.28 }
const LETTER = { bredd: 612, hojd: 792 }
const obj = { bredd: 100, hojd: 50 }
const nara = (a: number, b: number) => expect(a).toBeCloseTo(b, 6)

describe('färdiga placeringar (FR-PLC-004, FR-PLC-005)', () => {
  const fall: [Ankare, (r: ReturnType<typeof ruta>, s: typeof A4) => [number, number]][] = [
    ['ovre-vanster', (r) => [r.x, r.y]],
    ['ovre-hoger', (r, s) => [s.bredd - r.x - r.b, r.y]],
    ['nedre-vanster', (r, s) => [r.x, s.hojd - r.y - r.h]],
    ['nedre-hoger', (r, s) => [s.bredd - r.x - r.b, s.hojd - r.y - r.h]],
  ]
  for (const [a, kant] of fall) {
    it(`${a}: samma avstånd till hörnet på sidor med olika storlek och riktning (FR-PLC-008)`, () => {
      for (const s of [A4, A4L, LETTER]) {
        const [x, y] = kant(ruta(s, obj, forval(a, 15)), s)
        nara(x, 15 * MM)
        nara(y, 15 * MM)
      }
    })
  }
  it('sidhuvud och sidfot är centrerade med avstånd till över- respektive underkanten', () => {
    for (const s of [A4, A4L]) {
      const h = ruta(s, obj, forval('sidhuvud', 10))
      nara(h.x, (s.bredd - 100) / 2)
      nara(h.y, 10 * MM)
      const f = ruta(s, obj, forval('sidfot', 10))
      nara(f.x, (s.bredd - 100) / 2)
      nara(s.hojd - f.y - f.h, 10 * MM)
    }
  })
  it('förvalt avstånd är 10 mm och begränsas till 0–50 mm', () => {
    expect(forval('nedre-hoger')).toEqual({ ankare: 'nedre-hoger', dxMm: 10, dyMm: 10, egen: false })
    expect(forval('sidhuvud', 80).dyMm).toBe(50)
    expect(forval('ovre-vanster', -3).dxMm).toBe(0)
    expect(avstand(forval('sidfot', 12))).toBe(12)
  })
})

describe('flytta och hålla innanför kanten (FR-PLC-002, FR-PLC-003, FR-PLC-011)', () => {
  it('piltangent flyttar 1 mm i visad riktning oavsett ankare', () => {
    for (const a of ['ovre-vanster', 'nedre-hoger', 'sidfot'] as const) {
      const p = forval(a, 20)
      const fore = ruta(A4, obj, p)
      const efter = ruta(A4, obj, flytta(A4, obj, p, 1, 0))
      nara(efter.x - fore.x, MM)
      nara(efter.y, fore.y)
      const ner = ruta(A4, obj, flytta(A4, obj, p, 0, 10))
      nara(ner.y - fore.y, 10 * MM)
      expect(flytta(A4, obj, p, 1, 0).egen).toBe(true)
    }
  })
  it('objektet stannar vid sidkanten', () => {
    const p = flytta(A4, obj, forval('nedre-hoger', 2), 50, 50)
    const r = ruta(A4, obj, p)
    nara(r.x + r.b, A4.bredd)
    nara(r.y + r.h, A4.hojd)
    // En placering som går utanför en mindre sida hålls innanför på den sidan
    const stor = { ankare: 'ovre-vanster' as const, dxMm: 280, dyMm: 0, egen: true }
    const r2 = ruta(A4, obj, stor)
    nara(r2.x, A4.bredd - 100)
  })
  it('ett objekt som är större än sidan krymps med samma proportioner', () => {
    const m = rymsPa({ bredd: 1200, hojd: 600 }, A4)
    nara(m.bredd, A4.bredd)
    nara(m.hojd, A4.bredd / 2)
  })
  it('omvänd placering ger samma ruta tillbaka', () => {
    const r = { x: 123, y: 456, b: 100, h: 50 }
    for (const a of ['ovre-hoger', 'sidhuvud', 'nedre-vanster'] as const) {
      const r2 = ruta(A4, obj, placeringFranRuta(A4, r, a))
      expect(r2.x).toBeCloseTo(r.x, 1)
      expect(r2.y).toBeCloseTo(r.y, 1)
    }
  })
})

describe('säkerhetsmarginal och överlapp (FR-PLC-010, FR-PLC-012)', () => {
  it('varnar när objektet är närmare kanten än 5 mm', () => {
    expect(inomMarginal(A4, ruta(A4, obj, forval('nedre-hoger', 10)))).toBe(false)
    expect(inomMarginal(A4, ruta(A4, obj, forval('nedre-hoger', 5)))).toBe(false)
    expect(inomMarginal(A4, ruta(A4, obj, forval('nedre-hoger', 4)))).toBe(true)
    expect(inomMarginal(A4, ruta(A4, obj, forval('sidhuvud', 0)))).toBe(true)
  })
  it('upptäcker överlapp', () => {
    expect(overlappar({ x: 0, y: 0, b: 10, h: 10 }, { x: 5, y: 5, b: 10, h: 10 })).toBe(true)
    expect(overlappar({ x: 0, y: 0, b: 10, h: 10 }, { x: 10, y: 0, b: 10, h: 10 })).toBe(false)
  })
})

describe('stämpelns storlek (FR-STA-005, FR-STA-006)', () => {
  it('höjden följer bildens proportioner', () => {
    const m = stampelMatt({ breddMm: 40, pxBredd: 400, pxHojd: 200 })
    nara(m.bredd, 40 * MM)
    nara(m.hojd, 20 * MM)
  })
  it('förvald bredd är 40 mm men aldrig större än sidan', () => {
    expect(forvaldStampelMm(A4, 400, 200)).toBe(40)
    expect(forvaldStampelMm(null, 400, 200)).toBe(40)
    expect(forvaldStampelMm({ bredd: 50, hojd: 50 }, 400, 200)).toBe(17)
    expect(storstaStampelMm(A4, 100, 1000)).toBe(Math.floor(A4.hojd / 10 / MM))
  })
})
