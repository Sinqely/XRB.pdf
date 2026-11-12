// Operationer för vattenstämpel och textetikett (FEAT-006, FEAT-007). Rena funktioner som arbetsyta.ts:
// varje operation ger en ny arbetsyta och ett meddelande till statusytan och ångra-historiken.
import type { Andring } from './arbetsyta'
import { forval } from './layout'
import { texter } from './texter'
import type { Arbetsyta, Placering, Textetikett, Vattenstampel } from './typer'
import { MAX_STORLEK_PT, MIN_STORLEK_PT, stadaEtikettText } from './etikett'
import { etikettfarger } from './etikett-tokens'

export type Objekt = 'stampel' | 'etikett'

export interface Stampelbild {
  readonly namn: string
  readonly bild: Uint8Array
  readonly typ: 'png' | 'jpeg'
  readonly pxBredd: number
  readonly pxHojd: number
}

const ingen = (yta: Arbetsyta): Andring => ({ yta, meddelande: '' })
const nyckel = (o: Objekt): 'vattenstampel' | 'textetikett' => (o === 'stampel' ? 'vattenstampel' : 'textetikett')

/**
 * Lägger till eller byter bild. En ny stämpel får opacitet 100 % (FR-STA-003), nedre högra hörnet
 * med 10 mm (FR-PLC-007) och ligger på alla sidor. Byte behåller opacitet, bredd, placering och sidval (FR-STA-009).
 */
export function sattStampelbild(yta: Arbetsyta, b: Stampelbild, forvaldBreddMm: number): Andring {
  const fore = yta.vattenstampel
  if (fore) {
    return { yta: { ...yta, vattenstampel: { ...fore, ...b } }, meddelande: texter.stampelBytt(b.namn) }
  }
  const vattenstampel: Vattenstampel = {
    ...b,
    breddMm: forvaldBreddMm,
    opacitet: 100,
    placering: forval('nedre-hoger'),
    allaSidor: true,
  }
  return {
    yta: { ...yta, vattenstampel, resultat: yta.resultat.map((r) => ({ ...r, stampel: true })) },
    meddelande: texter.stampelTillagd(b.namn),
  }
}

/** Tar bort stämpeln från alla sidor (FR-STA-010). */
export function taBortStampel(yta: Arbetsyta): Andring {
  if (!yta.vattenstampel) return ingen(yta)
  return { yta: { ...yta, vattenstampel: null, resultat: yta.resultat.map((r) => ({ ...r, stampel: false })) }, meddelande: texter.stampelBorttagen }
}

/** Opacitet 0–100 % (FR-STA-004). */
export function sattOpacitet(yta: Arbetsyta, opacitet: number): Andring {
  const s = yta.vattenstampel
  if (!s || !Number.isFinite(opacitet)) return ingen(yta)
  const v = Math.round(Math.max(0, Math.min(100, opacitet)))
  if (v === s.opacitet) return ingen(yta)
  return { yta: { ...yta, vattenstampel: { ...s, opacitet: v } }, meddelande: texter.opacitetSatt(v) }
}

/** Stämpelns bredd i mm; höjden följer proportionerna (FR-STA-005, FR-STA-006). Anroparen begränsar till sidan. */
export function sattStampelbredd(yta: Arbetsyta, breddMm: number, placering?: Placering): Andring {
  const s = yta.vattenstampel
  if (!s || !Number.isFinite(breddMm)) return ingen(yta)
  const v = Math.round(breddMm * 10) / 10
  if (v === s.breddMm && !placering) return ingen(yta)
  return { yta: { ...yta, vattenstampel: { ...s, breddMm: v, placering: placering ?? s.placering } }, meddelande: texter.storlekSatt(v) }
}

/** Ny placering för stämpeln eller etiketten (FR-PLC-002..005). */
export function sattPlacering(yta: Arbetsyta, o: Objekt, placering: Placering): Andring {
  const k = nyckel(o)
  const obj = yta[k]
  if (!obj) return ingen(yta)
  const p = obj.placering
  if (p.ankare === placering.ankare && p.dxMm === placering.dxMm && p.dyMm === placering.dyMm && p.egen === placering.egen) return ingen(yta)
  const meddelande = placering.egen ? texter.placeringEgen(o) : texter.placeringForval(o, texter.ankare[placering.ankare])
  return { yta: { ...yta, [k]: { ...obj, placering } }, meddelande }
}

/**
 * "Alla sidor" (FR-STA-007, FR-TXT-...): på lägger objektet på alla sidor och på nya sidor (FR-STA-012);
 * av låter objektet ligga kvar bara på den aktiva sidan, så att användaren sedan kan välja sidor.
 */
