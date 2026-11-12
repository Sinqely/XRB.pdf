// FEAT-006 i resultatfilen: stämpeln hamnar där layoutmodellen och förhandsvisningen säger (FR-SPA-008, FR-PLC-008, MF-02),
// även på vridna sidor och sidor med beskärningsruta; sidornas egna innehållsflöden är orörda (R8); PDF/A-2b går igenom (FR-STA-002).
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { degrees, PDFArray, PDFDocument, PDFName, PDFRawStream, PDFRef, type PDFPage } from '@cantoo/pdf-lib'
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs'
import { bakaIhop, type Byggbegaran } from '../../src/bygg/export'
import { forval, ruta, stampelMatt } from '../../src/karna/layout'

pdfjs.GlobalWorkerOptions.workerSrc = new URL('../../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).href

const las = (n: string) => new Uint8Array(readFileSync(new URL(`../filer/${n}`, import.meta.url)))
const png = las('stampel.png')

async function konstigSida(): Promise<Uint8Array> {
  // En sida med /Rotate 270 och en beskärningsruta som inte börjar i origo.
  const d = await PDFDocument.create()
  const s = d.addPage([500, 700])
  s.drawRectangle({ x: 0, y: 0, width: 500, height: 700, borderWidth: 1 })
  s.setCropBox(40, 60, 400, 500)
  s.setRotation(degrees(270))
  return d.save()
}

const strommar = (sida: PDFPage) => {
  const c = sida.node.get(PDFName.of('Contents'))
  const refs = c instanceof PDFArray ? c.asArray() : [c]
  return refs.map((r) => Buffer.from((sida.doc.context.lookup(r as PDFRef) as PDFRawStream).getContents()).toString('hex'))
}

type M = [number, number, number, number, number, number]
const mul = (m: M, n: M): M => [
  m[0] * n[0] + m[1] * n[2],
  m[0] * n[1] + m[1] * n[3],
  m[2] * n[0] + m[3] * n[2],
  m[2] * n[1] + m[3] * n[3],
  m[4] * n[0] + m[5] * n[2] + n[4],
  m[4] * n[1] + m[5] * n[3] + n[5],
]

/** Bildernas rutor på sidan i pdf.js visade koordinater (samma som förhandsvisningen), skala 1. */
async function bildrutor(bytes: Uint8Array) {
  const uppgift = pdfjs.getDocument({ data: bytes.slice(), isEvalSupported: false, enableScripting: false })
  const doc = await uppgift.promise
  const ut: { x: number; y: number; b: number; h: number }[][] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const sida = await doc.getPage(i)
    const vy = sida.getViewport({ scale: 1 })
    const ops = await sida.getOperatorList()
    let ctm: M = [1, 0, 0, 1, 0, 0]
    const stack: M[] = []
    const rutor: (typeof ut)[number] = []
    ops.fnArray.forEach((fn, k) => {
      if (fn === pdfjs.OPS.save) stack.push(ctm)
      else if (fn === pdfjs.OPS.restore) ctm = stack.pop() ?? ctm
      else if (fn === pdfjs.OPS.transform) ctm = mul(ops.argsArray[k] as M, ctm)
      else if (fn === pdfjs.OPS.paintImageXObject) {
        const p = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([u, v]) => vy.convertToViewportPoint(ctm[0] * u! + ctm[2] * v! + ctm[4], ctm[1] * u! + ctm[3] * v! + ctm[5]))
        const xs = p.map((q) => q[0]!)
        const ys = p.map((q) => q[1]!)
        rutor.push({ x: Math.min(...xs), y: Math.min(...ys), b: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) })
      }
    })
    ut.push(rutor)
  }
  await uppgift.destroy()
  return { rutor: ut }
}

async function visadeMatt(bytes: Uint8Array) {
  const uppgift = pdfjs.getDocument({ data: bytes.slice() })
  const doc = await uppgift.promise
  const ut = []
  for (let i = 1; i <= doc.numPages; i++) {
    const vy = (await doc.getPage(i)).getViewport({ scale: 1 })
    ut.push({ bredd: vy.width, hojd: vy.height })
  }
  await uppgift.destroy()
  return ut
}

