// Det som inte hör hemma i tillståndet (FEAT-001 design §5, beslut B2): pdf.js-dokument och miniatyrer per dokument-id.
// Bara i minnet (FR-ALM-008).
import { useEffect, useState } from 'preact/hooks'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { stangPdf } from '../las/pdfjs-adapter'
import { skapaMiniatyrko, type Miniatyr } from '../las/miniatyrer'

const ko = skapaMiniatyrko(88)
const pdfer = new Map<string, PDFDocumentProxy>()
const bilder = new Map<string, (Miniatyr | null)[]>()
const lyssnare = new Set<() => void>()
const meddela = () => lyssnare.forEach((l) => l())

export function registrera(dokId: string, pdf: PDFDocumentProxy, sidantal: number) {
  pdfer.set(dokId, pdf)
  bilder.set(dokId, Array.from({ length: sidantal }, () => null))
  ko.ritaAlla(dokId, pdf, sidantal, (i, m) => {
    const lista = bilder.get(dokId)
    if (!lista) return
    const ny = [...lista]
    ny[i] = m
    bilder.set(dokId, ny)
    meddela()
  })
  meddela()
}

export function avregistrera(dokId: string) {
  ko.slapp(dokId)
  const pdf = pdfer.get(dokId)
  if (pdf) void stangPdf(pdf)
  pdfer.delete(dokId)
  bilder.delete(dokId)
  meddela()
}

export function miniatyr(dokId: string, sidindex: number): Miniatyr | null {
  return bilder.get(dokId)?.[sidindex] ?? null
}

/** Ritar om komponenten när en miniatyr blir klar. */
export function useMiniatyrer() {
  const [, satt] = useState(0)
  useEffect(() => {
    const l = () => satt((n) => n + 1)
    lyssnare.add(l)
    return () => {
      lyssnare.delete(l)
    }
  }, [])
}
