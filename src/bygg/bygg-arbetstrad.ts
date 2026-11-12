// Bygg-arbetstråden: skapar resultatfilen utanför huvudtråden (architecture.md 5.1; FEAT-001 design §3.3).
// Vid PDF/A görs förkontrollen först; hittas hinder skickas de tillbaka i stället för en fil (FR-SPA-005).
import { bakaIhop, kontrollera, type Byggbegaran } from './export'

const post = (m: unknown, t?: Transferable[]) => (self as unknown as Worker).postMessage(m, t ?? [])

self.onmessage = async (e: MessageEvent<{ nr: number; begaran: Byggbegaran }>) => {
  const { nr, begaran } = e.data
  try {
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
