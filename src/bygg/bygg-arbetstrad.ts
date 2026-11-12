// Bygg-arbetstråden: skapar resultatfilen utanför huvudtråden (architecture.md 5.1; FEAT-001 design §3.3).
// Vid PDF/A görs förkontrollen först; hittas hinder skickas de tillbaka i stället för en fil (FR-SPA-005).
import { bakaIhop, kontrollera, type Byggbegaran } from './export'
import { granska } from './dold'

const post = (m: unknown, t?: Transferable[]) => (self as unknown as Worker).postMessage(m, t ?? [])

type Meddelande = { nr: number; begaran: Byggbegaran } | { nr: number; granska: Uint8Array }

self.onmessage = async (e: MessageEvent<Meddelande>) => {
  const { nr } = e.data
  try {
    // Granskning för panelen Dold information (FEAT-008).
    if ('granska' in e.data) {
      post({ nr, ok: true, granskning: await granska(e.data.granska) })
      return
    }
    const { begaran } = e.data
    if (begaran.format === 'pdfa') {
      const hinder = await kontrollera(begaran)
      if (hinder.length) {
        post({ nr, ok: true, hinder })
        return
      }
    }
    const bytes = await bakaIhop(begaran)
    post({ nr, ok: true, bytes }, [bytes.buffer])
  } catch (fel) {
    const kod = fel instanceof Error && fel.message.startsWith('kalla:') ? 'kalla' : 'okant'
    post({ nr, ok: false, fel: kod, detalj: String(fel) })
  }
}
