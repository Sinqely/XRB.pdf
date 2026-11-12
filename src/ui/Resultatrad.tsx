// Resultatraden i SCR-APP-001 (FEAT-001 ui-design.md): ordning, dra och släpp, knappar och kortkommandon.
import { Fragment } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import { texter } from '../karna/texter'
import { flyttaSida, flyttaSteg, taBortResultatsida, type Andring } from '../karna/arbetsyta'
import type { Arbetsyta } from '../karna/typer'
import { Ikon } from './ikoner'
import { miniatyr, useMiniatyrer } from './dokumentregister'
import { Sidbild } from './Filkolumn'

interface Props {
  yta: Arbetsyta
  andra: (fn: (y: Arbetsyta) => Andring) => void
  aktivId: string | null
  sattAktiv: (id: string) => void
}

export function Resultatrad({ yta, andra, aktivId, sattAktiv }: Props) {
  useMiniatyrer()
  const [dras, sattDras] = useState<string | null>(null)
  const [markor, sattMarkor] = useState<number | null>(null)
  const fokusEfter = useRef<{ id: string | null; plats: number } | null>(null)
  const element = useRef(new Map<string, HTMLLIElement>())
  const rubrik = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const f = fokusEfter.current
    if (!f) return
    fokusEfter.current = null
    const id = f.id && yta.resultat.some((r) => r.id === f.id) ? f.id : yta.resultat[Math.min(f.plats, yta.resultat.length - 1)]?.id
    if (id) element.current.get(id)?.focus()
    else rubrik.current?.focus()
  }, [yta])

  const total = yta.resultat.length
  const namn = (dokId: string) => yta.dokument.find((d) => d.id === dokId)

  function slapp(e: DragEvent) {
    e.preventDefault()
    if (dras !== null && markor !== null) {
      const fran = yta.resultat.findIndex((r) => r.id === dras)
      const till = markor > fran ? markor - 1 : markor
      fokusEfter.current = { id: dras, plats: till }
      andra((y) => flyttaSida(y, dras, till))
    }
    sattDras(null)
    sattMarkor(null)
  }

  return (
    <div class="resultat">
      <h2 id="rubrik-resultat" class="kolumnrubrik" tabIndex={-1} ref={rubrik}>
        <span class="steg" aria-hidden="true">2</span>
        {texter.kolumnResultat}
        <span class="rubrikantal">{texter.sidor(total)}</span>
      </h2>
      {total === 0 ? (
        <p class="dampad resultattom">{texter.resultatTomt}</p>
      ) : (
        <ol class="resultatrad" aria-label={texter.resultatEtikett} onDragOver={(e) => dras && e.preventDefault()} onDrop={slapp}>
          {yta.resultat.map((r, plats) => {
            const d = namn(r.dokumentId)
            const n = r.sidindex + 1
            const dn = d?.namn ?? ''
            const tangent = (e: KeyboardEvent) => {
              if (e.target !== e.currentTarget) return
              if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowRight' || e.key === 'ArrowDown')) {
                e.preventDefault()
                fokusEfter.current = { id: r.id, plats }
                andra((y) => flyttaSteg(y, r.id, e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1))
              } else if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault()
                fokusEfter.current = { id: null, plats }
                andra((y) => taBortResultatsida(y, r.id))
              }
            }
            return (
              <Fragment key={r.id}>
                {markor === plats && dras && <li class="slappmarkor" aria-hidden="true" />}
                <li
                  ref={(el) => {
                    if (el) element.current.set(r.id, el)
                    else element.current.delete(r.id)
                  }}
                  class={`resultatsida${dras === r.id ? ' dras' : ''}${aktivId === r.id ? ' aktiv' : ''}`}
                  aria-current={aktivId === r.id ? 'true' : undefined}
                  onClick={() => sattAktiv(r.id)}
                  onFocus={(e) => e.target === e.currentTarget && sattAktiv(r.id)}
                  tabIndex={0}
                  aria-label={texter.resultatsida(n, d?.sidantal ?? 0, dn, plats + 1, total)}
                  draggable
                  onKeyDown={tangent}
                  onDragStart={(e) => {
                    e.dataTransfer?.setData('text/plain', r.id)
                    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
                    sattDras(r.id)
                  }}
                  onDragEnd={() => {
                    sattDras(null)
                    sattMarkor(null)
                  }}
                  onDragOver={(e) => {
                    if (!dras) return
                    e.preventDefault()
                    const ruta = (e.currentTarget as HTMLElement).getBoundingClientRect()
                    sattMarkor(e.clientX < ruta.left + ruta.width / 2 ? plats : plats + 1)
                  }}
                >
                  <span class="resultatetikett" title={texter.resultatEtikettKort(plats + 1, dn, n)} aria-hidden="true">
                    <strong>{plats + 1}</strong> · {dn} s. {n}
                  </span>
                  <Sidbild m={miniatyr(r.dokumentId, r.sidindex)} />
                  <span class="ikonrad">
                    <Knapp ikon="vanster" etikett={texter.flyttaVanster(n, dn)} inaktiv={plats === 0} forklaring={texter.redanForst}
                      klick={() => { fokusEfter.current = { id: r.id, plats }; andra((y) => flyttaSteg(y, r.id, -1)) }} />
                    <Knapp ikon="hoger" etikett={texter.flyttaHoger(n, dn)} inaktiv={plats === total - 1} forklaring={texter.redanSist}
                      klick={() => { fokusEfter.current = { id: r.id, plats }; andra((y) => flyttaSteg(y, r.id, 1)) }} />
                    <Knapp ikon="kryss" etikett={texter.taBortSida(n, dn)}
                      klick={() => { fokusEfter.current = { id: null, plats }; andra((y) => taBortResultatsida(y, r.id)) }} />
                  </span>
                </li>
              </Fragment>
            )
          })}
          {markor === total && dras && <li class="slappmarkor" aria-hidden="true" />}
        </ol>
      )}
    </div>
  )
}

function Knapp(p: { ikon: 'vanster' | 'hoger' | 'kryss'; etikett: string; klick: () => void; inaktiv?: boolean; forklaring?: string }) {
  return (
    <button
      type="button"
      class="ikonknapp ikonknapp-liten"
      aria-label={p.inaktiv && p.forklaring ? `${p.etikett}. ${p.forklaring}` : p.etikett}
      title={p.etikett}
      aria-disabled={p.inaktiv}
      onClick={() => !p.inaktiv && p.klick()}
    >
      <Ikon namn={p.ikon} storlek={16} />
    </button>
  )
}
