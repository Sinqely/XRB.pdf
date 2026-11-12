// Överlägget i förhandsvisningen (FEAT-006, FEAT-007): säkerhetsmarginal, vattenstämpel och textetikett,
// ritade där layoutmodellen säger (R4). Flytta med mus eller piltangenter, ändra storlek med hörnen.
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import type { Andring } from '../karna/arbetsyta'
import { flytta, MARGINAL_MM, MIN_STAMPEL_MM, MM, placeringFranRuta, ruta, stampelMatt, storstaStampelMm, type Matt, type Ruta } from '../karna/layout'
import { sattPlacering, sattStampelbredd } from '../karna/markning'
import { texter } from '../karna/texter'
import type { Arbetsyta, Vattenstampel } from '../karna/typer'

/** Blob-adress för stämpelns bild, frigörs när bilden byts (bara i minnet, FR-ALM-008). */
export function useBildUrl(s: Vattenstampel | null): string | null {
  const bild = s?.bild
  const typ = s?.typ
  const url = useMemo(() => (bild ? URL.createObjectURL(new Blob([bild as BlobPart], { type: `image/${typ}` })) : null), [bild, typ])
  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url)
  }, [url])
  return url
}

type Horn = 'nw' | 'ne' | 'sw' | 'se'
type Drag = { typ: 'flytt' } | { typ: 'storlek'; horn: Horn }

interface Props {
  yta: Arbetsyta
  matt: Matt
  skala: number
  resultatId: string
  andra: (fn: (nu: Arbetsyta) => Andring) => void
}

export function Overlagg({ yta, matt, skala, resultatId, andra }: Props) {
  const sida = yta.resultat.find((r) => r.id === resultatId)
  const s = yta.vattenstampel
  const url = useBildUrl(s)
  const [tillf, sattTillf] = useState<Ruta | null>(null)
  const start = useRef<{ x: number; y: number; r: Ruta; drag: Drag } | null>(null)
  if (!sida || (!s && !yta.textetikett)) return null

  const m = MARGINAL_MM * MM * skala
  const visaStampel = !!(s && sida.stampel)
  const r = visaStampel ? (tillf ?? ruta(matt, stampelMatt(s!), s!.placering)) : null

  const ner = (e: PointerEvent, drag: Drag) => {
    if (!r || e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    ;(e.currentTarget as HTMLElement).closest<HTMLElement>('.overlaggsobjekt')?.focus()
    start.current = { x: e.clientX, y: e.clientY, r, drag }
  }
  const rorelse = (e: PointerEvent) => {
    const st = start.current
    if (!st || !s) return
    const dx = (e.clientX - st.x) / skala
    const dy = (e.clientY - st.y) / skala
    if (st.drag.typ === 'flytt') {
      const x = Math.min(Math.max(st.r.x + dx, 0), matt.bredd - st.r.b)
      const y = Math.min(Math.max(st.r.y + dy, 0), matt.hojd - st.r.h)
      sattTillf({ ...st.r, x, y })
    } else {
      const h = st.drag.horn
      const tecken = h === 'ne' || h === 'se' ? 1 : -1
      const forhallande = s.pxHojd / s.pxBredd
      const max = storstaStampelMm(matt, s.pxBredd, s.pxHojd) * MM
      const b = Math.min(Math.max(st.r.b + tecken * dx, MIN_STAMPEL_MM * MM), max)
      const hh = b * forhallande
      const x = h === 'nw' || h === 'sw' ? st.r.x + st.r.b - b : st.r.x
      const y = h === 'nw' || h === 'ne' ? st.r.y + st.r.h - hh : st.r.y
      sattTillf({ x: Math.min(Math.max(x, 0), matt.bredd - b), y: Math.min(Math.max(y, 0), matt.hojd - hh), b, h: hh })
    }
  }
  const upp = () => {
    const st = start.current
    start.current = null
    const t = tillf
    sattTillf(null)
    if (!st || !t || !s) return
    const p = placeringFranRuta(matt, t, s.placering.ankare)
    if (st.drag.typ === 'flytt') andra((nu) => sattPlacering(nu, 'stampel', p))
    else andra((nu) => sattStampelbredd(nu, t.b / MM, p))
  }
  const tangent = (e: KeyboardEvent) => {
    if (!s) return
    const steg = e.shiftKey ? 10 : 1
    const riktning: Record<string, [number, number]> = { ArrowLeft: [-steg, 0], ArrowRight: [steg, 0], ArrowUp: [0, -steg], ArrowDown: [0, steg] }
    const d = riktning[e.key]
    if (!d) return
    e.preventDefault()
    e.stopPropagation()
    const p = flytta(matt, stampelMatt(s), s.placering, d[0], d[1])
    andra((nu) => sattPlacering(nu, 'stampel', p))
  }

  return (
    <div class="overlagg">
      <svg class="marginal" width={matt.bredd * skala} height={matt.hojd * skala} aria-hidden="true">
        <rect x={m} y={m} width={Math.max(0, matt.bredd * skala - 2 * m)} height={Math.max(0, matt.hojd * skala - 2 * m)} class="marginal-b" />
        <rect x={m} y={m} width={Math.max(0, matt.bredd * skala - 2 * m)} height={Math.max(0, matt.hojd * skala - 2 * m)} class="marginal-a" />
      </svg>
      {r && s && (
        <div
          class="overlaggsobjekt stampel-objekt"
          tabIndex={0}
          role="group"
          aria-roledescription={texter.flikStampel}
          aria-label={`${texter.overlaggStampel(s.namn)}. ${texter.flyttaHjalp}`}
          style={{ left: `${r.x * skala}px`, top: `${r.y * skala}px`, width: `${r.b * skala}px`, height: `${r.h * skala}px` }}
          onKeyDown={tangent}
          onPointerDown={(e) => ner(e, { typ: 'flytt' })}
          onPointerMove={rorelse}
          onPointerUp={upp}
          onPointerCancel={upp}
        >
          {url && <img src={url} alt="" draggable={false} style={{ opacity: s.opacitet / 100 }} />}
          {(['nw', 'ne', 'sw', 'se'] as const).map((h) => (
            <span
              key={h}
              class={`handtag handtag-${h}`}
              aria-hidden="true"
              title={texter.storleksHandtag}
              onPointerDown={(e) => ner(e, { typ: 'storlek', horn: h })}
              onPointerMove={rorelse}
              onPointerUp={upp}
              onPointerCancel={upp}
            />
          ))}
        </div>
      )}
    </div>
  )
}
