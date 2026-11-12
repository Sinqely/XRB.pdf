import { describe, expect, it } from 'vitest'
import { nyttId, skapaTillstand, uniktNamn } from '../../src/karna/tillstand'
import { laggTillDokument } from '../../src/karna/arbetsyta'
import type { Dokument } from '../../src/karna/typer'

const dok = (id: string, namn: string, sidantal = 2): Dokument => ({ id, namn, bytes: new Uint8Array(), sidantal, storlekByte: 1 })

describe('tillstånd', () => {
  it('ger en ny oföränderlig version vid varje ändring och sparar historiken', () => {
    const t = skapaTillstand()
    const fore = t.hamta()
    t.andra((nu) => laggTillDokument(nu, dok('a', 'Beslut.pdf')).yta)
    expect(t.hamta()).not.toBe(fore)
    expect(fore.dokument).toHaveLength(0)
    expect(Object.isFrozen(t.hamta())).toBe(true)
    expect(t.historik).toHaveLength(2)
  })

  it('lägger inte till någon version när inget ändrats', () => {
    const t = skapaTillstand()
    t.andra((nu) => nu)
    expect(t.historik).toHaveLength(1)
  })

  it('ger löpnummer när samma fil läses in igen (FR-FIL-012)', () => {
    expect(uniktNamn('Beslut.pdf', [])).toBe('Beslut.pdf')
    expect(uniktNamn('Beslut.pdf', [dok('a', 'Beslut.pdf')])).toBe('Beslut.pdf (2)')
    expect(uniktNamn('Beslut.pdf', [dok('a', 'Beslut.pdf'), dok('b', 'Beslut.pdf (2)')])).toBe('Beslut.pdf (3)')
  })

  it('ger unika id:n', () => {
    const ids = new Set(Array.from({ length: 100 }, () => nyttId('rs')))
    expect(ids.size).toBe(100)
  })
})

describe('ångra och gör om (FR-ALM-001..003)', () => {
  it('ångrar och gör om med meddelanden, och ny ändring tar bort gör om', () => {
    const t = skapaTillstand()
    t.andra((nu) => laggTillDokument(nu, dok('a', 'A.pdf')).yta, 'A inläst')
    t.andra((nu) => laggTillDokument(nu, dok('b', 'B.pdf')).yta, 'B inläst')
    expect(t.angra()).toBe('B inläst')
    expect(t.hamta().dokument.map((d) => d.id)).toEqual(['a'])
    expect(t.kanGorOm()).toBe(true)
    expect(t.gorOm()).toBe('B inläst')
    expect(t.hamta().dokument).toHaveLength(2)
    t.angra()
    t.andra((nu) => laggTillDokument(nu, dok('c', 'C.pdf')).yta, 'C')
    expect(t.kanGorOm()).toBe(false)
    expect([...t.dokumentIHistoriken()].sort()).toEqual(['a', 'c'])
    expect(t.angra()).toBe('C')
    expect(t.angra()).toBe('A inläst')
    expect(t.angra()).toBeNull()
  })

  it('ersätt ger inget eget ångra-steg', () => {
    const t = skapaTillstand()
    t.andra((nu) => laggTillDokument(nu, dok('a', 'A.pdf')).yta, 'A')
    t.ersatt((nu) => ({ ...nu, sparval: { ...nu.sparval, filnamn: 'x.pdf' } }))
    expect(t.hamta().sparval.filnamn).toBe('x.pdf')
    t.angra()
    expect(t.hamta().dokument).toHaveLength(0)
  })

  it('börja om tömmer arbetsytan och historiken', () => {
    const t = skapaTillstand()
    t.andra((nu) => laggTillDokument(nu, dok('a', 'A.pdf')).yta, 'A')
    t.borjaOm()
    expect(t.hamta().dokument).toHaveLength(0)
    expect(t.kanAngra()).toBe(false)
  })
})
