// Överlägg i resultatfilen (FR-SPA-008): stämpel och etikett läggs i ett eget innehållsflöde ovanpå sidan.
// Sidans egna flöden rörs inte (R8). Placeringen kommer bara från layoutmodellen (R4, ADR-006).
import { concatTransformationMatrix, popGraphicsState, pushGraphicsState, rgb, type PDFFont, type PDFImage, type PDFPage } from '@cantoo/pdf-lib'
import { etikettMatt, type Glyfkalla } from '../karna/etikett'
import { ruta, stampelMatt, type Matt } from '../karna/layout'
import type { Placering } from '../karna/typer'

/** Sidans synliga ruta (beskärningsrutan inom mediarutan, som pdf.js visar) och total rotation. */
function synlig(sida: PDFPage) {
  const m = sida.getMediaBox()
  const c = sida.getCropBox()
  const x0 = Math.max(m.x, c.x)
  const y0 = Math.max(m.y, c.y)
  const x1 = Math.min(m.x + m.width, c.x + c.width)
  const y1 = Math.min(m.y + m.height, c.y + c.height)
  const rotation = (((sida.getRotation().angle % 360) + 360) % 360) as 0 | 90 | 180 | 270
  return { x0, y0, b: x1 - x0, h: y1 - y0, rotation }
}

/** Sidans mått i visad riktning, samma som pdf.js ger förhandsvisningen. */
export function visadeMatt(sida: PDFPage): Matt {
  const s = synlig(sida)
  return s.rotation % 180 === 0 ? { bredd: s.b, hojd: s.h } : { bredd: s.h, hojd: s.b }
}

/**
 * Lägger ett koordinatsystem med origo i den visade sidans nedre vänstra hörn och y uppåt,
 * så att överlägget hamnar rätt och står upprätt även på vridna sidor.
 */
function iVisadRiktning(sida: PDFPage, rita: (matt: Matt) => void) {
  const s = synlig(sida)
  const m: Record<typeof s.rotation, [number, number, number, number, number, number]> = {
    0: [1, 0, 0, 1, s.x0, s.y0],
    90: [0, 1, -1, 0, s.x0 + s.b, s.y0],
    180: [-1, 0, 0, -1, s.x0 + s.b, s.y0 + s.h],
    270: [0, -1, 1, 0, s.x0, s.y0 + s.h],
  }
  sida.pushOperators(pushGraphicsState(), concatTransformationMatrix(...m[s.rotation]))
  rita(visadeMatt(sida))
  sida.pushOperators(popGraphicsState())
}

export interface Stampelbygge {
  readonly breddMm: number
  readonly pxBredd: number
  readonly pxHojd: number
  readonly opacitet: number
  readonly placering: Placering
}

export function ritaStampel(sida: PDFPage, bild: PDFImage, s: Stampelbygge): void {
  iVisadRiktning(sida, (matt) => {
    const r = ruta(matt, stampelMatt(s), s.placering)
    sida.drawImage(bild, { x: r.x, y: matt.hojd - r.y - r.h, width: r.b, height: r.h, opacity: s.opacitet / 100 })
  })
}

export interface Etikettbygge {
  readonly text: string
  readonly storlekPt: number
  readonly farg: string
  readonly bakgrund: string | null
  readonly placering: Placering
}

const farg = (hex: string) => rgb(parseInt(hex.slice(1, 3), 16) / 255, parseInt(hex.slice(3, 5), 16) / 255, parseInt(hex.slice(5, 7), 16) / 255)

/** Etiketten på en rad med valt typsnitt, färg och bakgrund (FR-TXT-001..008). */
export function ritaEtikett(sida: PDFPage, font: PDFFont, glyfer: Glyfkalla, e: Etikettbygge): void {
  const m = etikettMatt(glyfer, e)
  iVisadRiktning(sida, (matt) => {
    const r = ruta(matt, m, e.placering)
    // Krymps etiketten för att rymmas på sidan krymps texten lika mycket.
    const f = r.b / m.bredd
    const botten = matt.hojd - r.y - r.h
    if (e.bakgrund) sida.drawRectangle({ x: r.x, y: botten, width: r.b, height: r.h, color: farg(e.bakgrund) })
    sida.drawText(e.text, { x: r.x + m.marginal * f, y: botten + r.h - m.baslinje * f, size: e.storlekPt * f, font, color: farg(e.farg) })
  })
}
