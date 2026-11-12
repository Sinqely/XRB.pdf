// Sifferfält som behåller det som skrivs tills det bekräftas med Enter, när fältet lämnas eller med pilarna.
// Ett vanligt kontrollerat fält skulle återställas varje gång appen ritas om medan man skriver
// (till exempel när en miniatyr blir klar). Alla webbläsare skickar inte "change" vid Enter (WebKit).
import { useState } from 'preact/hooks'

interface Props {
  id?: string
  varde: number
  min: number
  max: number
  steg?: number
  satt: (v: number) => void
  'aria-label'?: string
  'aria-describedby'?: string
}

export function SifferFalt({ id, varde, min, max, steg = 1, satt, ...aria }: Props) {
  const [utkast, sattUtkast] = useState<string | null>(null)
  const bekrafta = (text: string) => {
    sattUtkast(null)
    const v = Number(text.replace(',', '.'))
    if (text.trim() !== '' && Number.isFinite(v)) satt(v)
  }
  return (
    <input
      id={id}
      class="textfalt sifferfalt"
      type="number"
      inputMode="decimal"
      min={min}
      max={max}
      step={steg}
      value={utkast ?? String(varde)}
      {...aria}
      onInput={(e) => {
        const el = e.target as HTMLInputElement
        // Pilar och mushjul ger ett nytt värde direkt; skrivande väntar på bekräftelse.
        if ((e as InputEvent).inputType === undefined || (e as InputEvent).inputType === 'insertReplacementText') bekrafta(el.value)
        else sattUtkast(el.value)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') bekrafta((e.target as HTMLInputElement).value)
        else if (e.key === 'Escape' && utkast !== null) {
          e.stopPropagation()
          sattUtkast(null)
        }
      }}
      onBlur={(e) => utkast !== null && bekrafta((e.target as HTMLInputElement).value)}
    />
  )
}
