// placeringsvaljare (docs/design.md §4): sex färdiga placeringar som radiogrupp i en miniatyrsida
// och fältet "Avstånd till kant" (FR-PLC-004, FR-PLC-005). Används av stämpel och etikett.
import { useRef } from 'preact/hooks'
import { avstand, forval, MAX_AVSTAND_MM } from '../karna/layout'
import { texter } from '../karna/texter'
import type { Ankare, Placering } from '../karna/typer'

const ORDNING: Ankare[] = ['ovre-vanster', 'sidhuvud', 'ovre-hoger', 'nedre-vanster', 'sidfot', 'nedre-hoger']

interface Props {
  id: string
  placering: Placering
  satt: (p: Placering) => void
}

export function Placeringsvaljare({ id, placering, satt }: Props) {
  const knappar = useRef<(HTMLButtonElement | null)[]>([])
  const vald = placering.egen ? null : placering.ankare
  const fokusbar = vald ?? placering.ankare
  const avst = Math.round(avstand(placering) * 10) / 10

  const tangent = (e: KeyboardEvent, i: number) => {
    const steg: Record<string, number> = { ArrowRight: 1, ArrowDown: 3, ArrowLeft: -1, ArrowUp: -3 }
    if (!(e.key in steg)) return
    e.preventDefault()
    const n = (i + steg[e.key]! + 6) % 6
    satt(forval(ORDNING[n]!, placering.egen ? undefined : avst))
    knappar.current[n]?.focus()
  }

  return (
    <div class="placering">
      <span class="faltetikett" id={`${id}-rubrik`}>
        {texter.placering}
      </span>
      <div class="placeringsvaljare" role="radiogroup" aria-labelledby={`${id}-rubrik`}>
        {ORDNING.map((a, i) => (
          <button
            key={a}
            ref={(el) => {
              knappar.current[i] = el
            }}
            type="button"
            role="radio"
            class={`placeringsknapp placering-${a}`}
            aria-checked={vald === a}
            aria-label={texter.ankare[a]}
            title={texter.ankare[a]}
            tabIndex={fokusbar === a ? 0 : -1}
            onClick={() => satt(forval(a, placering.egen ? undefined : avst))}
            onKeyDown={(e) => tangent(e, i)}
          >
            <span aria-hidden="true" />
          </button>
        ))}
      </div>
      {placering.egen && <p class="dampad liten">{texter.egenPlacering}</p>}
      <label class="falt">
        <span class="faltetikett">{texter.avstandKant}</span>
        <input
          class="textfalt sifferfalt"
          type="number"
          min={0}
          max={MAX_AVSTAND_MM}
          step={1}
          value={avst}
          aria-describedby={`${id}-avstand-hjalp`}
          onChange={(e) => {
            const v = Number((e.target as HTMLInputElement).value)
            if (Number.isFinite(v)) satt(forval(placering.ankare, v))
          }}
        />
        <span id={`${id}-avstand-hjalp`} class="dampad liten">
          {texter.avstandHjalp}
        </span>
      </label>
    </div>
  )
}
