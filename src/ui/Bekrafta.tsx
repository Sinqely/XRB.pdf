// Bekräftelsedialog (design.md `dialog`, `farlig-atgard`), t.ex. SCR-APP-012 Bekräfta börja om.
import { useEffect, useRef } from 'preact/hooks'

interface Props {
  rubrik: string
  text: string
  ja: string
  nej: string
  svar: (ja: boolean) => void
}

export function Bekrafta({ rubrik, text, ja, nej, svar }: Props) {
  const dlg = useRef<HTMLDialogElement>(null)
  const nejKnapp = useRef<HTMLButtonElement>(null)
  const fore = useRef<Element | null>(null)
  useEffect(() => {
    fore.current = document.activeElement
    dlg.current?.showModal()
    nejKnapp.current?.focus()
  }, [])
  const stang = (v: boolean) => {
    dlg.current?.close()
    ;(fore.current as HTMLElement | null)?.focus?.()
    svar(v)
  }
  return (
    <dialog
      ref={dlg}
      class="dialog"
      aria-labelledby="bekrafta-rubrik"
      aria-describedby="bekrafta-text"
      onCancel={(e) => {
        e.preventDefault()
        stang(false)
      }}
    >
      <div class="dialoginnehall">
        <h2 id="bekrafta-rubrik" class="mellanrubrik">{rubrik}</h2>
        <p id="bekrafta-text">{text}</p>
        <div class="dialogknappar">
          <button ref={nejKnapp} type="button" class="knapp-sekundar" onClick={() => stang(false)}>
            {nej}
          </button>
          <button type="button" class="knapp-sekundar" onClick={() => stang(true)}>
            {ja}
          </button>
        </div>
      </div>
    </dialog>
  )
}