export function sattAllaSidor(yta: Arbetsyta, o: Objekt, alla: boolean, aktivId: string | null): Andring {
  const k = nyckel(o)
  const obj = yta[k]
  if (!obj) return ingen(yta)
  const resultat = yta.resultat.map((r) => ({ ...r, [o]: alla || r.id === aktivId }))
  const plats = yta.resultat.findIndex((r) => r.id === aktivId)
  return {
    yta: { ...yta, [k]: { ...obj, allaSidor: alla }, resultat },
    meddelande: alla ? texter.allaSidorPa(o) : texter.allaSidorAv(o, plats + 1),
  }
}

/** Lägger till eller tar bort objektet på en sida (FR-STA-008). Tas det bort gäller inte längre "alla sidor". */
export function vaxlaPaSida(yta: Arbetsyta, o: Objekt, resultatId: string): Andring {
  const k = nyckel(o)
  const obj = yta[k]
  const plats = yta.resultat.findIndex((r) => r.id === resultatId)
  if (!obj || plats < 0) return ingen(yta)
  const pa = !yta.resultat[plats]![o]
  const resultat = yta.resultat.map((r) => (r.id === resultatId ? { ...r, [o]: pa } : r))
  return {
    yta: { ...yta, [k]: { ...obj, allaSidor: pa ? obj.allaSidor : false }, resultat },
    meddelande: pa ? texter.paSida(o, plats + 1) : texter.avSida(o, plats + 1),
  }
}

/** Platserna (från 1) där objektet ligger. */
export function sidorMed(yta: Arbetsyta, o: Objekt): number[] {
  return yta.resultat.flatMap((r, i) => (r[o] ? [i + 1] : []))
}

/** Förval för en ny etikett (FR-TXT-003, FR-PLC-006): 12 pt, svart, ingen bakgrund, Carlito, sidhuvudet 10 mm, alla sidor. */
export const nyEtikett: Textetikett = {
  text: '',
  storlekPt: 12,
  farg: etikettfarger.svart,
  bakgrund: null,
  typsnitt: 'sans',
  fet: false,
  kursiv: false,
  placering: forval('sidhuvud'),
  allaSidor: true,
}

export type Etikettandring = Partial<Pick<Textetikett, 'text' | 'storlekPt' | 'farg' | 'bakgrund' | 'typsnitt' | 'fet' | 'kursiv'>>

/**
 * Ändrar etiketten. Den första ändringen skapar etiketten med förvalen och lägger den på alla sidor.
 * Texten hålls på en rad och högst 200 tecken; storleken 6–72 pt (FR-TXT-001..008).
 */
export function andraEtikett(yta: Arbetsyta, a: Etikettandring, meddelande = texter.etikettAndrad): Andring {
  const fore = yta.textetikett
  const bas = fore ?? nyEtikett
  const ny: Textetikett = {
    ...bas,
    ...a,
    text: a.text === undefined ? bas.text : stadaEtikettText(a.text),
    storlekPt: a.storlekPt === undefined || !Number.isFinite(a.storlekPt) ? bas.storlekPt : Math.round(Math.max(MIN_STORLEK_PT, Math.min(MAX_STORLEK_PT, a.storlekPt)) * 10) / 10,
  }
  if (fore && (Object.keys(ny) as (keyof Textetikett)[]).every((k) => ny[k] === fore[k])) return ingen(yta)
  // Ett tomt textfält skapar ingen etikett; andra val (färg, storlek …) sparas så att de gäller när texten skrivs.
  if (!fore && a.text !== undefined && ny.text === '') return ingen(yta)
  return {
    yta: { ...yta, textetikett: ny, resultat: fore ? yta.resultat : yta.resultat.map((r) => ({ ...r, etikett: true })) },
    meddelande: fore || ny.text === '' ? meddelande : texter.etikettTillagd,
  }
}

/** Tar bort etiketten från alla sidor och glömmer inställningarna (FR-TXT-011). */
export function taBortEtikett(yta: Arbetsyta): Andring {
  if (!yta.textetikett) return ingen(yta)
  return { yta: { ...yta, textetikett: null, resultat: yta.resultat.map((r) => ({ ...r, etikett: false })) }, meddelande: texter.etikettBorttagen }
}

/** Ligger en synlig etikett på sidan? En tom text ger ingen etikett (FR-TXT-012). */
export function etikettSyns(yta: Arbetsyta, resultatId: string): boolean {
  const e = yta.textetikett
  return !!e && e.text.trim() !== '' && !!yta.resultat.find((r) => r.id === resultatId)?.etikett
}
