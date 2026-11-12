// Panelen Dold information SCR-APP-004 (FEAT-008): metadata, kommentarer, bilagor, formulärfält och skript
// i de berörda dokumenten, med användarens val. Visas före sparandet (FR-DOL-001) och från sidhuvudet.
import { useEffect, useRef } from 'preact/hooks'
import type { Andring } from '../karna/arbetsyta'
import {
  berordaDokument,
  ingenDoldInformation,
  panelinnehall,
  resultatetsUppgifter,
  sattBorttagen,
  sattFaltBorttaget,
  sattKommentartext,
  sattUppgift,
  type Dokumentdel,
} from '../karna/dold'
import { texter } from '../karna/texter'
import type { Arbetsyta, Metadata } from '../karna/typer'
import { useGranskning } from './granskning'
import { Ikon } from './ikoner'

interface Props {
  yta: Arbetsyta
  andra: (fn: (nu: Arbetsyta) => Andring) => void
  /** För text: tangenttryck i följd blir ett ångra-steg. */
  andraText: (fn: (nu: Arbetsyta) => Andring) => void
  /** 'spara' när panelen visas före sparandet; då finns knappen Fortsätt. */
  lage: 'spara' | 'granska'
  stang: (fortsatt: boolean) => void
}

const UPPGIFTER: (keyof Metadata)[] = ['titel', 'forfattare', 'amne', 'nyckelord']

export function DoldDialog({ yta, andra, andraText, lage, stang }: Props) {
  const dlg = useRef<HTMLDialogElement>(null)
  const rubrik = useRef<HTMLHeadingElement>(null)
  const ids = berordaDokument(yta)
  const dokument = yta.dokument.filter((d) => ids.includes(d.id))
  const { klara, fel, lases } = useGranskning(dokument)
  const delar = panelinnehall(yta, klara)
  const forifyllt = resultatetsUppgifter(yta, klara)
  const uppgifter = yta.sparval.dold.metadata ?? forifyllt
  const forstaDok = yta.dokument.find((d) => d.id === yta.resultat[0]?.dokumentId)

  useEffect(() => {
    dlg.current?.showModal()
    rubrik.current?.focus()
  }, [])
  const klar = (fortsatt: boolean) => {
    dlg.current?.close()
    stang(fortsatt)
  }

  return (
    <dialog
      ref={dlg}
      class="dialog dialog-stor"
      aria-labelledby="dold-rubrik"
      aria-describedby="dold-ingress"
      onCancel={(e) => {
        e.preventDefault()
        klar(false)
      }}
    >
      <div class="dialoginnehall">
        <h2 id="dold-rubrik" class="mellanrubrik" tabIndex={-1} ref={rubrik}>
          {texter.doldRubrik}
        </h2>
        <p id="dold-ingress">{texter.doldIngress}</p>
        <div class="dold-innehall">
          <section class="dold-del" aria-labelledby="dold-uppgifter">
            <h3 id="dold-uppgifter" class="underrubrik">
              {texter.doldUppgifter}
            </h3>
            <p class="dampad liten">{yta.sparval.dold.metadata || !forstaDok ? texter.doldUppgifterEgna : texter.doldUppgifterForifyllda(forstaDok.namn)}</p>
            <div class="dold-uppgifter">
              {UPPGIFTER.map((f) => (
                <label class="falt" key={f}>
                  <span class="faltetikett">{texter.uppgiftNamn[f]}</span>
                  {/* Skrivskyddat tills dokumentet är läst, så att förifyllningen inte skrivs över av tomma fält. */}
                  <input class="textfalt" type="text" value={uppgifter[f]} readOnly={lases} aria-busy={lases ? 'true' : undefined} onInput={(e) => {
                    const v = (e.target as HTMLInputElement).value
                    andraText((nu) => sattUppgift(nu, forifyllt, f, v))
                  }} />
                </label>
              ))}
            </div>
          </section>

          {lases && (
            <div class="vantindikator" aria-live="polite">
              <span class="snurra" aria-hidden="true" />
              {texter.doldLaser}
            </div>
          )}
          {fel.map((id) => (
            <div key={id} class="meddelande meddelande-fel" role="alert">
              <Ikon namn="varning" />
              <p>{texter.doldLasfel(yta.dokument.find((d) => d.id === id)?.namn ?? '')}</p>
            </div>
          ))}
          {!lases && !fel.length && ingenDoldInformation(delar) && (
            <div class="meddelande" role="status">
              <Ikon namn="bock" />
              <p>{texter.doldIngen}</p>
            </div>
          )}
          {delar.map((d) => (
            <Dokumentavsnitt key={d.dokumentId} del={d} andra={andra} andraText={andraText} />
          ))}
        </div>
        <div class="dialogknappar">
          {lage === 'spara' ? (
            <>
              <button type="button" class="knapp-sekundar" onClick={() => klar(false)}>
                {texter.avbryt}
              </button>
              <button type="button" class="knapp-primar" onClick={() => klar(true)}>
                {texter.doldFortsatt}
              </button>
            </>
          ) : (
            <button type="button" class="knapp-primar" onClick={() => klar(false)}>
              {texter.klar}
            </button>
          )}
        </div>
      </div>
    </dialog>
  )
}

