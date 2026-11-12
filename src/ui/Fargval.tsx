// fargval (docs/design.md §4): åtta förvalda färger (tokens.json color.etikett) som radiogrupp, "Egen färg"
// och för bakgrund "Ingen" (FR-TXT-005, FR-TXT-006).
import { useRef } from 'preact/hooks'
import { etikettfarger } from '../karna/etikett-tokens'
import { texter } from '../karna/texter'
import { Ikon } from './ikoner'

type Fargnamn = keyof typeof etikettfarger

interface Props {
  id: string
  rubrik: string
  varde: string | null
  satt: (farg: string | null) => void
  /** Visar "Ingen" först (bakgrund). */
  ingen?: boolean
}

export function Fargval({ id, rubrik, varde, satt, ingen = false }: Props) {
  const knappar = useRef<(HTMLButtonElement | null)[]>([])
  const val: { namn: string; farg: string | null }[] = [
    ...(ingen ? [{ namn: texter.ingenBakgrund, farg: null }] : []),
    ...(Object.keys(etikettfarger) as Fargnamn[]).map((n) => ({ namn: texter.fargnamn[n], farg: etikettfarger[n] as string })),
  ]
  const vald = val.findIndex((v) => v.farg === varde)
  const egen = vald < 0 && varde !== null
  const tangent = (e: KeyboardEvent, i: number) => {
    const steg = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!steg) return
    e.preventDefault()
    const n = (i + steg + val.length) % val.length
    satt(val[n]!.farg)
    knappar.current[n]?.focus()
  }
  return (
    <div class="falt">
      <span class="faltetikett" id={`${id}-rubrik`}>
        {rubrik}
      </span>
      <div class="fargval">
        <div class="fargrutor" role="radiogroup" aria-labelledby={`${id}-rubrik`}>
          {val.map((v, i) => (
            <button
              key={v.namn}
              ref={(el) => {
                knappar.current[i] = el
              }}
              type="button"
              role="radio"
              class={`fargruta${v.farg === null ? ' fargruta-ingen' : ''}`}
              aria-checked={i === vald}
              aria-label={v.namn}
              title={v.namn}
              tabIndex={i === (vald < 0 ? 0 : vald) ? 0 : -1}
              style={v.farg ? { background: v.farg } : undefined}
              onClick={() => satt(v.farg)}
              onKeyDown={(e) => tangent(e, i)}
            >
              {i === vald && <Ikon namn="bock" storlek={16} />}
            </button>
          ))}
        </div>
        <label class={`egenfarg${egen ? ' vald' : ''}`}>
          <input type="color" value={varde ?? '#000000'} onChange={(e) => satt((e.target as HTMLInputElement).value)} />
          <span>{texter.egenFarg}</span>
        </label>
      </div>
    </div>
  )
}
