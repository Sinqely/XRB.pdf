// Panelen Textetikett SCR-APP-003 (FEAT-007): text, storlek, färg, bakgrund, typsnitt, stil, placering och sidor.
import type { Andring } from '../karna/arbetsyta'
import { MAX_STORLEK_PT, MAX_TECKEN, MIN_STORLEK_PT, saknadeTecken } from '../karna/etikett'
import { andraEtikett, nyEtikett, sattAllaSidor, sattPlacering, sidorMed, taBortEtikett } from '../karna/markning'
import { SifferFalt } from './SifferFalt'
import { texter } from '../karna/texter'
import type { Arbetsyta, Typsnitt } from '../karna/typer'
import { Fargval } from './Fargval'
import { Ikon } from './ikoner'
import { Placeringsvaljare } from './Placeringsvaljare'
import { useSnitt } from './typsnitt'

interface Props {
  yta: Arbetsyta
  andra: (fn: (nu: Arbetsyta) => Andring) => void
  /** För texten: på varandra följande tangenttryck blir ett ångra-steg. */
  andraText: (fn: (nu: Arbetsyta) => Andring) => void
  aktivId: string | null
  naraKant: number[]
  overlapp: number[]
}

export function EtikettPanel({ yta, andra, andraText, aktivId, naraKant, overlapp }: Props) {
  const e = yta.textetikett ?? nyEtikett
  const finns = !!yta.textetikett
  const snitt = useSnitt(e.typsnitt, e.fet, e.kursiv)
  const saknas = snitt ? saknadeTecken(snitt.font, e.text) : []
  const antal = [...e.text].length
  const typsnitt: Typsnitt[] = ['sans', 'serif', 'mono']

  return (
    <div class="markningspanel etikettpanel">
      <div class="falt">
        <label class="faltetikett" for="etikett-text">
          {texter.etikettText}
        </label>
        <input
          id="etikett-text"
          class="textfalt"
          type="text"
          maxLength={MAX_TECKEN}
          value={e.text}
          aria-describedby="etikett-text-hjalp etikett-raknare"
          aria-invalid={saknas.length > 0 ? 'true' : undefined}
          onInput={(ev) => {
            const el = ev.target as HTMLInputElement
            andraText((nu) => andraEtikett(nu, { text: el.value }))
          }}
        />
        <span class="faltrad">
          <span id="etikett-text-hjalp" class="dampad liten">
            {texter.etikettTextHjalp}
          </span>
          <span id="etikett-raknare" class="dampad liten" aria-live="polite">
            {antal >= MAX_TECKEN ? texter.teckenGrans : texter.teckenRaknare(antal)}
          </span>
        </span>
      </div>
      {saknas.length > 0 && (
        <div class="meddelande" role="alert">
          <Ikon namn="varning" />
          <p>{texter.saknadeTecken(saknas)}</p>
        </div>
      )}
      {finns && e.text.trim() === '' && <p class="dampad">{texter.etikettTom}</p>}
      {naraKant.length > 0 && (
        <div class="meddelande" role="status">
          <Ikon namn="varning" />
          <p>{texter.naraKant('etikett', naraKant)}</p>
        </div>
      )}
      {overlapp.length > 0 && (
        <div class="meddelande" role="status">
          <Ikon namn="info" />
          <p>{texter.overlapp(overlapp)}</p>
        </div>
      )}
      <label class="falt">
        <span class="faltetikett">{texter.textstorlek}</span>
        <SifferFalt min={MIN_STORLEK_PT} max={MAX_STORLEK_PT} varde={e.storlekPt} aria-describedby="etikett-storlek-hjalp" satt={(v) => andra((nu) => andraEtikett(nu, { storlekPt: v }))} />
        <span id="etikett-storlek-hjalp" class="dampad liten">
          {texter.textstorlekHjalp}
        </span>
      </label>
      <Fargval id="etikett-farg" rubrik={texter.textfarg} varde={e.farg} satt={(f) => f && andra((nu) => andraEtikett(nu, { farg: f }))} />
      <Fargval id="etikett-bakgrund" rubrik={texter.bakgrundsfarg} varde={e.bakgrund} ingen satt={(f) => andra((nu) => andraEtikett(nu, { bakgrund: f }))} />
      <fieldset class="valgrupp">
        <legend class="faltetikett">{texter.typsnitt}</legend>
        {typsnitt.map((t) => (
          <label class="val" key={t}>
            <input type="radio" name="etikett-typsnitt" checked={e.typsnitt === t} onChange={() => andra((nu) => andraEtikett(nu, { typsnitt: t }))} />
            <span>{texter.typsnittNamn[t]}</span>
          </label>
        ))}
      </fieldset>
      <fieldset class="valgrupp valgrupp-rad">
        <legend class="faltetikett">{texter.stil}</legend>
        <label class="val">
          <input type="checkbox" checked={e.fet} onChange={(ev) => andra((nu) => andraEtikett(nu, { fet: (ev.target as HTMLInputElement).checked }))} />
          <span>
            <strong>{texter.fet}</strong>
          </span>
        </label>
        <label class="val">
          <input type="checkbox" checked={e.kursiv} onChange={(ev) => andra((nu) => andraEtikett(nu, { kursiv: (ev.target as HTMLInputElement).checked }))} />
          <span>
            <em>{texter.kursiv}</em>
          </span>
        </label>
      </fieldset>
      {finns && (
        <>
          <Placeringsvaljare id="etikett-placering" placering={e.placering} satt={(p) => andra((nu) => sattPlacering(nu, 'etikett', p))} />
          <fieldset class="valgrupp">
            <legend class="faltetikett">{texter.sidorRubrik}</legend>
            <label class="val">
              <input type="checkbox" checked={e.allaSidor} aria-describedby="etikett-alla-hjalp" onChange={(ev) => andra((nu) => sattAllaSidor(nu, 'etikett', (ev.target as HTMLInputElement).checked, aktivId))} />
              <span>
                {texter.allaSidor}
                <span id="etikett-alla-hjalp" class="dampad liten blocktext">
                  {texter.allaSidorHjalp} {texter.sidorMed(sidorMed(yta, 'etikett'))}
                </span>
              </span>
            </label>
          </fieldset>
          <div class="knapprad">
            <button type="button" class="knapp-sekundar" onClick={() => andra(taBortEtikett)}>
              <Ikon namn="taBort" />
              {texter.taBortEtikett}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
