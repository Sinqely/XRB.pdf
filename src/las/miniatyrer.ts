// Miniatyrkö (FEAT-001 technical-design.md §3.2): ritar några sidor åt gången så att gränssnittet svarar
// och 100 sidor hinner visas inom 5 sekunder (NFR-PERF-002),
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
  /** pdf.js tolkar sidan i sin arbetstråd medan huvudtråden ritar och kodar en annan. */
  const SAMTIDIGA = 3
  let ritar = 0

  async function arbetare() {
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
  }
  function nasta() {
    while (ritar < SAMTIDIGA && kö.length) {
      ritar++
      void arbetare().finally(() => ritar--)
    }
  }

  return {
    ritaAlla(dokId, pdf, sidantal, klar) {
      adresser.set(dokId, [])
      for (let i = 0; i < sidantal; i++) kö.push({ dokId, pdf, sidindex: i, klar })
      nasta()
    },
    slapp(dokId) {
      for (let i = kö.length - 1; i >= 0; i--) if (kö[i].dokId === dokId) kö.splice(i, 1)
      adresser.get(dokId)?.forEach((u) => URL.revokeObjectURL(u))
      adresser.delete(dokId)
    },
  }
}
