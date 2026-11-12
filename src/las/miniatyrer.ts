// Miniatyrkö (FEAT-001 technical-design.md §3.2): ritar sidor en i taget så att gränssnittet svarar,
// och frigör bilderna när dokumentet tas bort.
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { ritaMiniatyr } from './pdfjs-adapter'

/** Blob-adress, 'fel' om sidan inte kunde ritas. */
export type Miniatyr = string | 'fel'

export interface Miniatyrko {
  ritaAlla(dokId: string, pdf: PDFDocumentProxy, sidantal: number, klar: (sidindex: number, m: Miniatyr) => void): void
  slapp(dokId: string): void
}

export function skapaMiniatyrko(bredd: number): Miniatyrko {
  const kö: { dokId: string; pdf: PDFDocumentProxy; sidindex: number; klar: (i: number, m: Miniatyr) => void }[] = []
  const adresser = new Map<string, string[]>()
  let ritar = false

  async function nasta() {
    if (ritar) return
    ritar = true
    while (kö.length) {
      const u = kö.shift()!
      if (!adresser.has(u.dokId)) continue
      try {
        const url = await ritaMiniatyr(u.pdf, u.sidindex, bredd)
        const lista = adresser.get(u.dokId)
        if (lista) {
          lista.push(url)
          u.klar(u.sidindex, url)
        } else URL.revokeObjectURL(url)
      } catch {
        if (adresser.has(u.dokId)) u.klar(u.sidindex, 'fel')
      }
    }
    ritar = false
  }

  return {
    ritaAlla(dokId, pdf, sidantal, klar) {
      adresser.set(dokId, [])
      for (let i = 0; i < sidantal; i++) kö.push({ dokId, pdf, sidindex: i, klar })
      void nasta()
    },
    slapp(dokId) {
      for (let i = kö.length - 1; i >= 0; i--) if (kö[i].dokId === dokId) kö.splice(i, 1)
      adresser.get(dokId)?.forEach((u) => URL.revokeObjectURL(u))
      adresser.delete(dokId)
    },
  }
}
