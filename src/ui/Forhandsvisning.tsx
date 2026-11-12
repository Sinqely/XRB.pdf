// Förhandsvisningen i SCR-APP-001 (FEAT-003): en resultatsida i taget med överlägg.
import type { ComponentChildren } from 'preact'
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks'
import { texter } from '../karna/texter'
import type { Arbetsyta } from '../karna/typer'
import { ritaSida, type Sidmatt } from '../las/pdfjs-adapter'
import { pdfFor, useMiniatyrer } from './dokumentregister'
import { Ikon } from './ikoner'
import { laggTillIgen, vridSida, type Andring } from '../karna/arbetsyta'
import type { Storsida } from './StorVisning'

export type Skala = 'anpassa' | number

interface Props {
  yta: Arbetsyta
  aktivId: string | null
  sattAktiv: (id: string) => void
  /** Ritar överlägg (stämpel, etikett, marginal) ovanpå sidan; får sidans mått i punkter och skalan. */
  overlagg?: (matt: Sidmatt, skala: number, resultatId: string) => ComponentChildren
  /** Vrida, lägga till igen (FEAT-004). */
  andra?: (fn: (nu: Arbetsyta) => Andring) => void
  visaStort?: (s: Storsida) => void
}

export function Forhandsvisning({ yta, aktivId, sattAktiv, overlagg, andra, visaStort }: Props) {
  useMiniatyrer()
  const canvas = useRef<HTMLCanvasElement>(null)
  const yta_ = useRef<HTMLDivElement>(null)
  const [matt, sattMatt] = useState<Sidmatt | null>(null)
  const [skalaVal, sattSkalaVal] = useState<Skala>('anpassa')
  const [plats, sattPlats] = useState({ b: 0, h: 0 })
  const index = Math.max(0, yta.resultat.findIndex((r) => r.id === aktivId))
  const sida = yta.resultat[index]
  const dok = sida ? yta.dokument.find((d) => d.id === sida.dokumentId) : undefined
  const pdf = sida ? pdfFor(sida.dokumentId) : null
  const vridning = sida?.vridning ?? 0

  useLayoutEffect(() => {
    const el = yta_.current
    if (!el) return
    const ro = new ResizeObserver(() => sattPlats({ b: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [sida !== undefined])

  const marginal = 48
  const skala =
    matt && skalaVal === 'anpassa'
      ? Math.max(0.1, Math.min((plats.b - marginal) / matt.bredd, (plats.h - marginal) / matt.hojd))
      : typeof skalaVal === 'number'
        ? skalaVal
        : 1

  useEffect(() => {
    if (!sida || !pdf || !canvas.current || plats.b === 0) return
    const r = ritaSida(pdf, sida.sidindex, canvas.current, skala, vridning)
    r.klar.then(sattMatt).catch(() => undefined)
    return () => r.avbryt()
  }, [sida?.dokumentId, sida?.sidindex, vridning, pdf, skala, plats.b])

  if (!sida || !dok) {
    return (
      <div class="forhandsvisning forhandsvisning-tom">
        <ol class="tre-steg">
          <li><strong>{texter.steg1Rubrik}</strong> {texter.steg1Text}</li>
          <li><strong>{texter.steg2Rubrik}</strong> {texter.steg2Text}</li>
          <li><strong>{texter.steg3Rubrik}</strong> {texter.steg3Text}</li>
        </ol>
      </div>
    )
  }

  const total = yta.resultat.length
  const ga = (steg: number) => {
    const ny = yta.resultat[Math.max(0, Math.min(total - 1, index + steg))]
    if (ny) sattAktiv(ny.id)
  }
  const tangent = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement).closest('.overlaggsobjekt')) return
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') ga(-1)
    else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') ga(1)
    else if (e.key === 'Home') ga(-total)
    else if (e.key === 'End') ga(total)
    else return
    e.preventDefault()
  }
  const namn = texter.miniatyr(sida.sidindex + 1, dok.sidantal, dok.namn)
  const zooma = (f: number) => sattSkalaVal(Math.max(0.25, Math.min(4, Math.round(skala * f * 100) / 100)))

  return (
    <div class="forhandsvisning">
      <div class="forhandsvisning-yta" ref={yta_} tabIndex={0} role="group" aria-label={`${texter.forhandsvisning}: ${texter.sidaNavM(index + 1, total)}, ${namn}`} onKeyDown={tangent}>
        <div class="sidram" style={matt ? { width: `${matt.bredd * skala}px`, height: `${matt.hojd * skala}px` } : undefined}>
          <canvas ref={canvas} role="img" aria-label={namn} />
          {matt && overlagg?.(matt, skala, sida.id)}
        </div>
      </div>
      <div class="forhandsvisning-fot">
        <button type="button" class="ikonknapp" aria-label={texter.foregaendeSida} title={texter.foregaendeSida} aria-disabled={index === 0} onClick={() => ga(-1)}>
          <Ikon namn="vanster" />
        </button>
        <span class="sidinfo" aria-live="polite">
          <strong>{texter.sidaNavM(index + 1, total)}</strong> · {texter.urDokument(dok.namn, sida.sidindex + 1)}
        </span>
        <button type="button" class="ikonknapp" aria-label={texter.nastaSida} title={texter.nastaSida} aria-disabled={index === total - 1} onClick={() => ga(1)}>
          <Ikon namn="hoger" />
        </button>
        {andra && (
          <span class="sidatgarder" role="group" aria-label={texter.sidatgarder}>
            <button type="button" class="ikonknapp" aria-label={texter.vridVanster} title={texter.vridVanster} aria-keyshortcuts="Shift+R" onClick={() => andra((y) => vridSida(y, sida.id, -1))}>
              <Ikon namn="vridVanster" />
            </button>
            <button type="button" class="ikonknapp" aria-label={texter.vridHoger} title={texter.vridHoger} aria-keyshortcuts="R" onClick={() => andra((y) => vridSida(y, sida.id, 1))}>
              <Ikon namn="vrid" />
            </button>
            {visaStort && (
              <button type="button" class="ikonknapp" aria-label={texter.visaStort} title={texter.visaStort} onClick={() => visaStort({ dokumentId: sida.dokumentId, sidindex: sida.sidindex, vridning: sida.vridning, namn: dok.namn })}>
                <Ikon namn="forstora" />
              </button>
            )}
            <button type="button" class="ikonknapp" aria-label={texter.laggTillIgen} title={texter.laggTillIgen} onClick={() => andra((y) => laggTillIgen(y, sida.id))}>
              <Ikon namn="plus" />
            </button>
          </span>
        )}
        <span class="skalval">
          <button type="button" class="ikonknapp" aria-label={texter.zoomaUt} title={texter.zoomaUt} onClick={() => zooma(0.8)}>
            <Ikon namn="minus" />
          </button>
          <span class="liten">{Math.round(skala * 100)} %</span>
          <button type="button" class="ikonknapp" aria-label={texter.zoomaIn} title={texter.zoomaIn} onClick={() => zooma(1.25)}>
            <Ikon namn="plus" />
          </button>
          <button type="button" class="knapp-text knapp-liten" aria-pressed={skalaVal === 'anpassa'} onClick={() => sattSkalaVal('anpassa')}>
            {texter.anpassa}
          </button>
        </span>
      </div>
    </div>
  )
}
