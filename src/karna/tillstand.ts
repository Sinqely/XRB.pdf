// Tillståndslager med ångra och gör om (FEAT-005; FR-ALM-001..003). Oföränderliga versioner av arbetsytan,
// bara i minnet (FR-ALM-008). Varje version bär meddelandet som beskrev ändringen, så att ångra kan läsas upp.
import { tomArbetsyta, type Arbetsyta, type Dokument } from './typer'

export type Lyssnare = (arbetsyta: Arbetsyta) => void

interface Version {
  readonly yta: Arbetsyta
  readonly meddelande: string
}

export interface Tillstand {
  hamta(): Arbetsyta
  /** Ny version; `meddelande` beskriver ändringen för ångra-meddelandet. */
  andra(fn: (nu: Arbetsyta) => Arbetsyta, meddelande?: string | (() => string)): void
  /** Ändring som inte blir ett eget ångra-steg (t.ex. sparat filnamn): ersätter nuvarande version. */
  ersatt(fn: (nu: Arbetsyta) => Arbetsyta): void
  angra(): string | null
  gorOm(): string | null
  kanAngra(): boolean
  kanGorOm(): boolean
  /** Tömmer arbetsytan och historiken (FR-ALM-003). */
  borjaOm(): void
  /** Dokument-id som finns i någon version, så att resurser för övriga kan frigöras. */
  dokumentIHistoriken(): Set<string>
  lyssna(l: Lyssnare): () => void
  /** Versionerna, äldst först. */
  readonly historik: readonly Arbetsyta[]
}

export const MAX_HISTORIK = 200

export function skapaTillstand(start: Arbetsyta = tomArbetsyta): Tillstand {
  let versioner: Version[] = [{ yta: start, meddelande: '' }]
  let plats = 0
  const lyssnare = new Set<Lyssnare>()
  const meddela = () => lyssnare.forEach((l) => l(versioner[plats].yta))
  const t: Tillstand = {
    hamta: () => versioner[plats].yta,
    andra(fn, meddelande = '') {
      const nu = versioner[plats].yta
      const nasta = fn(nu)
      if (nasta === nu) return
      versioner = versioner.slice(0, plats + 1)
      versioner.push({ yta: Object.freeze(nasta), meddelande: typeof meddelande === 'function' ? meddelande() : meddelande })
      if (versioner.length > MAX_HISTORIK) versioner.shift()
      plats = versioner.length - 1
      meddela()
    },
    ersatt(fn) {
      const nasta = fn(versioner[plats].yta)
      if (nasta === versioner[plats].yta) return
      versioner[plats] = { ...versioner[plats], yta: Object.freeze(nasta) }
      meddela()
    },
    angra() {
      if (plats === 0) return null
      const m = versioner[plats].meddelande
      plats--
      meddela()
      return m
    },
    gorOm() {
      if (plats >= versioner.length - 1) return null
      plats++
      meddela()
      return versioner[plats].meddelande
    },
    kanAngra: () => plats > 0,
    kanGorOm: () => plats < versioner.length - 1,
    borjaOm() {
      versioner = [{ yta: tomArbetsyta, meddelande: '' }]
      plats = 0
      meddela()
    },
    dokumentIHistoriken() {
      return new Set(versioner.flatMap((v) => v.yta.dokument.map((d) => d.id)))
    },
    lyssna(l) {
      lyssnare.add(l)
      return () => lyssnare.delete(l)
    },
    get historik() {
      return versioner.slice(0, plats + 1).map((v) => v.yta)
    },
  }
  return t
}

/** Ger ett unikt visningsnamn med löpnummer när samma filnamn redan finns (FR-FIL-012). */
export function uniktNamn(filnamn: string, befintliga: readonly Dokument[]): string {
  const lika = befintliga.filter((d) => d.namn === filnamn || d.namn.startsWith(`${filnamn} (`)).length
  return lika === 0 ? filnamn : `${filnamn} (${lika + 1})`
}

let raknare = 0
/** Nytt id inom fliken. Räknare i stället för crypto.randomUUID, som kräver säker kontext. */
export function nyttId(prefix: string): string {
  raknare += 1
  return `${prefix}-${raknare}`
}
