// Överlägget i förhandsvisningen (FEAT-006, FEAT-007): säkerhetsmarginal, vattenstämpel och textetikett,
// ritade där layoutmodellen säger (R4). Flytta med mus eller piltangenter; stämpelns storlek med hörnen.
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import type { Andring } from '../karna/arbetsyta'
import { etikettMatt } from '../karna/etikett'
import { flytta, MARGINAL_MM, MIN_STAMPEL_MM, MM, placeringFranRuta, ruta, stampelMatt, storstaStampelMm, type Matt, type Ruta } from '../karna/layout'
import { etikettSyns, sattPlacering, sattStampelbredd, type Objekt } from '../karna/markning'
import { texter } from '../karna/texter'
import type { Arbetsyta, Placering, Vattenstampel } from '../karna/typer'
import { useSnitt } from './typsnitt'

/** Blob-adress för stämpelns bild, frigörs när bilden byts (bara i minnet, FR-ALM-008). */
export function useBildUrl(s: Vattenstampel | null): string | null {
  const bild = s?.bild
  const typ = s?.typ
  const url = useMemo(() => (bild ? URL.createObjectURL(new Blob([bild as BlobPart], { type: `image/${typ}` })) : null), [bild, typ])
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url)
    },
    [url],
  )
  return url
}

