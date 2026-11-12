// Operationer för vattenstämpel och textetikett (FEAT-006, FEAT-007). Rena funktioner som arbetsyta.ts:
// varje operation ger en ny arbetsyta och ett meddelande till statusytan och ångra-historiken.
import type { Andring } from './arbetsyta'
import { forval } from './layout'
import { texter } from './texter'
import type { Arbetsyta, Placering, Vattenstampel } from './typer'

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
