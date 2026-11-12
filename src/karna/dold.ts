// Panelen Dold information (FEAT-008): vad granskningen hittade, filtrerat på resultatets sidor, och
// operationerna för användarens val. Rena funktioner; granskningen själv görs i bygg-arbetstråden (src/bygg/dold.ts).
import type { Andring } from './arbetsyta'
import { texter } from './texter'
import type { Arbetsyta, Metadata, Rensning } from './typer'

export interface Dokumentinfo {
  readonly titel: string
  readonly forfattare: string
  readonly amne: string
  readonly nyckelord: string
  /** Programmet som skapade filen (Creator), annars det som skrev den (Producer). */
  readonly program: string
  /** ISO-datum eller tom sträng. */
  readonly skapad: string
  readonly andrad: string
}

export interface Kommentarpost {
  /** Stabil nyckel i dokumentet: "k:<sidindex>:<plats i Annots>". */
  readonly nyckel: string
  readonly sidindex: number
  /** PDF-typen, t.ex. "Text", "FreeText", "Highlight". */
  readonly typ: string
  readonly text: string
  readonly forfattare: string
}

export interface Bilagepost {
  /** "b:<plats>" för bilagor på dokumentnivå, "k:<sidindex>:<plats>" för bilagor som kommentar på en sida. */
  readonly nyckel: string
  readonly namn: string
  /** Storlek i byte, null om filen inte anger den. */
  readonly storlek: number | null
  /** Sidan för en bilaga som kommentar, null för dokumentnivå. */
  readonly sidindex: number | null
}

export interface Faltpost {
  /** Fältets fullständiga namn, unikt i dokumentet; nyckel i valen. */
  readonly namn: string
  /** Sidor (index från 0) där fältet syns. */
  readonly sidor: readonly number[]
  readonly varde: string
}

export type Skriptkod = 'oppna' | 'dokumentskript' | 'dokumenthandelse' | 'sida' | 'kommentar' | 'falt' | 'starta' | 'skicka' | 'programdata'

export interface Skriptpost {
  readonly kod: Skriptkod
  /** Sidan, null för hela dokumentet. */
  readonly sidindex: number | null
}

export interface Granskning {
  readonly info: Dokumentinfo
  readonly kommentarer: readonly Kommentarpost[]
  readonly bilagor: readonly Bilagepost[]
  readonly falt: readonly Faltpost[]
  /** Skript, andra aktiva element och programdata; tas alltid bort (FR-DOL-012). */
  readonly skript: readonly Skriptpost[]
}

export interface Rad<T> {
  readonly post: T
  /** Platser i resultatet (från 1) där posten finns; tom för det som gäller hela dokumentet. */
  readonly platser: readonly number[]
  readonly borttagen: boolean
}

export interface Dokumentdel {
  readonly dokumentId: string
  readonly namn: string
  readonly info: Dokumentinfo
  readonly kommentarer: readonly (Rad<Kommentarpost> & { readonly text: string })[]
  readonly bilagor: readonly Rad<Bilagepost>[]
  readonly falt: readonly Rad<Faltpost>[]
  readonly skript: readonly (Skriptpost & { readonly platser: readonly number[] })[]
}

/** Dokumenten som har sidor i resultatet, i den ordning de först förekommer (FR-DOL-001). */
export function berordaDokument(yta: Arbetsyta): string[] {
  return [...new Set(yta.resultat.map((r) => r.dokumentId))]
}

/** Resultatets uppgifter: användarens egna, annars första sidans dokument (FR-DOL-003). */
export function resultatetsUppgifter(yta: Arbetsyta, granskningar: Readonly<Record<string, Granskning>>): Metadata {
  if (yta.sparval.dold.metadata) return yta.sparval.dold.metadata
  const g = granskningar[yta.resultat[0]?.dokumentId ?? '']
  return g ? { titel: g.info.titel, forfattare: g.info.forfattare, amne: g.info.amne, nyckelord: g.info.nyckelord } : { titel: '', forfattare: '', amne: '', nyckelord: '' }
}

