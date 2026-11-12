// Logiken bakom spara-dialogen SCR-APP-005 (FEAT-001 technical-design.md §3.4), skild från komponenterna (B5).
import { texter } from '../karna/texter'
import type { Arbetsyta, Format, Typsnitt } from '../karna/typer'
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
  /** Typsnittsfilen för etiketten (samma som förhandsvisningen använder). */
  typsnitt: (t: Typsnitt, fet: boolean, kursiv: boolean) => Promise<Uint8Array>
  ladda: (bytes: Uint8Array, filnamn: string) => void
}

export function byggbegaran(yta: Arbetsyta, format: Format = yta.sparval.format, datum = Date.now(), typsnitt?: Uint8Array): Byggbegaran {
  const anvanda = new Set(yta.resultat.map((r) => r.dokumentId))
  const st = yta.vattenstampel
  const e = yta.textetikett?.text.trim() ? yta.textetikett : null
  return {
    dokument: Object.fromEntries(yta.dokument.filter((d) => anvanda.has(d.id)).map((d) => [d.id, d.bytes])),
    sidor: yta.resultat.map(({ dokumentId, sidindex, vridning, stampel, etikett }) => ({ dokumentId, sidindex, vridning, stampel: !!st && stampel, etikett: !!e && etikett })),
    stampel: st && { bild: st.bild, typ: st.typ, breddMm: st.breddMm, pxBredd: st.pxBredd, pxHojd: st.pxHojd, opacitet: st.opacitet, placering: st.placering },
    etikett: e && typsnitt ? { text: e.text, storlekPt: e.storlekPt, farg: e.farg, bakgrund: e.bakgrund, placering: e.placering, typsnitt } : null,
    format,
    uppgifter: yta.sparval.dold.metadata ?? undefined,
    datum,
  }
}

export async function sparaResultat(yta: Arbetsyta, filnamn: string, format: Format, b: Sparberoenden): Promise<Sparutfall> {
  if (yta.resultat.length === 0) return { ok: false, meddelande: texter.bakaIhopIngaSidor }
  try {
    const e = yta.textetikett
    const typsnitt = e?.text.trim() ? await b.typsnitt(e.typsnitt, e.fet, e.kursiv) : undefined
    const ut = await b.bygg(byggbegaran(yta, format, Date.now(), typsnitt))
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
