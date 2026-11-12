// Bygg-arbetstråden: skapar resultatfilen utanför huvudtråden (architecture.md 5.1).
import { bakaIhop, type Byggbegaran } from './export'

self.onmessage = async (e: MessageEvent<Byggbegaran>) => {
  try {
    const bytes = await bakaIhop(e.data)
    ;(self as unknown as Worker).postMessage({ ok: true, bytes }, [bytes.buffer])
  } catch (fel) {
    ;(self as unknown as Worker).postMessage({ ok: false, fel: String(fel) })
  }
}