function Dokumentavsnitt({ del, andra, andraText }: { del: Dokumentdel; andra: Props['andra']; andraText: Props['andraText'] }) {
  const id = `dold-${del.dokumentId}`
  const i = del.info
  const info: [string, string][] = [
    [texter.uppgiftNamn.titel, i.titel],
    [texter.uppgiftNamn.forfattare, i.forfattare],
    [texter.uppgiftNamn.amne, i.amne],
    [texter.uppgiftNamn.nyckelord, i.nyckelord],
    [texter.doldProgram, i.program],
    [texter.doldSkapad, texter.datum(i.skapad)],
    [texter.doldAndrad, texter.datum(i.andrad)],
  ]
  return (
    <section class="dold-del" aria-labelledby={id}>
      <h3 id={id} class="underrubrik brytbar">
        {del.namn}
      </h3>
      <dl class="dold-info">
        {info.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd class={v ? 'brytbar' : 'dampad'}>{v || texter.doldSaknas}</dd>
          </div>
        ))}
      </dl>

      {del.kommentarer.length > 0 && (
        <fieldset class="valgrupp">
          <legend class="faltetikett">{texter.doldKommentarer(del.kommentarer.length)}</legend>
          <ul class="dold-lista">
            {del.kommentarer.map((k) => {
              const tid = `${id}-${k.post.nyckel}`
              return (
                <li key={k.post.nyckel} class={k.borttagen ? 'borttagen' : undefined}>
                  <label class="faltetikett liten" for={tid}>
                    {texter.doldKommentarRubrik(k.platser, k.post.forfattare)}
                  </label>
                  <textarea
                    id={tid}
                    class="textfalt textyta"
                    rows={2}
                    value={k.text}
                    disabled={k.borttagen}
                    onInput={(e) => {
                      const v = (e.target as HTMLTextAreaElement).value
                      andraText((nu) => sattKommentartext(nu, del.dokumentId, k.post.nyckel, v, k.post.text))
                    }}
                  />
                  <label class="val">
                    <input type="checkbox" checked={k.borttagen} onChange={(e) => andra((nu) => sattBorttagen(nu, del.dokumentId, k.post.nyckel, (e.target as HTMLInputElement).checked, 'kommentar'))} />
                    <span>{texter.doldTaBortKommentar}</span>
                  </label>
                </li>
              )
            })}
          </ul>
        </fieldset>
      )}

      {del.bilagor.length > 0 && (
        <fieldset class="valgrupp">
          <legend class="faltetikett">{texter.doldBilagor(del.bilagor.length)}</legend>
          <p class="dampad liten">{texter.doldBilagorPdfa}</p>
          <ul class="dold-lista">
            {del.bilagor.map((b) => (
              <li key={b.post.nyckel} class={b.borttagen ? 'borttagen' : undefined}>
                <label class="val">
                  <input type="checkbox" checked={b.borttagen} onChange={(e) => andra((nu) => sattBorttagen(nu, del.dokumentId, b.post.nyckel, (e.target as HTMLInputElement).checked, 'bilaga'))} />
                  <span>
                    {texter.doldTaBortBilaga(b.post.namn)}
                    <span class="dampad liten blocktext">{texter.doldBilagaDetalj(b.post.storlek, b.platser)}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      )}

      {del.falt.length > 0 && (
        <fieldset class="valgrupp">
          <legend class="faltetikett">{texter.doldFalt(del.falt.length)}</legend>
          <p class="dampad liten">{texter.doldFaltHjalp}</p>
          <ul class="dold-lista">
            {del.falt.map((f) => (
              <li key={f.post.namn} class={f.borttagen ? 'borttagen' : undefined}>
                <label class="val">
                  <input type="checkbox" checked={f.borttagen} onChange={(e) => andra((nu) => sattFaltBorttaget(nu, del.dokumentId, f.post.namn, (e.target as HTMLInputElement).checked))} />
                  <span>
                    {texter.doldTaBortFalt(f.post.namn)}
                    <span class="dampad liten blocktext brytbar">{texter.doldFaltDetalj(f.post.varde, f.platser)}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      )}

      {del.skript.length > 0 && (
        <div class="meddelande">
          <Ikon namn="skold" />
          <div>
            <p>
              <strong>{texter.doldAlltidBort}</strong>
            </p>
            <ul class="dold-skript">
              {del.skript.map((s) => (
                <li key={`${s.kod}-${s.sidindex}`}>{texter.doldSkript(s.kod, s.platser)}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}
