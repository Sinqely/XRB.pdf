// Det som inte hör hemma i tillståndet (FEAT-001 design §5, beslut B2): pdf.js-dokument och miniatyrer per dokument-id.
// Bara i minnet (FR-ALM-008).
import { useEffect, useState } from 'preact/hooks'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { sidmatt, stangPdf, type Sidmatt } from '../las/pdfjs-adapter'
import { skapaMiniatyrko, type Miniatyr } from '../las/miniatyrer'
import { stadaGranskningar } from './granskning'

const ko = skapaMiniatyrko(88)
const pdfer = new Map<string, PDFDocumentProxy>()
const bilder = new Map<string, (Miniatyr | null)[]>()
const matt = new Map<string, Sidmatt | 'hamtas'>()
const lyssnare = new Set<() => void>()
/** Egna lyssnare för sidmått, så att hela appen inte ritas om för varje miniatyr. */
const mattLyssnare = new Set<() => void>()
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
  for (const k of [...matt.keys()]) if (k.startsWith(`${dokId}:`)) matt.delete(k)
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

export function pdfFor(dokId: string): PDFDocumentProxy | null {
  return pdfer.get(dokId) ?? null
}

/** Frigör pdf.js-dokument och bilder för dokument som inte längre finns i någon version (efter ångra-historik). */
export function stada(behall: Set<string>) {
  for (const id of [...pdfer.keys()]) if (!behall.has(id)) avregistrera(id)
  stadaGranskningar(behall)
}

/**
 * Sidans mått i visad riktning, för layoutmodellen (marginalvarningar och storlek på alla sidor).
 * Ger null första gången och ritar om komponenter med useSidmatt när måttet är hämtat.
 */
export function sidmattFor(dokId: string, sidindex: number, vridning: number): Sidmatt | null {
  const k = `${dokId}:${sidindex}:${vridning}`
  const m = matt.get(k)
  if (m && m !== 'hamtas') return m
  const pdf = pdfer.get(dokId)
  if (!m && pdf) {
    matt.set(k, 'hamtas')
    sidmatt(pdf, sidindex, vridning).then(
      (v) => {
        if (pdfer.get(dokId) !== pdf) return
        matt.set(k, v)
        mattLyssnare.forEach((l) => l())
      },
      () => matt.delete(k),
    )
  }
  return null
}

/** Ritar om komponenten när ett sidmått har hämtats. */
export function useSidmatt() {
  const [, satt] = useState(0)
  useEffect(() => {
    const l = () => satt((n) => n + 1)
    mattLyssnare.add(l)
    return () => {
      mattLyssnare.delete(l)
    }
  }, [])
}
