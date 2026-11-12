// Arbetsyteoperationer (FEAT-001 technical-design.md §3.1). Rena funktioner:
// varje operation ger en ny arbetsyta och ett meddelande till statusytan (FR-SID-014).
import { texter } from './texter'
import { nyttId } from './tillstand'
import type { Arbetsyta, Dokument, Resultatsida } from './typer'

export interface Andring {
  readonly yta: Arbetsyta
  readonly meddelande: string
}

const ingen = (yta: Arbetsyta): Andring => ({ yta, meddelande: '' })
const dok = (yta: Arbetsyta, id: string) => yta.dokument.find((d) => d.id === id)
/** Ny förekomst; stämpel och etikett följer med när "alla sidor" är valt (FR-STA-012, FR-TXT-014). */
const ny = (yta: Arbetsyta, dokumentId: string, sidindex: number): Resultatsida => ({
  id: nyttId('rs'),
  dokumentId,
  sidindex,
  vridning: 0,
  stampel: yta.vattenstampel?.allaSidor ?? false,
  etikett: yta.textetikett?.allaSidor ?? false,
})

export function laggTillDokument(yta: Arbetsyta, d: Dokument): Andring {
  return { yta: { ...yta, dokument: [...yta.dokument, d] }, meddelande: texter.inlast(d.namn, d.sidantal) }
}

export function taBortDokument(yta: Arbetsyta, dokId: string): Andring {
  const d = dok(yta, dokId)
  if (!d) return ingen(yta)
  const kvar = yta.resultat.filter((r) => r.dokumentId !== dokId)
  return {
    yta: { ...yta, dokument: yta.dokument.filter((x) => x.id !== dokId), resultat: kvar },
    meddelande: texter.dokumentBorttaget(d.namn, yta.resultat.length - kvar.length),
  }
}

export function laggTillSida(yta: Arbetsyta, dokId: string, sidindex: number): Andring {
  const d = dok(yta, dokId)
  if (!d || sidindex < 0 || sidindex >= d.sidantal) return ingen(yta)
  const resultat = [...yta.resultat, ny(yta, dokId, sidindex)]
  return { yta: { ...yta, resultat }, meddelande: texter.sidaTillagd(sidindex + 1, d.namn, resultat.length) }
}

export function valjBortSida(yta: Arbetsyta, dokId: string, sidindex: number): Andring {
  const d = dok(yta, dokId)
  const kvar = yta.resultat.filter((r) => !(r.dokumentId === dokId && r.sidindex === sidindex))
  if (!d || kvar.length === yta.resultat.length) return ingen(yta)
  return { yta: { ...yta, resultat: kvar }, meddelande: texter.sidaBorttagen(sidindex + 1, d.namn) }
}

export function arVald(yta: Arbetsyta, dokId: string, sidindex: number): boolean {
  return yta.resultat.some((r) => r.dokumentId === dokId && r.sidindex === sidindex)
}

export function vaxlaSida(yta: Arbetsyta, dokId: string, sidindex: number): Andring {
  return arVald(yta, dokId, sidindex) ? valjBortSida(yta, dokId, sidindex) : laggTillSida(yta, dokId, sidindex)
}

export function laggTillAlla(yta: Arbetsyta, dokId: string): Andring {
  const d = dok(yta, dokId)
  if (!d) return ingen(yta)
  const nya = Array.from({ length: d.sidantal }, (_, i) => i)
    .filter((i) => !arVald(yta, dokId, i))
    .map((i) => ny(yta, dokId, i))
  if (nya.length === 0) return { yta, meddelande: texter.allaRedanValda }
  const resultat = [...yta.resultat, ...nya]
  return { yta: { ...yta, resultat }, meddelande: texter.allaTillagda(nya.length, d.namn, resultat.length) }
}

export function taBortAlla(yta: Arbetsyta, dokId: string): Andring {
  const d = dok(yta, dokId)
  const kvar = yta.resultat.filter((r) => r.dokumentId !== dokId)
  if (!d || kvar.length === yta.resultat.length) return ingen(yta)
  return { yta: { ...yta, resultat: kvar }, meddelande: texter.allaBorttagna(d.namn) }
}

function beskriv(yta: Arbetsyta, r: Resultatsida) {
  return { sida: r.sidindex + 1, namn: dok(yta, r.dokumentId)?.namn ?? '' }
}

export function flyttaSida(yta: Arbetsyta, resultatId: string, tillPlats: number): Andring {
  const fran = yta.resultat.findIndex((r) => r.id === resultatId)
  if (fran < 0) return ingen(yta)
  const till = Math.max(0, Math.min(yta.resultat.length - 1, Math.trunc(tillPlats)))
  if (till === fran) return ingen(yta)
  const resultat = [...yta.resultat]
  const [sida] = resultat.splice(fran, 1)
  resultat.splice(till, 0, sida)
  const { sida: n, namn } = beskriv(yta, sida)
  return { yta: { ...yta, resultat }, meddelande: texter.sidaFlyttad(n, namn, till + 1) }
}

export function flyttaSteg(yta: Arbetsyta, resultatId: string, riktning: -1 | 1): Andring {
  const fran = yta.resultat.findIndex((r) => r.id === resultatId)
  if (fran < 0) return ingen(yta)
  const till = fran + riktning
  if (till < 0) return { yta, meddelande: texter.redanForst }
  if (till >= yta.resultat.length) return { yta, meddelande: texter.redanSist }
  return flyttaSida(yta, resultatId, till)
}

export function taBortResultatsida(yta: Arbetsyta, resultatId: string): Andring {
  const r = yta.resultat.find((x) => x.id === resultatId)
  if (!r) return ingen(yta)
  const { sida, namn } = beskriv(yta, r)
  return { yta: { ...yta, resultat: yta.resultat.filter((x) => x.id !== resultatId) }, meddelande: texter.sidaBorttagen(sida, namn) }
}
