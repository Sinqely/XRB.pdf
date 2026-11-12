// Logiken bakom spara-dialogen SCR-APP-005 (FEAT-001 technical-design.md §3.4), skild från komponenterna (B5).
import { texter } from '../karna/texter'
import type { Arbetsyta, Format } from '../karna/typer'
import type { Byggbegaran } from '../bygg/export'
import type { Byggutfall } from '../bygg/bygg-klient'
import type { Hinder } from '../bygg/pdfa'

export function foreslaFilnamn(yta: Arbetsyta): string {
  if (yta.sparval.filnamn) return yta.sparval.filnamn
  const forsta = yta.dokument.find((d) => d.id === yta.resultat[0]?.dokumentId) ?? yta.dokument[0]
  const bas = (forsta?.namn ?? 'resultat').replace(/ \(\d+\)$/, '').replace(/\.pdf$/i, '')
  return `${bas}-ihopbakad.pdf`
}

export function stadaFilnamn(inmatat: string, forslag: string): string {
  // eslint-disable-next-line no-control-regex
  let namn = inmatat.replace(/[\\/:*?"<>|\u0000-\u001f\u007f]/g, '').trim()
  namn = namn.replace(/\.pdf$/i, '').replace(/[. ]+$/, '').trim()
  if (!namn) return forslag
  return `${namn.slice(0, 200)}.pdf`
}

export type Sparutfall =
  | { ok: true; filnamn: string }
  | { ok: false; meddelande: string }
  /** PDF/A-2b går inte: sidorna och orsakerna visas i SCR-APP-006 (FR-SPA-005). Ingen fil har skapats. */
  | { ok: false; hinder: Hinder[] }

export interface Sparberoenden {
  bygg: (b: Byggbegaran) => Promise<Byggutfall>
  ladda: (bytes: Uint8Array, filnamn: string) => void
}

export function byggbegaran(yta: Arbetsyta, format: Format = yta.sparval.format, datum = Date.now()): Byggbegaran {
  const anvanda = new Set(yta.resultat.map((r) => r.dokumentId))
  return {
    dokument: Object.fromEntries(yta.dokument.filter((d) => anvanda.has(d.id)).map((d) => [d.id, d.bytes])),
    sidor: yta.resultat.map(({ dokumentId, sidindex, vridning }) => ({ dokumentId, sidindex, vridning })),
    format,
    uppgifter: yta.sparval.dold.metadata ?? undefined,
    datum,
  }
}

export async function sparaResultat(yta: Arbetsyta, filnamn: string, format: Format, b: Sparberoenden): Promise<Sparutfall> {
  if (yta.resultat.length === 0) return { ok: false, meddelande: texter.bakaIhopIngaSidor }
  try {
    const ut = await b.bygg(byggbegaran(yta, format))
    if ('hinder' in ut) return { ok: false, hinder: ut.hinder }
    b.ladda(ut.bytes, filnamn)
    return { ok: true, filnamn }
  } catch {
    return { ok: false, meddelande: texter.sparFel }
  }
}

/** Erbjuder filen via webbläsarens nedladdning (FR-SPA-001). Inget lämnar datorn. */
export function laddaNed(bytes: Uint8Array, filnamn: string): void {
  const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filnamn
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/** Sidorna i resultatet som har hinder, med orsakerna i klartext (SCR-APP-006). */
export function hinderPerSida(yta: Arbetsyta, hinder: readonly Hinder[]): { resultatId: string; rubrik: string; orsaker: string[] }[] {
  const ut = new Map<number, string[]>()
  for (const h of hinder) {
    const o = texter.hinder[h.kod](h.detalj)
    const lista = ut.get(h.sida) ?? []
    if (!lista.includes(o)) lista.push(o)
    ut.set(h.sida, lista)
  }
  return [...ut.entries()]
    .sort(([a], [b]) => a - b)
    .flatMap(([plats, orsaker]) => {
      const r = yta.resultat[plats - 1]
      if (!r) return []
      const d = yta.dokument.find((x) => x.id === r.dokumentId)
      return [{ resultatId: r.id, rubrik: texter.hinderSida(plats, d?.namn ?? '', r.sidindex + 1), orsaker }]
    })
}
