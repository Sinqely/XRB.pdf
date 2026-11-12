// Domänmodellen i minnet (docs/architecture.md 8.2). Skelett: Dokument och Resultatsida.

export interface Dokument {
  readonly id: string
  /** Filnamn, med löpnummer om samma fil lästs in flera gånger, t.ex. "Beslut.pdf (2)". */
  readonly namn: string
  readonly bytes: Uint8Array
  readonly sidantal: number
  /** Miniatyr av första sidan som blob-adress, eller null medan den ritas. */
  readonly forstaMiniatyr: string | null
}

export interface Resultatsida {
  readonly dokumentId: string
  /** Sidans index i dokumentet, från 0. */
  readonly sidindex: number
}

export interface Arbetsyta {
  readonly dokument: readonly Dokument[]
  readonly resultat: readonly Resultatsida[]
}

export const tomArbetsyta: Arbetsyta = { dokument: [], resultat: [] }
