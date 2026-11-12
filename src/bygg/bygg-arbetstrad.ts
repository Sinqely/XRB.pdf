// Bygg-arbetstråden: skapar resultatfilen utanför huvudtråden (architecture.md 5.1; FEAT-001 design §3.3).
import { bakaIhop, type Byggbegaran } from './export'

const post = (m: unknown, t?: Transferable[]) => (self as unknown as Worker).postMessage(m, t ?? [])

self.onmessage = async (e: MessageEvent<{ nr: number; begaran: Byggbegaran }>) => {
  const { nr, begaran } = e.data
  try {
    const bytes = await bakaIhop(begaran)
    post({ nr, ok: true, bytes }, [bytes.buffer])
  } catch (fel) {
    const kod = fel instanceof Error && fel.message.startsWith('kalla:') ? 'kalla' : 'okant'
    post({ nr, ok: false, fel: kod, detalj: String(fel) })
  }
}
