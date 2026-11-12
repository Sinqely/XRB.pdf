// Inläsning från filväljare och släpp (FEAT-001 design §3.5; FR-FIL-001, FR-FIL-002).
// Ett fel stannar vid den fil det gäller (architecture.md 8.3). Noggranna felbesked kommer i FEAT-002.
import { laggTillDokument } from '../karna/arbetsyta'
import { nyttId, uniktNamn, type Tillstand } from '../karna/tillstand'
import { texter } from '../karna/texter'
import { oppnaPdf } from '../las/pdfjs-adapter'
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
    try {
      const bytes = new Uint8Array(await fil.arrayBuffer())
      const { sidantal, pdf } = await oppnaPdf(bytes)
      const id = nyttId('dok')
      const namn = uniktNamn(fil.name, tillstand.hamta().dokument)
      let meddelande = ''
      tillstand.andra((nu) => {
        const a = laggTillDokument(nu, { id, namn, bytes, sidantal, storlekByte: fil.size })
        meddelande = a.meddelande
        return a.yta
      })
      registrera(id, pdf, sidantal)
      vy.status(meddelande)
    } catch {
      vy.fel(texter.kundeInteLasas(fil.name))
      vy.status(texter.kundeInteLasas(fil.name))
    }
  }
  vy.lasesIn(null)
}

/** Filer ur ett släpp; annat (text, länkar) ignoreras. */
export function filerUrSlapp(e: DragEvent): File[] {
  return Array.from(e.dataTransfer?.files ?? [])
}
