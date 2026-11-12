// Hjälp SCR-APP-008 (FR-DOK-001, FR-DOK-003, FR-DOK-009) och Kortkommandon SCR-APP-013 (FR-ALM-010), FEAT-010.
import { useEffect, useRef } from 'preact/hooks'
import { texter } from '../karna/texter'
import { Ikon } from './ikoner'

export type Hjalpavsnitt = (typeof texter.hjalpAvsnitt)[number]['id']

/** Liten knapp vid ett steg som öppnar hjälpen vid rätt avsnitt (FR-DOK-001). */
export function Hjalpknapp({ avsnitt, oppna }: { avsnitt: Exclude<Hjalpavsnitt, 'spara'>; oppna: (a: Hjalpavsnitt) => void }) {
  const namn = texter.hjalpOm(texter.hjalpStegNamn[avsnitt])
  return (
    <button type="button" class="ikonknapp hjalpknapp" aria-label={namn} title={namn} onClick={() => oppna(avsnitt)}>
      <Ikon namn="hjalp" />
    </button>
  )
}

export function Kortkommandotabell() {
  return (
    <div class="kortkommandon">
      {texter.kortkommandoGrupper.map((g) => (
        <table key={g.rubrik} class="kortkommandotabell">
          <caption class="faltetikett">{g.rubrik}</caption>
          <thead class="visuellt-dold">
            <tr>
              <th scope="col">{texter.kortkommandoTangent}</th>
              <th scope="col">{texter.kortkommandoGor}</th>
            </tr>
          </thead>
          <tbody>
            {g.rader.map(([tangent, gor]) => (
              <tr key={tangent}>
                <th scope="row">
                  <kbd>{tangent}</kbd>
                </th>
                <td>{gor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  )
}

function useModal(fokus: () => HTMLElement | null | undefined) {
  const dlg = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    dlg.current?.showModal()
    const el = fokus()
    el?.focus()
    el?.scrollIntoView?.({ block: 'start' })
  }, [])
  return dlg
}

export function HjalpDialog({ avsnitt, stang, visaKortkommandon }: { avsnitt: Hjalpavsnitt | null; stang: () => void; visaKortkommandon: () => void }) {
  const lada = useRef<HTMLDivElement>(null)
  const dlg = useModal(() => lada.current?.querySelector<HTMLElement>(avsnitt ? `#hjalp-${avsnitt}` : '#hjalp-rubrik'))
  const klar = () => {
    dlg.current?.close()
    stang()
  }
  return (
    <dialog
      ref={dlg}
      class="dialog dialog-stor"
      aria-labelledby="hjalp-rubrik"
      onCancel={(e) => {
        e.preventDefault()
        klar()
      }}
    >
      <div class="dialoginnehall" ref={lada}>
        <h2 id="hjalp-rubrik" class="mellanrubrik" tabIndex={-1}>
          {texter.hjalpRubrik}
        </h2>
        {/* Rullbar yta som går att nå och rulla med tangentbordet. */}
        <div class="hjalp-innehall" tabIndex={0} role="region" aria-labelledby="hjalp-rubrik">
          <p>{texter.hjalpIngress}</p>
          {texter.hjalpAvsnitt.map((a) => (
            <section key={a.id} aria-labelledby={`hjalp-${a.id}`}>
              <h3 id={`hjalp-${a.id}`} class="underrubrik" tabIndex={-1}>
                {a.rubrik}
              </h3>
              {a.text.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </section>
          ))}
          {texter.hjalpFall.map((f) => (
            <section key={f.id} aria-labelledby={`hjalp-${f.id}`}>
              <h3 id={`hjalp-${f.id}`} class="underrubrik">
                {f.rubrik}
              </h3>
              <ol class="hjalp-steg">
                {f.steg.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </section>
          ))}
          <section aria-labelledby="hjalp-kortkommandon">
            <h3 id="hjalp-kortkommandon" class="underrubrik">
              {texter.kortkommandon}
            </h3>
            <Kortkommandotabell />
          </section>
        </div>
        <div class="dialogknappar">
          <button
            type="button"
            class="knapp-sekundar"
            onClick={() => {
              dlg.current?.close()
              visaKortkommandon()
            }}
          >
            {texter.visaKortkommandon}
          </button>
          <button type="button" class="knapp-primar" onClick={klar}>
            {texter.klar}
          </button>
        </div>
      </div>
    </dialog>
  )
}

export function KortkommandoDialog({ stang }: { stang: () => void }) {
  const knapp = useRef<HTMLButtonElement>(null)
  const dlg = useModal(() => knapp.current)
  const klar = () => {
    dlg.current?.close()
    stang()
  }
  return (
    <dialog
      ref={dlg}
      class="dialog"
      aria-labelledby="kortkommandon-rubrik"
      onCancel={(e) => {
        e.preventDefault()
        klar()
      }}
    >
      <div class="dialoginnehall">
        <h2 id="kortkommandon-rubrik" class="mellanrubrik">
          {texter.kortkommandon}
        </h2>
        <div class="hjalp-innehall" tabIndex={0} role="region" aria-labelledby="kortkommandon-rubrik">
          <Kortkommandotabell />
        </div>
        <div class="dialogknappar">
          <button ref={knapp} type="button" class="knapp-primar" onClick={klar}>
            {texter.klar}
          </button>
        </div>
      </div>
    </dialog>
  )
}
