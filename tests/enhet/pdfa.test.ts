// FEAT-009 Arkivformat: förkontroll (FR-SPA-005), PDF/A-2b validerad med veraPDF (FR-SPA-004, NFR-COMP-004),
// vanlig PDF utan PDF/A-märkning (FR-SPA-006) och oförändrade sidor även i PDF/A (R8).
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { PDFArray, PDFDocument, PDFName, PDFRawStream, PDFRef, type PDFPage } from '@cantoo/pdf-lib'
import { bakaIhop, kontrollera } from '../../src/bygg/export'
import { srgbProfil } from '../../src/bygg/srgb-icc'

const las = (n: string) => new Uint8Array(readFileSync(new URL(`../filer/${n}`, import.meta.url)))
const dokument = { a: las('arkivbar.pdf'), b: las('beslut.pdf'), c: las('cmyk.pdf') }
const datum = Date.UTC(2026, 10, 12, 20, 0, 0)
const uppgifter = { titel: 'Beslut åäö', forfattare: 'Enhet X', amne: 'Prov', nyckelord: 'beslut, prov' }

function innehall(sida: PDFPage): string {
  const c = sida.node.get(PDFName.of('Contents'))
  const refs = c instanceof PDFArray ? c.asArray() : [c]
  return refs.map((r) => Buffer.from((sida.doc.context.lookup(r as PDFRef) as PDFRawStream).getContents()).toString('hex')).join('|')
}

describe('förkontroll för PDF/A-2b (FR-SPA-005)', () => {
  it('hittar inga hinder i sidor med inbäddade typsnitt och RGB', async () => {
    expect(await kontrollera({ dokument, sidor: [{ dokumentId: 'a', sidindex: 0 }, { dokumentId: 'a', sidindex: 1 }] })).toEqual([])
  })
  it('listar ej inbäddat typsnitt och CMYK per sida i resultatet', async () => {
    const h = await kontrollera({ dokument, sidor: [{ dokumentId: 'a', sidindex: 0 }, { dokumentId: 'b', sidindex: 0 }, { dokumentId: 'c', sidindex: 0 }] })
    expect(h).toEqual([
      { sida: 2, kod: 'typsnitt', detalj: 'Helvetica' },
      { sida: 3, kod: 'cmyk', detalj: '' },
    ])
  })
  it('vägrar märka en fil med hinder som PDF/A', async () => {
    await expect(bakaIhop({ dokument, sidor: [{ dokumentId: 'b', sidindex: 0 }], format: 'pdfa' })).rejects.toThrow(/pdfa/)
  })
})

describe('färgprofilen', () => {
  it('är en ICC-profil för RGB med rätt storlek i huvudet', () => {
    const p = srgbProfil()
    const v = new DataView(p.buffer, p.byteOffset)
    expect(v.getUint32(0)).toBe(p.length)
    expect(String.fromCharCode(...p.subarray(36, 40))).toBe('acsp')
    expect(String.fromCharCode(...p.subarray(16, 20))).toBe('RGB ')
  })
})

describe('PDF/A-2b och vanlig PDF', () => {
  it('ger en fil som veraPDF godkänner som PDF/A-2b, med orörda sidor (FR-SPA-004, NFR-COMP-004, R8)', async () => {
    const pdfa = await bakaIhop({ dokument, sidor: [{ dokumentId: 'a', sidindex: 1 }, { dokumentId: 'a', sidindex: 0, vridning: 90 }], format: 'pdfa', uppgifter, datum })
    const vanlig = await bakaIhop({ dokument, sidor: [{ dokumentId: 'b', sidindex: 0 }, { dokumentId: 'c', sidindex: 0 }], format: 'pdf', uppgifter, datum })
    const katalog = mkdtempSync(join(tmpdir(), 'pdfa-'))
    writeFileSync(join(katalog, 'pdfa.pdf'), pdfa)
    writeFileSync(join(katalog, 'vanlig.pdf'), vanlig)
    const ut = execFileSync('node', [new URL('../../scripts/verapdf.mjs', import.meta.url).pathname, join(katalog, 'pdfa.pdf')], { encoding: 'utf8' })
    expect(ut).toMatch(/^PASS .*pdfa\.pdf 2b$/m)

    const d = await PDFDocument.load(pdfa)
    const kalla = await PDFDocument.load(dokument.a)
    expect(innehall(d.getPage(0))).toBe(innehall(kalla.getPage(1)))
    expect(innehall(d.getPage(1))).toBe(innehall(kalla.getPage(0)))
    expect(d.getPage(1).getRotation().angle).toBe(90)
    expect(d.getTitle()).toBe('Beslut åäö')

    // FR-SPA-006: vanlig PDF har ingen PDF/A-identifiering
    const v = await PDFDocument.load(vanlig)
    expect(v.catalog.has(PDFName.of('OutputIntents'))).toBe(false)
    expect(Buffer.from(vanlig).toString('latin1')).not.toContain('pdfaid:part')
  }, 120_000)
})
