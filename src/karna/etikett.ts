// Textetikettens mått (ADR-006, ADR-007): samma beräkning i förhandsvisningen och i exporten, med samma
// typsnittsfil och fontkit. Kerning och ligaturer är avstängda i båda, så att varje tecken blir en glyf
// med sin egen bredd och förhandsvisningen stämmer med filen (FR-FHV-006, FR-SPA-008).
import type { Matt } from './layout'
import type { Textetikett } from './typer'

export const MAX_TECKEN = 200
export const MIN_STORLEK_PT = 6
export const MAX_STORLEK_PT = 72
/** Inre marginal runt texten när etiketten har bakgrund, i andelar av textstorleken. */
export const BAKGRUND_MARGINAL = 0.3

/** OpenType-funktioner som stängs av i både fontkit (export) och CSS (förhandsvisning). */
export const TEXTFUNKTIONER = { kern: false, liga: false, clig: false, calt: false, dlig: false } as const

/** Det som behövs av ett fontkit-typsnitt; både huvudtråden och bygg-arbetstråden skickar in sitt. */
export interface Glyfkalla {
  readonly unitsPerEm: number
  readonly ascent: number
  readonly descent: number
  hasGlyphForCodePoint(cp: number): boolean
  layout(text: string, funktioner?: Record<string, boolean>): { glyphs: readonly { advanceWidth: number }[] }
}

export interface Etikettmatt extends Matt {
  /** Inre marginal (punkter) mellan rutans kant och texten. */
  readonly marginal: number
  /** Baslinjens avstånd från rutans överkant (punkter). */
  readonly baslinje: number
  readonly textbredd: number
}

/** Etikettens ruta: textens bredd och typsnittets höjd, plus marginal när den har bakgrund. */
export function etikettMatt(font: Glyfkalla, e: Pick<Textetikett, 'text' | 'storlekPt' | 'bakgrund'>): Etikettmatt {
  const skala = e.storlekPt / font.unitsPerEm
  const textbredd = font.layout(e.text, TEXTFUNKTIONER).glyphs.reduce((s, g) => s + g.advanceWidth, 0) * skala
  const over = font.ascent * skala
  const under = -font.descent * skala
  const marginal = e.bakgrund ? e.storlekPt * BAKGRUND_MARGINAL : 0
  return { bredd: textbredd + 2 * marginal, hojd: over + under + 2 * marginal, marginal, baslinje: marginal + over, textbredd }
}

/** Tecken i texten som typsnittet saknar (FR-TXT-013), var och ett en gång, i textens ordning. */
export function saknadeTecken(font: Pick<Glyfkalla, 'hasGlyphForCodePoint'>, text: string): string[] {
  const ut: string[] = []
  for (const t of text) {
    if (/\s/.test(t) || ut.includes(t)) continue
    if (!font.hasGlyphForCodePoint(t.codePointAt(0)!)) ut.push(t)
  }
  return ut
}

/** Texten på en rad och högst 200 tecken (FR-TXT-001, FR-TXT-002). */
export function stadaEtikettText(text: string): string {
  return [...text.replace(/[\r\n\t]+/g, ' ')].slice(0, MAX_TECKEN).join('')
}
