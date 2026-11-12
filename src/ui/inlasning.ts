// Inläsning från filväljare och släpp (FEAT-001 design §3.5; FR-FIL-001, FR-FIL-002).
// Ett fel stannar vid den fil det gäller (architecture.md 8.3). Noggranna felbesked kommer i FEAT-002.
import { laggTillDokument } from '../karna/arbetsyta'
import { nyttId, uniktNamn, type Tillstand } from '../karna/tillstand'
import { texter } from '../karna/texter'
import { oppnaPdf, stangPdf } from '../las/pdfjs-adapter'
import { felmeddelande, forkontroll, sidgrans, type Filfel } from '../karna/validering'
import { registrera } from './dokumentregister'

export interface Inlasningsvy {
  status(text: string): void
  fel(text: string): void
  lasesIn(namn: string | null): void
}

export async function lasInFiler(filer: Iterable<File>, tillstand: Tillstand, vy: Inlasningsvy): Promise<void> {
  for (const fil of filer) {
    vy.lasesIn(fil.name)
    vy.status(texter.lasesIn(fil.name))
    const avvisa = (f: Filfel, redan = 0) => {
      const m = felmeddelande(f, fil.name, redan)
      vy.fel(m)
      vy.status(m)
    }
    try {
      const forfel = forkontroll(fil.size, new Uint8Array(await fil.slice(0, 1024).arrayBuffer()))
      if (forfel) {
        avvisa(forfel)
        continue
      }
      const bytes = new Uint8Array(await fil.arrayBuffer())
      let oppnat
      try {
        oppnat = await oppnaPdf(bytes)
      } catch (e) {
        avvisa((e as Error).message === 'losenord' ? 'losenord' : 'skadad')
        continue
      }
      const { sidantal, pdf } = oppnat
      const redan = tillstand.hamta().dokument.reduce((s, d) => s + d.sidantal, 0)
      const gransfel = sidgrans(redan, sidantal)
      if (gransfel) {
        void stangPdf(pdf)
        avvisa(gransfel, redan)
        continue
      }
      const id = nyttId('dok')
      const namn = uniktNamn(fil.name, tillstand.hamta().dokument)
      let meddelande = ''
      tillstand.andra((nu) => {
        const a = laggTillDokument(nu, { id, namn, bytes, sidantal, storlekByte: fil.size })
        meddelande = a.meddelande
        return a.yta
      }, () => meddelande)
      registrera(id, pdf, sidantal)
      vy.status(meddelande)
    } catch {
      // Oväntat fel, t.ex. slut på minne (architecture.md 8.3).
      avvisa('skadad')
    }
  }
  vy.lasesIn(null)
}

/** Filer ur ett släpp; annat (text, länkar) ignoreras. */
export function filerUrSlapp(e: DragEvent): File[] {
  return Array.from(e.dataTransfer?.files ?? [])
}
