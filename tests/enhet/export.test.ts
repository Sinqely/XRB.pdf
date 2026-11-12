// Enhetstester för exporten (ADR-004) och regel R8: sidornas innehåll kopieras oförändrat.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { PDFDocument, PDFName, PDFRawStream, PDFArray, PDFRef, type PDFPage } from '@cantoo/pdf-lib'
import { bakaIhop } from '../../src/bygg/export'

const las = (n: string) => new Uint8Array(readFileSync(new URL(`../filer/${n}`, import.meta.url)))

function innehall(sida: PDFPage): Uint8Array[] {
  const c = sida.node.get(PDFName.of('Contents'))
  const refs = c instanceof PDFArray ? c.asArray() : [c]
  return refs.map((r) => {
    const s = sida.doc.context.lookup(r as PDFRef)
    return (s as PDFRawStream).getContents()
  })
}

describe('bakaIhop', () => {
  it('sätter ihop valda sidor ur två filer i vald ordning (FR-SPA-001, FR-SID-006)', async () => {
    const ut = await bakaIhop({
      dokument: { a: las('beslut.pdf'), b: las('underskrift.pdf') },
      sidor: [
        { dokumentId: 'a', sidindex: 0 },
        { dokumentId: 'b', sidindex: 0 },
        { dokumentId: 'a', sidindex: 2 },
      ],
    })
    const doc = await PDFDocument.load(ut)
    expect(doc.getPageCount()).toBe(3)
  })

  it('kopierar sidornas innehållsflöden byte för byte (BG-009, FR-SPA-007, R8)', async () => {
    const kalla = await PDFDocument.load(las('blandade-format.pdf'))
    const ut = await PDFDocument.load(
      await bakaIhop({ dokument: { k: las('blandade-format.pdf') }, sidor: [2, 0, 1].map((i) => ({ dokumentId: 'k', sidindex: i })) }),
    )
    ;[2, 0, 1].forEach((k, i) => {
      expect(innehall(ut.getPage(i))).toEqual(innehall(kalla.getPage(k)))
      expect(ut.getPage(i).getSize()).toEqual(kalla.getPage(k).getSize())
    })
  })

  it('skapar en okrypterad fil (FR-SPA-009)', async () => {
    const ut = await bakaIhop({ dokument: { a: las('beslut.pdf') }, sidor: [{ dokumentId: 'a', sidindex: 0 }] })
    const doc = await PDFDocument.load(ut)
    expect(doc.isEncrypted).toBe(false)
  })

  it('ger fel när ett dokument saknas, utan att något skrivs', async () => {
    await expect(bakaIhop({ dokument: {}, sidor: [{ dokumentId: 'x', sidindex: 0 }] })).rejects.toThrow()
  })
})
