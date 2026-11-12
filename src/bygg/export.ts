// Export (ADR-004): kopierar sidobjekten oförändrade till en ny fil med pdf-lib.
// Sidornas innehållsflöden skrivs aldrig om (BG-009, FR-SPA-007, regel R8).
// Ren funktion utan DOM, så att den kan köras i bygg-arbetstråden och i enhetstester.
import { PDFDocument } from '@cantoo/pdf-lib'

export interface Byggbegaran {
  /** Källfilernas bytes, nyckel = dokument-id. */
  readonly dokument: Readonly<Record<string, Uint8Array>>
  /** Resultatets sidor i ordning. */
  readonly sidor: readonly { readonly dokumentId: string; readonly sidindex: number }[]
}

export async function bakaIhop(begaran: Byggbegaran): Promise<Uint8Array> {
  const ut = await PDFDocument.create()
  const oppnade = new Map<string, PDFDocument>()
  for (const { dokumentId, sidindex } of begaran.sidor) {
    let kalla = oppnade.get(dokumentId)
    if (!kalla) {
      const bytes = begaran.dokument[dokumentId]
      if (!bytes) throw new Error(`Dokumentet ${dokumentId} saknas`)
      kalla = await PDFDocument.load(bytes, { updateMetadata: false })
      oppnade.set(dokumentId, kalla)
    }
    const [sida] = await ut.copyPages(kalla, [sidindex])
    ut.addPage(sida)
  }
  // Okrypterad fil utan begränsningar (FR-SPA-009); inga objektströmmar för bästa läsbarhet i andra verktyg.
  return ut.save({ useObjectStreams: false })
}
