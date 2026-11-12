// pdf.js-adapter (ADR-003). Enda stället som öppnar PDF:er med pdf.js (regel R6).
// Tolkningen sker i pdf.js egen arbetstråd, inbakad som blob (ADR-002).
// pdf.js 6 använder inte eval; skriptmodulen (pdf.sandbox) importeras aldrig, så skript i filer körs inte (NFR-SEC-003).
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist'
import PdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker&inline'

let arbetstradStartad = false
function startaArbetstrad() {
  if (arbetstradStartad) return
  GlobalWorkerOptions.workerPort = new PdfWorker()
  arbetstradStartad = true
}

export type Lasfel = 'losenord' | 'skadad'

export interface OppnatDokument {
  readonly sidantal: number
  readonly pdf: PDFDocumentProxy
}

export async function oppnaPdf(bytes: Uint8Array): Promise<OppnatDokument> {
  startaArbetstrad()
  // pdf.js tar över bufferten, så den får en egen kopia; originalet behövs vid sparande.
  const uppgift = getDocument({
    data: bytes.slice(),
    enableXfa: false,
    useSystemFonts: true,
    stopAtErrors: false,
  })
  try {
    const pdf = await uppgift.promise
    return { sidantal: pdf.numPages, pdf }
  } catch (e) {
    const namn = (e as { name?: string })?.name
    throw new Error(namn === 'PasswordException' ? 'losenord' : 'skadad', { cause: e })
  }
}

/** Ritar en sida som miniatyr och ger en blob-adress till en PNG-bild. */
export async function ritaMiniatyr(pdf: PDFDocumentProxy, sidindex: number, bredd: number): Promise<string> {
  const sida = await pdf.getPage(sidindex + 1)
  const grund = sida.getViewport({ scale: 1 })
  const vy = sida.getViewport({ scale: (bredd * window.devicePixelRatio) / grund.width })
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(vy.width)
  canvas.height = Math.ceil(vy.height)
  await sida.render({ canvas, viewport: vy }).promise
  const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/png'))
  if (!blob) throw new Error('miniatyr')
  return URL.createObjectURL(blob)
}

/** Stänger dokumentet i pdf.js och frigör dess minne i arbetstråden. */
export async function stangPdf(pdf: PDFDocumentProxy): Promise<void> {
  await pdf.loadingTask.destroy()
}