describe('vattenstämpel i resultatfilen', () => {
  it('hamnar på samma ställe som i förhandsvisningen på sidor med olika storlek, vridning och beskärning', async () => {
    const stampel = { bild: png, typ: 'png' as const, pxBredd: 400, pxHojd: 200, breddMm: 40, opacitet: 60, placering: forval('nedre-hoger', 10) }
    const begaran: Byggbegaran = {
      dokument: { m: las('blandade-format.pdf'), a: las('arkivbar.pdf'), k: await konstigSida() },
      sidor: [
        { dokumentId: 'm', sidindex: 0, stampel: true },
        { dokumentId: 'm', sidindex: 1, stampel: true },
        { dokumentId: 'm', sidindex: 2, stampel: false },
        { dokumentId: 'a', sidindex: 0, vridning: 90, stampel: true },
        { dokumentId: 'a', sidindex: 1, vridning: 180, stampel: true },
        { dokumentId: 'k', sidindex: 0, stampel: true },
      ],
      stampel,
      format: 'pdf',
      datum: 0,
    }
    const ut = await bakaIhop(begaran)
    const { rutor } = await bildrutor(ut)
    const matt = await visadeMatt(ut)
    begaran.sidor.forEach((s, i) => {
      if (!s.stampel) return expect(rutor[i]).toEqual([])
      expect(rutor[i]).toHaveLength(1)
      const vantat = ruta(matt[i]!, stampelMatt(stampel), stampel.placering)
      const r = rutor[i]![0]!
      expect(r.x).toBeCloseTo(vantat.x, 3)
      expect(r.y).toBeCloseTo(vantat.y, 3)
      expect(r.b).toBeCloseTo(vantat.b, 3)
      expect(r.h).toBeCloseTo(vantat.h, 3)
    })

    // R8: källsidornas innehållsflöden finns kvar oförändrade och i ordning
    const d = await PDFDocument.load(ut)
    const kallor = { m: await PDFDocument.load(begaran.dokument.m!), a: await PDFDocument.load(begaran.dokument.a!), k: await PDFDocument.load(begaran.dokument.k!) }
    begaran.sidor.forEach((s, i) => {
      const fore = strommar(kallor[s.dokumentId as 'm'].getPage(s.sidindex)).join('|')
      expect(strommar(d.getPage(i)).join('|')).toContain(fore)
    })
  })

  it('PNG med genomskinlighet behåller sin alfakanal och filen godkänns som PDF/A-2b (FR-STA-002)', async () => {
    const ut = await bakaIhop({
      dokument: { a: las('arkivbar.pdf') },
      sidor: [{ dokumentId: 'a', sidindex: 0, stampel: true }, { dokumentId: 'a', sidindex: 1, vridning: 90, stampel: true }],
      stampel: { bild: png, typ: 'png', pxBredd: 400, pxHojd: 200, breddMm: 50, opacitet: 40, placering: forval('sidhuvud') },
      format: 'pdfa',
      datum: 0,
    })
    const text = Buffer.from(ut).toString('latin1')
    expect(text).toMatch(/\/SMask \d+ 0 R/)
    expect(text).toMatch(/\/ca 0\.4/)
    const katalog = mkdtempSync(join(tmpdir(), 'stampel-'))
    writeFileSync(join(katalog, 'ut.pdf'), ut)
    const rapport = execFileSync('node', [new URL('../../scripts/verapdf.mjs', import.meta.url).pathname, join(katalog, 'ut.pdf')], { encoding: 'utf8' })
    expect(rapport).toMatch(/^PASS .* 2b$/m)
  }, 120_000)

  it('JPEG fungerar som stämpel', async () => {
    const ut = await bakaIhop({
      dokument: { a: las('arkivbar.pdf') },
      sidor: [{ dokumentId: 'a', sidindex: 0, stampel: true }],
      stampel: { bild: las('stampel.jpg'), typ: 'jpeg', pxBredd: 300, pxHojd: 300, breddMm: 30, opacitet: 100, placering: forval('ovre-vanster') },
      format: 'pdf',
    })
    expect((await bildrutor(ut)).rutor[0]).toHaveLength(1)
  })
})
