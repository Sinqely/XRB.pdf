// Spara-dialogen SCR-APP-005 (FEAT-001 ui-design.md): filnamn, sparar, sparad, fel.
import { useEffect, useRef, useState } from 'preact/hooks'
import { texter } from '../karna/texter'
import type { Arbetsyta } from '../karna/typer'
import { bygg } from '../bygg/bygg-klient'
import { foreslaFilnamn, laddaNed, sparaResultat, stadaFilnamn } from './spara'
import { Ikon } from './ikoner'

interface Props {
  yta: Arbetsyta
  stang: (sparatSom: string | null) => void
  status: (text: string) => void
}

export function SparaDialog({ yta, stang, status }: Props) {
  const dlg = useRef<HTMLDialogElement>(null)
  const falt = useRef<HTMLInputElement>(null)
  const forslag = foreslaFilnamn(yta)
  const [namn, sattNamn] = useState(forslag)
  const [sparar, sattSparar] = useState(false)
  const [fel, sattFel] = useState<string | null>(null)
  const filer = new Set(yta.resultat.map((r) => r.dokumentId)).size

  useEffect(() => {
    const d = dlg.current!
    d.showModal()
    const f = falt.current!
    f.focus()
    f.setSelectionRange(0, forslag.toLowerCase().endsWith('.pdf') ? forslag.length - 4 : forslag.length)
  }, [])

  async function spara(e?: Event) {
    e?.preventDefault()
    if (sparar) return
    const filnamn = stadaFilnamn(namn, forslag)
    sattSparar(true)
    sattFel(null)
    status(texter.sparar)
    const ut = await sparaResultat(yta, filnamn, { bygg, ladda: laddaNed })
    sattSparar(false)
    if (ut.ok) {
      status(texter.sparad(ut.filnamn))
      dlg.current?.close()
      stang(ut.filnamn)
    } else {
      sattFel(ut.meddelande)
      status(ut.meddelande)
    }
  }

  return (
    <dialog
      ref={dlg}
      class="dialog"
      aria-labelledby="spara-rubrik"
      onCancel={(e) => {
        e.preventDefault()
        if (!sparar) {
          dlg.current?.close()
          stang(null)
        }
      }}
    >
      <form method="dialog" onSubmit={spara} aria-busy={sparar ? 'true' : undefined}>
        <h2 id="spara-rubrik" class="mellanrubrik">{texter.sparaRubrik}</h2>
        {fel && (
          <div class="meddelande meddelande-fel" role="alert">
            <p>{fel}</p>
          </div>
        )}
        <p>{texter.sparaSammanfattning(yta.resultat.length, filer)}</p>
        <label class="falt">
          <span class="faltetikett">{texter.filnamn}</span>
          <input
            ref={falt}
            class="textfalt"
            type="text"
            value={namn}
            aria-describedby="filnamn-hjalp"
            aria-disabled={sparar}
            readOnly={sparar}
            onInput={(e) => sattNamn((e.target as HTMLInputElement).value)}
          />
          <span id="filnamn-hjalp" class="dampad liten">{texter.filnamnHjalp}</span>
        </label>
        {sparar && (
          <div class="vantindikator">
            <span class="snurra" aria-hidden="true" />
            {texter.sparar}
          </div>
        )}
        <div class="dialogknappar">
          <button
            type="button"
            class="knapp-sekundar"
            aria-disabled={sparar}
            onClick={() => {
              if (sparar) return
              dlg.current?.close()
              stang(null)
            }}
          >
            {texter.avbryt}
          </button>
          <button type="submit" class="knapp-primar" aria-disabled={sparar}>
            <Ikon namn="ladda" />
            {texter.spara}
          </button>
        </div>
      </form>
    </dialog>
  )
}
