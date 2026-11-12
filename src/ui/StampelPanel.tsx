// Panelen Vattenstämpel SCR-APP-002 (FEAT-006): bild, opacitet, storlek, placering och sidor.
import { useMemo, useRef, useState } from 'preact/hooks'
import { forvaldStampelMm, MIN_STAMPEL_MM, storstaStampelMm, type Matt } from '../karna/layout'
import { sattAllaSidor, sattOpacitet, sattPlacering, sattStampelbild, sattStampelbredd, sidorMed, taBortStampel } from '../karna/markning'
import type { Andring } from '../karna/arbetsyta'
import { SifferFalt } from './SifferFalt'
import { texter } from '../karna/texter'
import type { Arbetsyta } from '../karna/typer'
import { lasBild } from './bildinlasning'
import { Ikon } from './ikoner'
import { Placeringsvaljare } from './Placeringsvaljare'
import { useBildUrl } from './Overlagg'

interface Props {
  yta: Arbetsyta
  andra: (fn: (nu: Arbetsyta) => Andring) => void
  aktivId: string | null
  /** Den aktiva sidans mått, för största storlek. */
  aktivMatt: Matt | null
  /** Sidor (platser från 1) där stämpeln ligger inom säkerhetsmarginalen. */
  naraKant: number[]
  status: (t: string) => void
}

export function StampelPanel({ yta, andra, aktivId, aktivMatt, naraKant, status }: Props) {
  const s = yta.vattenstampel
  const filval = useRef<HTMLInputElement>(null)
  const [fel, sattFel] = useState<string | null>(null)
  const [over, sattOver] = useState(false)
  const url = useBildUrl(s)
  const storsta = useMemo(() => (s && aktivMatt ? storstaStampelMm(aktivMatt, s.pxBredd, s.pxHojd) : 400), [s, aktivMatt])

  async function valjFiler(filer: File[]) {
    if (filer.length === 0) return
    const ut = await lasBild(filer[0]!)
    if (!ut.ok) {
      sattFel(ut.meddelande)
      status(ut.meddelande)
      return
    }
    sattFel(filer.length > 1 ? texter.bildEnAtGangen : null)
    const b = ut.bild
    andra((nu) => sattStampelbild(nu, b, forvaldStampelMm(aktivMatt, b.pxBredd, b.pxHojd)))
  }

  const bredd = (mm: number) => {
    if (!s) return
    andra((nu) => sattStampelbredd(nu, Math.max(MIN_STAMPEL_MM, Math.min(storsta, mm))))
  }

  return (
    <div
      class={`markningspanel stampelpanel${over ? ' drag-over' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        e.stopPropagation()
        sattOver(true)
      }}
      onDragLeave={() => sattOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        e.stopPropagation()
        sattOver(false)
        void valjFiler([...(e.dataTransfer?.files ?? [])])
      }}
    >
      <input
        ref={filval}
        id="bildval"
        type="file"
        accept="image/png,image/jpeg,.png,.jpg,.jpeg"
        hidden
        onChange={(e) => {
          const el = e.target as HTMLInputElement
          void valjFiler([...(el.files ?? [])])
          el.value = ''
        }}
      />
      {fel && (
        <div class="meddelande meddelande-fel" role="alert">
          <Ikon namn="varning" />
          <p>{fel}</p>
          <button type="button" class="ikonknapp" aria-label={texter.stang} title={texter.stang} onClick={() => sattFel(null)}>
            <Ikon namn="kryss" />
          </button>
        </div>
      )}
      {!s ? (
        <div class="bildval">
          <p class="ingress-latt">{over ? texter.slappBild : texter.flikStampel}</p>
          <button type="button" class="knapp-sekundar" onClick={() => filval.current?.click()} aria-describedby="bild-hjalp">
            <Ikon namn="bild" />
            {texter.valjBild}
          </button>
          <p id="bild-hjalp" class="dampad liten">
            {texter.bildHjalp}
          </p>
        </div>
      ) : (
        <>
          <div class="stampelbild">
            {url && <img src={url} alt="" />}
            <div>
              <strong class="brytbar">{s.namn}</strong>
              <span class="dampad liten blocktext">{texter.sidorMed(sidorMed(yta, 'stampel'))}</span>
            </div>
          </div>
          <div class="knapprad">
            <button type="button" class="knapp-sekundar" onClick={() => filval.current?.click()}>
              <Ikon namn="bild" />
              {texter.bytBild}
            </button>
            <button type="button" class="knapp-sekundar" onClick={() => andra(taBortStampel)}>
              <Ikon namn="taBort" />
              {texter.taBortStampel}
            </button>
          </div>
          {naraKant.length > 0 && (
            <div class="meddelande" role="status">
              <Ikon namn="varning" />
              <p>{texter.naraKant('stampel', naraKant)}</p>
            </div>
          )}
          <label class="falt">
            <span class="faltetikett">{texter.opacitet}</span>
            <span class="reglage">
              <input type="range" min={0} max={100} step={1} value={s.opacitet} aria-label={texter.opacitet} onChange={(e) => andra((nu) => sattOpacitet(nu, Number((e.target as HTMLInputElement).value)))} />
              <SifferFalt min={0} max={100} varde={s.opacitet} aria-label={texter.opacitet} satt={(v) => andra((nu) => sattOpacitet(nu, v))} />
            </span>
          </label>
          <div class="falt">
            <label class="faltetikett" for="stampel-bredd">
              {texter.stampelBredd}
            </label>
            <span class="reglage">
              <button type="button" class="ikonknapp" aria-label={texter.mindre} title={texter.mindre} onClick={() => bredd(s.breddMm - 5)}>
                <Ikon namn="minus" />
              </button>
              <SifferFalt id="stampel-bredd" min={MIN_STAMPEL_MM} max={storsta} varde={s.breddMm} aria-describedby="stampel-bredd-hjalp" satt={bredd} />
              <button type="button" class="ikonknapp" aria-label={texter.storre} title={texter.storre} onClick={() => bredd(s.breddMm + 5)}>
                <Ikon namn="plus" />
              </button>
            </span>
            <span id="stampel-bredd-hjalp" class="dampad liten">
              {texter.storlekHjalp}
            </span>
          </div>
          <Placeringsvaljare id="stampel-placering" placering={s.placering} satt={(p) => andra((nu) => sattPlacering(nu, 'stampel', p))} />
          <fieldset class="valgrupp">
            <legend class="faltetikett">{texter.sidorRubrik}</legend>
            <label class="val">
              <input type="checkbox" checked={s.allaSidor} aria-describedby="stampel-alla-hjalp" onChange={(e) => andra((nu) => sattAllaSidor(nu, 'stampel', (e.target as HTMLInputElement).checked, aktivId))} />
              <span>
                {texter.allaSidor}
                <span id="stampel-alla-hjalp" class="dampad liten blocktext">
                  {texter.allaSidorHjalp}
                </span>
              </span>
            </label>
          </fieldset>
        </>
      )}
    </div>
  )
}
