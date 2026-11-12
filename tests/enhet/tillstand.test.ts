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