type Horn = 'nw' | 'ne' | 'sw' | 'se'
type Drag = { objekt: Objekt; typ: 'flytt' } | { objekt: 'stampel'; typ: 'storlek'; horn: Horn }

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
  const e = yta.textetikett
  const url = useBildUrl(s)
  const snitt = useSnitt(e?.typsnitt, e?.fet, e?.kursiv)
  const [tillf, sattTillf] = useState<{ objekt: Objekt; r: Ruta } | null>(null)
  const start = useRef<{ x: number; y: number; r: Ruta; drag: Drag } | null>(null)
  if (!sida || (!s && !e)) return null

  const m = MARGINAL_MM * MM * skala
  const stampelMatt_ = s ? stampelMatt(s) : null
  const em = e && snitt ? etikettMatt(snitt.font, e) : null
  const objekt: { o: Objekt; matt: Matt; placering: Placering }[] = []
  if (s && sida.stampel) objekt.push({ o: 'stampel', matt: stampelMatt_!, placering: s.placering })
  if (e && em && etikettSyns(yta, resultatId)) objekt.push({ o: 'etikett', matt: em, placering: e.placering })
  const rutaFor = (o: Objekt) => {
    if (tillf?.objekt === o) return tillf.r
    const x = objekt.find((y) => y.o === o)!
    return ruta(matt, x.matt, x.placering)
  }

  const ner = (ev: PointerEvent, drag: Drag) => {
    if (ev.button !== 0) return
    ev.preventDefault()
    ev.stopPropagation()
    ;(ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId)
    ;(ev.currentTarget as HTMLElement).closest<HTMLElement>('.overlaggsobjekt')?.focus()
    start.current = { x: ev.clientX, y: ev.clientY, r: rutaFor(drag.objekt), drag }
  }
  const rorelse = (ev: PointerEvent) => {
    const st = start.current
    if (!st) return
    const dx = (ev.clientX - st.x) / skala
    const dy = (ev.clientY - st.y) / skala
    if (st.drag.typ === 'flytt') {
      const x = Math.min(Math.max(st.r.x + dx, 0), matt.bredd - st.r.b)
      const y = Math.min(Math.max(st.r.y + dy, 0), matt.hojd - st.r.h)
      sattTillf({ objekt: st.drag.objekt, r: { ...st.r, x, y } })
    } else if (s) {
      const h = st.drag.horn
      const tecken = h === 'ne' || h === 'se' ? 1 : -1
      const max = storstaStampelMm(matt, s.pxBredd, s.pxHojd) * MM
      const b = Math.min(Math.max(st.r.b + tecken * dx, MIN_STAMPEL_MM * MM), max)
      const hh = (b * s.pxHojd) / s.pxBredd
      const x = h === 'nw' || h === 'sw' ? st.r.x + st.r.b - b : st.r.x
      const y = h === 'nw' || h === 'ne' ? st.r.y + st.r.h - hh : st.r.y
      sattTillf({ objekt: 'stampel', r: { x: Math.min(Math.max(x, 0), matt.bredd - b), y: Math.min(Math.max(y, 0), matt.hojd - hh), b, h: hh } })
    }
  }
  const upp = () => {
    const st = start.current
    start.current = null
    const t = tillf
    sattTillf(null)
    if (!st || !t) return
    const ankare = st.drag.objekt === 'stampel' ? s!.placering.ankare : e!.placering.ankare
    const p = placeringFranRuta(matt, t.r, ankare)
    if (st.drag.typ === 'flytt') andra((nu) => sattPlacering(nu, st.drag.objekt, p))
    else andra((nu) => sattStampelbredd(nu, t.r.b / MM, p))
  }
  const tangent = (ev: KeyboardEvent, o: Objekt) => {
    const steg = ev.shiftKey ? 10 : 1
    const riktning: Record<string, [number, number]> = { ArrowLeft: [-steg, 0], ArrowRight: [steg, 0], ArrowUp: [0, -steg], ArrowDown: [0, steg] }
    const d = riktning[ev.key]
    const x = objekt.find((y) => y.o === o)
    if (!d || !x) return
    ev.preventDefault()
    ev.stopPropagation()
    const p = flytta(matt, x.matt, x.placering, d[0], d[1])
    andra((nu) => sattPlacering(nu, o, p))
  }
  const handelser = (o: Objekt) => ({
    tabIndex: 0,
    role: 'group' as const,
    onKeyDown: (ev: KeyboardEvent) => tangent(ev, o),
    onPointerDown: (ev: PointerEvent) => ner(ev, { objekt: o, typ: 'flytt' }),
    onPointerMove: rorelse,
    onPointerUp: upp,
    onPointerCancel: upp,
  })
  const stil = (r: Ruta) => ({ left: `${r.x * skala}px`, top: `${r.y * skala}px`, width: `${r.b * skala}px`, height: `${r.h * skala}px` })

  return (
    <div class="overlagg">
      <svg class="marginal" width={matt.bredd * skala} height={matt.hojd * skala} aria-hidden="true">
        <rect x={m} y={m} width={Math.max(0, matt.bredd * skala - 2 * m)} height={Math.max(0, matt.hojd * skala - 2 * m)} class="marginal-b" />
        <rect x={m} y={m} width={Math.max(0, matt.bredd * skala - 2 * m)} height={Math.max(0, matt.hojd * skala - 2 * m)} class="marginal-a" />
      </svg>
      {objekt.map(({ o }) => {
        const r = rutaFor(o)
        if (o === 'stampel' && s) {
          return (
            <div key="stampel" class="overlaggsobjekt stampel-objekt" aria-roledescription={texter.flikStampel} aria-label={`${texter.overlaggStampel(s.namn)}. ${texter.flyttaHjalp}`} style={stil(r)} {...handelser('stampel')}>
              {url && <img src={url} alt="" draggable={false} style={{ opacity: s.opacitet / 100 }} />}
              {(['nw', 'ne', 'sw', 'se'] as const).map((h) => (
                <span
                  key={h}
                  class={`handtag handtag-${h}`}
                  aria-hidden="true"
                  title={texter.storleksHandtag}
                  onPointerDown={(ev) => ner(ev, { objekt: 'stampel', typ: 'storlek', horn: h })}
                  onPointerMove={rorelse}
                  onPointerUp={upp}
                  onPointerCancel={upp}
                />
              ))}
            </div>
          )
        }
        if (o === 'etikett' && e && em && snitt) {
          // Samma mått som i filen: texten ritas i SVG med baslinjen där layoutmodellen säger, utan kerning och ligaturer.
          const f = r.b / em.bredd
          return (
            <div key="etikett" class="overlaggsobjekt etikett-objekt" aria-roledescription={texter.flikEtikett} aria-label={`${texter.overlaggEtikett(e.text)}. ${texter.flyttaHjalp}`} style={stil(r)} {...handelser('etikett')}>
              <svg width={r.b * skala} height={r.h * skala} viewBox={`0 0 ${r.b} ${r.h}`} aria-hidden="true">
                {e.bakgrund && <rect x={0} y={0} width={r.b} height={r.h} fill={e.bakgrund} />}
                <text x={em.marginal * f} y={em.baslinje * f} font-family={`"${snitt.familj}"`} font-size={e.storlekPt * f} fill={e.farg} class="etikett-text">
                  {e.text}
                </text>
              </svg>
            </div>
          )
        }
        return null
      })}
    </div>
  )
}
