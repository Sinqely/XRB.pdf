// Layoutmodellen (ADR-006, regel R4): det enda stället där stämpelns och etikettens ruta på en sida räknas ut.
// Förhandsvisningen skalar rutan till skärmen och exporten skriver den i PDF; båda anropar bara de här funktionerna.
// Allt räknas i PDF-punkter i sidans visade riktning (efter /Rotate och vridning), med origo i övre vänstra hörnet.
import type { Ankare, Placering, Vattenstampel } from './typer'

/** Punkter per millimeter. */
export const MM = 72 / 25.4
/** Säkerhetsmarginalen i förhandsvisningen (FR-PLC-009). */
export const MARGINAL_MM = 5
/** Förvalt avstånd till kanten (FR-PLC-005, FR-PLC-006, FR-PLC-007). */
export const FORVALT_AVSTAND_MM = 10
export const MAX_AVSTAND_MM = 50

export interface Matt {
  readonly bredd: number
  readonly hojd: number
}

export interface Ruta {
  readonly x: number
  readonly y: number
  readonly b: number
  readonly h: number
}

const hoger = (a: Ankare) => a === 'ovre-hoger' || a === 'nedre-hoger'
const vanster = (a: Ankare) => a === 'ovre-vanster' || a === 'nedre-vanster'
const nedre = (a: Ankare) => a === 'nedre-vanster' || a === 'sidfot' || a === 'nedre-hoger'

/** Färdig placering med valt avstånd (FR-PLC-004, FR-PLC-005). I sidhuvud och sidfot är objektet centrerat. */
export function forval(ankare: Ankare, avstandMm = FORVALT_AVSTAND_MM): Placering {
  const a = Math.max(0, Math.min(MAX_AVSTAND_MM, avstandMm))
  return { ankare, dxMm: ankare === 'sidhuvud' || ankare === 'sidfot' ? 0 : a, dyMm: a, egen: false }
}

/** Avståndet som visas i fältet "Avstånd till kant": kortaste avståndet till referenskanterna. */
export function avstand(p: Placering): number {
  return p.ankare === 'sidhuvud' || p.ankare === 'sidfot' ? p.dyMm : Math.min(p.dxMm, p.dyMm)
}

/** Objektets mått krymps med bibehållna proportioner om det inte ryms på sidan (FR-PLC-011). */
export function rymsPa(obj: Matt, sida: Matt): Matt {
  const f = Math.min(1, sida.bredd / obj.bredd, sida.hojd / obj.hojd)
  return { bredd: obj.bredd * f, hojd: obj.hojd * f }
}

/**
 * Objektets ruta på en sida: avståndet till placeringens referenskant eller referenshörn är detsamma
 * på alla sidor (FR-PLC-008), och objektet hålls innanför sidkanten (FR-PLC-011).
 */
export function ruta(sida: Matt, objekt: Matt, p: Placering): Ruta {
  const { bredd: b, hojd: h } = rymsPa(objekt, sida)
  const dx = p.dxMm * MM
  const dy = p.dyMm * MM
  const x = hoger(p.ankare) ? sida.bredd - dx - b : vanster(p.ankare) ? dx : (sida.bredd - b) / 2 + dx
  const y = nedre(p.ankare) ? sida.hojd - dy - h : dy
  return { x: klamp(x, 0, sida.bredd - b), y: klamp(y, 0, sida.hojd - h), b, h }
}

/** Omvänt: placering med samma ankare för en ruta på sidan (dra, piltangenter, storleksändring). */
export function placeringFranRuta(sida: Matt, r: Ruta, ankare: Ankare): Placering {
  const x = klamp(r.x, 0, Math.max(0, sida.bredd - r.b))
  const y = klamp(r.y, 0, Math.max(0, sida.hojd - r.h))
  const dx = hoger(ankare) ? sida.bredd - x - r.b : vanster(ankare) ? x : x - (sida.bredd - r.b) / 2
  const dy = nedre(ankare) ? sida.hojd - y - r.h : y
  return { ankare, dxMm: avrunda(dx / MM), dyMm: avrunda(dy / MM), egen: true }
}

/** Flyttar objektet i visad riktning på den aktiva sidan, och håller det innanför kanten (FR-PLC-003, FR-PLC-011). */
export function flytta(sida: Matt, objekt: Matt, p: Placering, hogerMm: number, nedMm: number): Placering {
  const r = ruta(sida, objekt, p)
  return placeringFranRuta(sida, { ...r, x: r.x + hogerMm * MM, y: r.y + nedMm * MM }, p.ankare)
}

/** Ligger rutan inom säkerhetsmarginalen (FR-PLC-010)? */
export function inomMarginal(sida: Matt, r: Ruta): boolean {
  const m = MARGINAL_MM * MM - 1e-6
  return r.x < m || r.y < m || r.x + r.b > sida.bredd - m || r.y + r.h > sida.hojd - m
}

/** Överlappar två rutor (FR-PLC-012)? */
export function overlappar(a: Ruta, b: Ruta): boolean {
  return a.x < b.x + b.b && b.x < a.x + a.b && a.y < b.y + b.h && b.y < a.y + a.h
}

/** Vattenstämpelns mått i punkter; höjden följer bildens proportioner (FR-STA-005, FR-STA-006). */
export function stampelMatt(s: Pick<Vattenstampel, 'breddMm' | 'pxBredd' | 'pxHojd'>): Matt {
  const bredd = s.breddMm * MM
  return { bredd, hojd: (bredd * s.pxHojd) / s.pxBredd }
}

export const MIN_STAMPEL_MM = 5
export const FORVALD_STAMPEL_MM = 40

/** Största bredd i mm som ryms på sidan med bildens proportioner. */
export function storstaStampelMm(sida: Matt, pxBredd: number, pxHojd: number): number {
  return Math.floor(Math.min(sida.bredd, (sida.hojd * pxBredd) / pxHojd) / MM)
}

/** Förvald bredd för en ny bild: 40 mm, eller mindre om bilden blir högre än sidan. */
export function forvaldStampelMm(sida: Matt | null, pxBredd: number, pxHojd: number): number {
  return sida ? Math.max(MIN_STAMPEL_MM, Math.min(FORVALD_STAMPEL_MM, storstaStampelMm(sida, pxBredd, pxHojd))) : FORVALD_STAMPEL_MM
}

function klamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), Math.max(min, max))
}

function avrunda(mm: number) {
  return Math.round(mm * 100) / 100
}
