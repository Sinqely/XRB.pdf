// FEAT-001 AC-12, AC-14 (technical-design.md §3.4).
import { describe, expect, it, vi } from 'vitest'
import { foreslaFilnamn, sparaResultat, stadaFilnamn, byggbegaran } from '../../src/ui/spara'
import { laggTillAlla, laggTillDokument, laggTillSida } from '../../src/karna/arbetsyta'
import { tomArbetsyta, type Arbetsyta, type Dokument } from '../../src/karna/typer'

const dok = (id: string, namn: string, sidantal = 2): Dokument => ({ id, namn, bytes: new Uint8Array([id.charCodeAt(0)]), sidantal, storlekByte: 1 })
const yta = (): Arbetsyta => {
  let y = laggTillDokument(tomArbetsyta, dok('a', 'Beslut.pdf (2)')).yta
  y = laggTillDokument(y, dok('b', 'Underskrift.PDF')).yta
  y = laggTillDokument(y, dok('c', 'Oanvand.pdf')).yta
  y = laggTillSida(y, 'b', 0).yta
  return laggTillAlla(y, 'a').yta
}

describe('filnamn (FR-SPA-002)', () => {
  it('föreslår första resultatsidans dokument utan löpnummer och ändelse', () => {
    expect(foreslaFilnamn(yta())).toBe('Underskrift-ihopbakad.pdf')
    expect(foreslaFilnamn({ ...yta(), sparval: { filnamn: 'Mitt.pdf' } })).toBe('Mitt.pdf')
    const a = laggTillAlla(laggTillDokument(tomArbetsyta, dok('a', 'Beslut.pdf (2)')).yta, 'a').yta
    expect(foreslaFilnamn(a)).toBe('Beslut-ihopbakad.pdf')
  })

  it('städar inmatat namn och lägger till .pdf', () => {
    const f = 'Förslag.pdf'
    expect(stadaFilnamn('Beslut slutligt', f)).toBe('Beslut slutligt.pdf')
    expect(stadaFilnamn('  Beslut.PDF ', f)).toBe('Beslut.pdf')
    expect(stadaFilnamn('a/b:c*?"<>|d', f)).toBe('abcd.pdf')
    expect(stadaFilnamn('   ', f)).toBe(f)
    expect(stadaFilnamn('.pdf', f)).toBe(f)
    expect(stadaFilnamn('x'.repeat(300), f)).toBe(`${'x'.repeat(200)}.pdf`)
  })
})

describe('sparande', () => {
  it('skickar bara dokument som ingår och sidorna i ordning', () => {
    const b = byggbegaran(yta())
    expect(Object.keys(b.dokument).sort()).toEqual(['a', 'b'])
    expect(b.sidor).toEqual([{ dokumentId: 'b', sidindex: 0 }, { dokumentId: 'a', sidindex: 0 }, { dokumentId: 'a', sidindex: 1 }])
  })

  it('bygger och laddar ned med valt namn (FR-SPA-001)', async () => {
    const ladda = vi.fn()
    const ut = await sparaResultat(yta(), 'X.pdf', { bygg: async () => new Uint8Array([1]), ladda })
    expect(ut).toEqual({ ok: true, filnamn: 'X.pdf' })
    expect(ladda).toHaveBeenCalledWith(new Uint8Array([1]), 'X.pdf')
  })

  it('ger ett felmeddelande och lämnar arbetsytan orörd när bygget misslyckas (FR-SPA-012)', async () => {
    const y = Object.freeze(yta())
    const kopia = JSON.stringify(y, (_, v) => (v instanceof Uint8Array ? [...v] : v))
    const ladda = vi.fn()
    const ut = await sparaResultat(y, 'X.pdf', { bygg: async () => { throw new Error('trasig') }, ladda })
    expect(ut.ok).toBe(false)
    expect(ut.ok ? '' : ut.meddelande).toContain('Arbetsytan är oförändrad')
    expect(ladda).not.toHaveBeenCalled()
    expect(JSON.stringify(y, (_, v) => (v instanceof Uint8Array ? [...v] : v))).toBe(kopia)
  })
})
