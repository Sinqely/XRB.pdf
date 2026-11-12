// Domänmodellen i minnet (docs/architecture.md 8.2; FEAT-001 technical-design.md §4).

export interface Dokument {
  readonly id: string
  /** Filnamn, med löpnummer om samma fil lästs in flera gånger, t.ex. "Beslut.pdf (2)". */
  readonly namn: string
  readonly bytes: Uint8Array
  readonly sidantal: number
  readonly storlekByte: number
}

export interface Resultatsida {
  /** Förekomstens id, unikt i fliken (t.ex. "rs-3"). */
  readonly id: string
  readonly dokumentId: string
  /** Sidans index i dokumentet, från 0. */
  readonly sidindex: number
}

export interface Sparval {
  /** Det namn användaren senast sparade med, eller null. */
  readonly filnamn: string | null
}

export interface Arbetsyta {
  readonly dokument: readonly Dokument[]
  readonly resultat: readonly Resultatsida[]
  readonly sparval: Sparval
}

export const tomArbetsyta: Arbetsyta = { dokument: [], resultat: [], sparval: { filnamn: null } }
