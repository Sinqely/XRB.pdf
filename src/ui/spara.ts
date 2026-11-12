// Logiken bakom spara-dialogen SCR-APP-005 (FEAT-001 technical-design.md §3.4), skild från komponenterna (B5).
import { texter } from '../karna/texter'
import type { Arbetsyta } from '../karna/typer'
import type { Byggbegaran } from '../bygg/export'

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

export type Sparutfall = { ok: true; filnamn: string } | { ok: false; meddelande: string }

export interface Sparberoenden {
  bygg: (b: Byggbegaran) => Promise<Uint8Array>
  ladda: (bytes: Uint8Array, filnamn: string) => void
}

export function byggbegaran(yta: Arbetsyta): Byggbegaran {
  const anvanda = new Set(yta.resultat.map((r) => r.dokumentId))
  return {
    dokument: Object.fromEntries(yta.dokument.filter((d) => anvanda.has(d.id)).map((d) => [d.id, d.bytes])),
    sidor: yta.resultat.map(({ dokumentId, sidindex }) => ({ dokumentId, sidindex })),
  }
}

export async function sparaResultat(yta: Arbetsyta, filnamn: string, b: Sparberoenden): Promise<Sparutfall> {
  if (yta.resultat.length === 0) return { ok: false, meddelande: texter.bakaIhopIngaSidor }
  try {
    const bytes = await b.bygg(byggbegaran(yta))
    b.ladda(bytes, filnamn)
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
