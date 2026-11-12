// Domänmodellen i minnet (docs/architecture.md 8.2; per funktion i docs/features/*/technical-design.md).

export interface Dokument {
  readonly id: string
  /** Filnamn, med löpnummer om samma fil lästs in flera gånger, t.ex. "Beslut.pdf (2)". */
  readonly namn: string
  readonly bytes: Uint8Array
  readonly sidantal: number
  readonly storlekByte: number
}

export type Vridning = 0 | 90 | 180 | 270

export interface Resultatsida {
  /** Förekomstens id, unikt i fliken (t.ex. "rs-3"). */
  readonly id: string
  readonly dokumentId: string
  /** Sidans index i dokumentet, från 0. */
  readonly sidindex: number
  /** Extra vridning medurs utöver sidans egen (FR-SID-010). */
  readonly vridning: Vridning
  /** Vattenstämpeln ligger på sidan (FR-STA-008). */
  readonly stampel: boolean
  /** Textetiketten ligger på sidan (FR-TXT-010). */
  readonly etikett: boolean
}

/** De sex färdiga placeringarna (FR-PLC-004). */
export type Ankare = 'ovre-vanster' | 'sidhuvud' | 'ovre-hoger' | 'nedre-vanster' | 'sidfot' | 'nedre-hoger'

/**
 * Placering som avstånd från ett ankare (hörn eller kantmitt), så att avståndet till
 * referenskanten blir detsamma på sidor med olika storlek (FR-PLC-008). För sidhuvud och sidfot
 * är dx förskjutningen från sidans mitt. Egen placering = dra eller piltangenter (FR-PLC-002, FR-PLC-003).
 */
export interface Placering {
  readonly ankare: Ankare
  readonly dxMm: number
  readonly dyMm: number
  readonly egen: boolean
}

export interface Vattenstampel {
  readonly namn: string
  readonly bild: Uint8Array
  readonly typ: 'png' | 'jpeg'
  readonly pxBredd: number
  readonly pxHojd: number
  /** Stämpelns bredd på sidan; höjden följer bildens proportioner. */
  readonly breddMm: number
  /** 0–100 (FR-STA-004). */
  readonly opacitet: number
  readonly placering: Placering
  readonly allaSidor: boolean
}

/** Etikettens typsnitt (ADR-007): Carlito, Tinos (seriffer) och Cousine (fast teckenbredd). */
export type Typsnitt = 'sans' | 'serif' | 'mono'

export interface Textetikett {
  readonly text: string
  readonly storlekPt: number
  /** "#rrggbb" */
  readonly farg: string
  readonly bakgrund: string | null
  readonly typsnitt: Typsnitt
  readonly fet: boolean
  readonly kursiv: boolean
  readonly placering: Placering
  readonly allaSidor: boolean
}

export type Format = 'pdfa' | 'pdf'

export interface Metadata {
  readonly titel: string
  readonly forfattare: string
  readonly amne: string
  readonly nyckelord: string
}

/** Användarens val för ett dokument i panelen Dold information (FR-DOL-006, -007, -009, -011). Förval: allt behålls. */
export interface Rensning {
  /** Ny text per kommentarnyckel ("k:<sidindex>:<plats>"). */
  readonly kommentartext?: Readonly<Record<string, string>>
  /** Kommentarer och bilagor som tas bort, per nyckel ("k:…" eller "b:<plats>"). */
  readonly taBort?: readonly string[]
  /** Formulärfält som tas bort, per fullständigt namn. */
  readonly taBortFalt?: readonly string[]
}

/** Valen i panelen Dold information (FEAT-008). */
export interface DoldVal {
  /** Resultatets titel, författare, ämne och nyckelord; null = förifyllt från första sidans dokument (FR-DOL-003). */
  readonly metadata: Metadata | null
  /** Per dokument-id. */
  readonly rensning: Readonly<Record<string, Rensning>>
}

export interface Sparval {
  /** Det namn användaren senast sparade med, eller null. */
  readonly filnamn: string | null
  readonly format: Format
  readonly dold: DoldVal
}

export interface Arbetsyta {
  readonly dokument: readonly Dokument[]
  readonly resultat: readonly Resultatsida[]
  readonly vattenstampel: Vattenstampel | null
  readonly textetikett: Textetikett | null
  readonly sparval: Sparval
}

export const tomDoldVal: DoldVal = { metadata: null, rensning: {} }

export const tomArbetsyta: Arbetsyta = {
  dokument: [],
  resultat: [],
  vattenstampel: null,
  textetikett: null,
  sparval: { filnamn: null, format: 'pdfa', dold: tomDoldVal },
}
