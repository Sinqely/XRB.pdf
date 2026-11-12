// Kolumnen 3 Märkning (docs/design.md §3–4): flikarna Vattenstämpel (SCR-APP-002) och Textetikett (SCR-APP-003).
import { useRef, useState } from 'preact/hooks'
import type { ComponentChildren } from 'preact'
import { texter } from '../karna/texter'
import { Hjalpknapp, type Hjalpavsnitt } from './Hjalp'

type Flik = 'stampel' | 'etikett'

interface Props {
  inaktiv: boolean
  stampel: ComponentChildren
  etikett: ComponentChildren
  /** Öppnar hjälpen vid ett avsnitt (FR-DOK-001). */
  hjalp: (a: Hjalpavsnitt) => void
}

export function Markning({ inaktiv, stampel, etikett, hjalp }: Props) {
  const [flik, sattFlik] = useState<Flik>('stampel')
  const knappar = useRef<Record<Flik, HTMLButtonElement | null>>({ stampel: null, etikett: null })
  const flikar: [Flik, string][] = [
    ['stampel', texter.flikStampel],
    ['etikett', texter.flikEtikett],
  ]
  const tangent = (e: KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return
    e.preventDefault()
    const ny: Flik = e.key === 'Home' ? 'stampel' : e.key === 'End' ? 'etikett' : flik === 'stampel' ? 'etikett' : 'stampel'
    sattFlik(ny)
    knappar.current[ny]?.focus()
  }
  return (
    <section class="kolumn" aria-labelledby="rubrik-markning">
      <div class="kolumnhuvud">
        <h2 id="rubrik-markning" class="kolumnrubrik">
          <span class="steg" aria-hidden="true">3</span>
          {texter.kolumnMarkning}
        </h2>
        <Hjalpknapp avsnitt="marka" oppna={hjalp} />
      </div>
      {inaktiv ? (
        <p class="ingress-latt dampad">{texter.markningInaktiv}</p>
      ) : (
        <>
          <div class="flikar" role="tablist" aria-label={texter.kolumnMarkning}>
            {flikar.map(([f, namn]) => (
              <button
                key={f}
                ref={(el) => {
                  knappar.current[f] = el
                }}
                type="button"
                role="tab"
                id={`flik-${f}`}
                class="flik"
                aria-selected={flik === f}
                aria-controls={`flikpanel-${f}`}
                tabIndex={flik === f ? 0 : -1}
                onClick={() => sattFlik(f)}
                onKeyDown={tangent}
              >
                {namn}
              </button>
            ))}
          </div>
          <div role="tabpanel" id={`flikpanel-${flik}`} aria-labelledby={`flik-${flik}`} class="flikpanel">
            {flik === 'stampel' ? stampel : etikett}
          </div>
        </>
      )}
    </section>
  )
}
