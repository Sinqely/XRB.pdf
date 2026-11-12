// Huvudtrådens väg till bygg-arbetstråden. Arbetstråden är inbakad som blob (ADR-002).
import ByggWorker from './bygg-arbetstrad?worker&inline'
import type { Byggbegaran } from './export'

let arbetstrad: Worker | null = null

export function bygg(begaran: Byggbegaran): Promise<Uint8Array> {
  arbetstrad ??= new ByggWorker()
  const w = arbetstrad
  return new Promise((ok, fel) => {
    w.onmessage = (e: MessageEvent<{ ok: boolean; bytes?: Uint8Array; fel?: string }>) =>
      e.data.ok && e.data.bytes ? ok(e.data.bytes) : fel(new Error(e.data.fel ?? 'okänt fel'))
    w.onerror = (e) => fel(new Error(e.message))
    // Kopior skickas, så att arbetsytan aldrig ändras av bygget (FR-SPA-012).
    w.postMessage(begaran)
  })
}