/** Det panelen visar för varje berört dokument: bara det som hör till resultatets sidor (FR-DOL-005, -011, -013). */
export function panelinnehall(yta: Arbetsyta, granskningar: Readonly<Record<string, Granskning>>): Dokumentdel[] {
  return berordaDokument(yta).flatMap((id) => {
    const g = granskningar[id]
    const d = yta.dokument.find((x) => x.id === id)
    if (!g || !d) return []
    const r: Rensning = yta.sparval.dold.rensning[id] ?? {}
    const bort = new Set(r.taBort ?? [])
    const bortFalt = new Set(r.taBortFalt ?? [])
    const platser = (sidindex: readonly number[]) =>
      yta.resultat.flatMap((x, i) => (x.dokumentId === id && sidindex.includes(x.sidindex) ? [i + 1] : []))
    return [
      {
        dokumentId: id,
        namn: d.namn,
        info: g.info,
        kommentarer: g.kommentarer
          .map((k) => ({ post: k, platser: platser([k.sidindex]), borttagen: bort.has(k.nyckel), text: r.kommentartext?.[k.nyckel] ?? k.text }))
          .filter((k) => k.platser.length > 0),
        bilagor: g.bilagor
          .map((b) => ({ post: b, platser: b.sidindex === null ? [] : platser([b.sidindex]), borttagen: bort.has(b.nyckel) }))
          .filter((b) => b.post.sidindex === null || b.platser.length > 0),
        falt: g.falt.map((f) => ({ post: f, platser: platser(f.sidor), borttagen: bortFalt.has(f.namn) })).filter((f) => f.platser.length > 0),
        skript: g.skript
          .map((s) => ({ ...s, platser: s.sidindex === null ? [] : platser([s.sidindex]) }))
          .filter((s) => s.sidindex === null || s.platser.length > 0),
      },
    ]
  })
}

/** Sant när inget dokument har dold information utöver metadata (FR-DOL-014). */
export function ingenDoldInformation(delar: readonly Dokumentdel[]): boolean {
  return delar.every((d) => !d.kommentarer.length && !d.bilagor.length && !d.falt.length && !d.skript.length)
}

const medRensning = (yta: Arbetsyta, id: string, fn: (r: Rensning) => Rensning): Arbetsyta => ({
  ...yta,
  sparval: { ...yta.sparval, dold: { ...yta.sparval.dold, rensning: { ...yta.sparval.dold.rensning, [id]: fn(yta.sparval.dold.rensning[id] ?? {}) } } },
})
const vaxla = (lista: readonly string[] | undefined, v: string, pa: boolean) => {
  const utan = (lista ?? []).filter((x) => x !== v)
  return pa ? [...utan, v] : utan
}

/** Ändrar en av resultatets uppgifter; de övriga följer med från förifyllningen (FR-DOL-004). */
export function sattUppgift(yta: Arbetsyta, forifyllt: Metadata, falt: keyof Metadata, varde: string): Andring {
  const nu = yta.sparval.dold.metadata ?? forifyllt
  if (nu[falt] === varde && yta.sparval.dold.metadata) return { yta, meddelande: '' }
  return { yta: { ...yta, sparval: { ...yta.sparval, dold: { ...yta.sparval.dold, metadata: { ...nu, [falt]: varde } } } }, meddelande: texter.uppgiftAndrad(texter.uppgiftNamn[falt]) }
}

/** Ny text i en kommentar (FR-DOL-006). Samma text som originalet tar bort ändringen. */
export function sattKommentartext(yta: Arbetsyta, dokumentId: string, nyckel: string, text: string, original: string): Andring {
  return {
    yta: medRensning(yta, dokumentId, (r) => {
      const ovriga = Object.fromEntries(Object.entries(r.kommentartext ?? {}).filter(([k]) => k !== nyckel))
      return { ...r, kommentartext: text === original ? ovriga : { ...ovriga, [nyckel]: text } }
    }),
    meddelande: texter.kommentarAndrad,
  }
}

/** Tar bort eller behåller en kommentar eller bilaga (FR-DOL-007, FR-DOL-009). */
export function sattBorttagen(yta: Arbetsyta, dokumentId: string, nyckel: string, bort: boolean, vad: 'kommentar' | 'bilaga'): Andring {
  return { yta: medRensning(yta, dokumentId, (r) => ({ ...r, taBort: vaxla(r.taBort, nyckel, bort) })), meddelande: texter.doldVal(vad, bort) }
}

/** Tar bort eller behåller ett formulärfält (FR-DOL-011). */
export function sattFaltBorttaget(yta: Arbetsyta, dokumentId: string, namn: string, bort: boolean): Andring {
  return { yta: medRensning(yta, dokumentId, (r) => ({ ...r, taBortFalt: vaxla(r.taBortFalt, namn, bort) })), meddelande: texter.doldVal('falt', bort) }
}
