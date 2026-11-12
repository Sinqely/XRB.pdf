// Stor visning av en sida SCR-APP-007 (FR-SID-012, FEAT-004): sidan så stor som fönstret tillåter, tills
// användaren stänger med knappen eller Esc.
import { useEffect, useRef } from 'preact/hooks'
import { texter } from '../karna/texter'
import { ritaSida } from '../las/pdfjs-adapter'
import { pdfFor, sidmattFor, useSidmatt } from './dokumentregister'
import { Ikon } from './ikoner'

export interface Storsida {
  readonly dokumentId: string
  readonly sidindex: number
  readonly vridning: number
  readonly namn: string
}

export function StorVisning({ sida, stang }: { sida: Storsida; stang: () => void }) {
  const dlg = useRef<HTMLDialogElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const knapp = useRef<HTMLButtonElement>(null)
  useSidmatt()
  const matt = sidmattFor(sida.dokumentId, sida.sidindex, sida.vridning)
  const pdf = pdfFor(sida.dokumentId)
  useEffect(() => {
    dlg.current?.showModal()
    knapp.current?.focus()
  }, [])
  useEffect(() => {
    if (!matt || !pdf || !canvas.current) return
    // Plats i dialogen: bredden upp till 840 px och höjden upp till 75 % av fönstret.
    const skala = Math.min(Math.min(840, window.innerWidth - 80) / matt.bredd, (window.innerHeight * 0.75) / matt.hojd)
    const r = ritaSida(pdf, sida.sidindex, canvas.current, skala, sida.vridning)
    r.klar.catch(() => {})
    return () => r.avbryt()
  }, [matt?.bredd, matt?.hojd, pdf])
  const klar = () => {
    dlg.current?.close()
    stang()
  }
  const rubrik = texter.storVisning(sida.sidindex + 1, sida.namn)
  return (
    <dialog
      ref={dlg}
      class="dialog dialog-stor storvisning"
      aria-label={rubrik}
      onCancel={(e) => {
        e.preventDefault()
        klar()
      }}
    >
      <div class="dialoginnehall">
        <div class="kolumnhuvud">
          <h2 class="mellanrubrik brytbar">{rubrik}</h2>
          <button ref={knapp} type="button" class="ikonknapp" aria-label={texter.stangVisning} title={texter.stangVisning} onClick={klar}>
            <Ikon namn="kryss" />
          </button>
        </div>
        <div class="storvisning-yta">
          {matt && pdf ? <canvas ref={canvas} role="img" aria-label={rubrik} /> : <span class="dampad">{texter.ritar}</span>}
        </div>
      </div>
    </dialog>
  )
}
