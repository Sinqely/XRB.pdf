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

export interface Sidmatt {
  /** Sidans bredd och höjd i punkter efter sidans egen rotation (/Rotate) och extra vridning. */
  readonly bredd: number
  readonly hojd: number
}

/** Sidans storlek i punkter, med extra vridning i grader (0, 90, 180, 270). */
export async function sidmatt(pdf: PDFDocumentProxy, sidindex: number, vridning = 0): Promise<Sidmatt> {
  const sida = await pdf.getPage(sidindex + 1)
  const vy = sida.getViewport({ scale: 1, rotation: (sida.rotate + vridning) % 360 })
  return { bredd: vy.width, hojd: vy.height }
}

export interface Ritning {
  readonly klar: Promise<Sidmatt>
  avbryt(): void
}

/**
 * Ritar en sida på en canvas i given skala (pixlar per punkt, före devicePixelRatio).
 * Används av förhandsvisningen (FEAT-003). Tidigare ritning på samma canvas ska avbrytas av anroparen.
 */
export function ritaSida(pdf: PDFDocumentProxy, sidindex: number, canvas: HTMLCanvasElement, skala: number, vridning = 0): Ritning {
  let uppgift: { cancel(): void; promise: Promise<void> } | null = null
  let avbruten = false
  const klar = (async () => {
    const sida = await pdf.getPage(sidindex + 1)
    const rot = (sida.rotate + vridning) % 360
    const pr = window.devicePixelRatio || 1
    const vy = sida.getViewport({ scale: skala * pr, rotation: rot })
    const mal = sida.getViewport({ scale: 1, rotation: rot })
    if (avbruten) throw new Error('avbruten')
    // Rita på en egen canvas och kopiera, så att den synliga inte blinkar tom.
    const tmp = document.createElement('canvas')
    tmp.width = Math.ceil(vy.width)
    tmp.height = Math.ceil(vy.height)
    uppgift = sida.render({ canvas: tmp, viewport: vy })
    await uppgift.promise
    if (avbruten) throw new Error('avbruten')
    canvas.width = tmp.width
    canvas.height = tmp.height
    canvas.style.width = `${vy.width / pr}px`
    canvas.style.height = `${vy.height / pr}px`
    canvas.getContext('2d')!.drawImage(tmp, 0, 0)
    return { bredd: mal.width, hojd: mal.height }
  })()
  return {
    klar,
    avbryt() {
      avbruten = true
      uppgift?.cancel()
    },
  }
}
