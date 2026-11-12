// Tillståndslager: oföränderliga versioner av arbetsytan och en historik
// som ångra/gör om (FEAT-005) bygger på. Bara i minnet (FR-ALM-008).
import { tomArbetsyta, type Arbetsyta, type Dokument } from './typer'

export type Lyssnare = (arbetsyta: Arbetsyta) => void

export interface Tillstand {
  hamta(): Arbetsyta
  andra(fn: (nu: Arbetsyta) => Arbetsyta): void
  lyssna(l: Lyssnare): () => void
  /** Antal sparade versioner, för ångra. */
  readonly historik: readonly Arbetsyta[]
}

export function skapaTillstand(start: Arbetsyta = tomArbetsyta): Tillstand {
  const historik: Arbetsyta[] = [start]
  const lyssnare = new Set<Lyssnare>()
  return {
    hamta: () => historik[historik.length - 1],
    andra(fn) {
      const nasta = fn(historik[historik.length - 1])
      if (nasta === historik[historik.length - 1]) return
      historik.push(Object.freeze(nasta))
      lyssnare.forEach((l) => l(nasta))
    },
    lyssna(l) {
      lyssnare.add(l)
      return () => lyssnare.delete(l)
    },
    historik,
  }
}

/** Ger ett unikt visningsnamn med löpnummer när samma filnamn redan finns (FR-FIL-012). */
export function uniktNamn(filnamn: string, befintliga: readonly Dokument[]): string {
  const lika = befintliga.filter((d) => d.namn === filnamn || d.namn.startsWith(`${filnamn} (`)).length
  return lika === 0 ? filnamn : `${filnamn} (${lika + 1})`
}

/** Lägger till ett dokument och, i skelettet, alla dess sidor sist i resultatet. */
export function laggTillDokument(nu: Arbetsyta, dok: Dokument): Arbetsyta {
  const sidor = Array.from({ length: dok.sidantal }, (_, i) => ({ dokumentId: dok.id, sidindex: i }))
  return { dokument: [...nu.dokument, dok], resultat: [...nu.resultat, ...sidor] }
}

export function uppdateraDokument(nu: Arbetsyta, id: string, andring: Partial<Dokument>): Arbetsyta {
  return { ...nu, dokument: nu.dokument.map((d) => (d.id === id ? { ...d, ...andring } : d)) }
}
