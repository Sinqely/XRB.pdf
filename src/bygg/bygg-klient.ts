// Huvudtrådens väg till bygg-arbetstråden (FEAT-001 design §3.3). Arbetstråden är inbakad som blob (ADR-002)
// och startas först vid första sparandet (NFR-PERF-004).
import ByggWorker from './bygg-arbetstrad?worker&inline'
import type { Byggbegaran } from './export'
import type { Hinder } from './pdfa'
import type { Granskning } from '../karna/dold'

/** En fil, eller sidorna som hindrar PDF/A-2b (FR-SPA-005). */
export type Byggutfall = { bytes: Uint8Array } | { hinder: Hinder[] }

export class Byggfel extends Error {
  readonly kod: 'kalla' | 'okant'
  readonly detalj: string
  constructor(kod: 'kalla' | 'okant', detalj: string) {
    super(`${kod}: ${detalj}`)
    this.kod = kod
    this.detalj = detalj
  }
}

type Svar = ({ nr: number; ok: true } & (Byggutfall | { granskning: Granskning })) | { nr: number; ok: false; fel: 'kalla' | 'okant'; detalj: string }

let arbetstrad: Worker | null = null
let nastaNr = 1
const vantande = new Map<number, { ok: (b: Byggutfall | { granskning: Granskning }) => void; fel: (e: Byggfel) => void }>()

function starta(): Worker {
  const w = new ByggWorker()
  w.onmessage = (e: MessageEvent<Svar>) => {
    const v = vantande.get(e.data.nr)
    if (!v) return
    vantande.delete(e.data.nr)
    if (e.data.ok) v.ok('granskning' in e.data ? { granskning: e.data.granskning } : 'hinder' in e.data ? { hinder: e.data.hinder } : { bytes: e.data.bytes })
    else v.fel(new Byggfel(e.data.fel, e.data.detalj))
  }
  w.onerror = (e) => {
    vantande.forEach((v) => v.fel(new Byggfel('okant', e.message)))
    vantande.clear()
    w.terminate()
    arbetstrad = null
  }
  return w
}

function skicka<T>(m: Record<string, unknown>): Promise<T> {
  arbetstrad ??= starta()
  const nr = nastaNr++
  return new Promise((ok, fel) => {
    vantande.set(nr, { ok: ok as (b: unknown) => void, fel })
    // Strukturerad kloning ger kopior, så att arbetsytan aldrig ändras av bygget (FR-SPA-012).
    arbetstrad!.postMessage({ nr, ...m })
  })
}

export function bygg(begaran: Byggbegaran): Promise<Byggutfall> {
  return skicka<Byggutfall>({ begaran })
}

/** Läser det som kan vara dolt i ett dokument (FEAT-008). */
export async function granskaDokument(bytes: Uint8Array): Promise<Granskning> {
  return (await skicka<{ granskning: Granskning }>({ granska: bytes })).granskning
}
