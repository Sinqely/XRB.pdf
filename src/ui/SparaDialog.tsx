// Spara-dialogen SCR-APP-005 (FEAT-001 ui-design.md) med formatval (FEAT-009) och
// arkivformat-varningen SCR-APP-006 (FR-SPA-005, FR-SPA-006): filnamn, format, sparar, hinder, fel.
import { useEffect, useRef, useState } from 'preact/hooks'
import { texter } from '../karna/texter'
import type { Arbetsyta, Format } from '../karna/typer'
import { bygg } from '../bygg/bygg-klient'
import type { Hinder } from '../bygg/pdfa'
import { foreslaFilnamn, hinderPerSida, laddaNed, sparaResultat, stadaFilnamn } from './spara'
import { Ikon } from './ikoner'
import { laddaSnitt } from './typsnitt'

interface Props {
  yta: Arbetsyta
  stang: (sparat: { filnamn: string; format: Format } | null) => void
  status: (text: string) => void
  /** Tar bort resultatsidorna som ett ångra-steg och ger den nya arbetsytan. */
  taBortSidor: (resultatIds: string[]) => Arbetsyta
}

export function SparaDialog({ yta: startyta, stang, status, taBortSidor }: Props) {
  const dlg = useRef<HTMLDialogElement>(null)
  const falt = useRef<HTMLInputElement>(null)
  const hinderRubrik = useRef<HTMLHeadingElement>(null)
  const [yta, sattYta] = useState(startyta)
  const forslag = foreslaFilnamn(startyta)
  const [namn, sattNamn] = useState(forslag)
  const [format, sattFormat] = useState<Format>(startyta.sparval.format)
  const [sparar, sattSparar] = useState<null | 'kontrollerar' | 'sparar'>(null)
  const [fel, sattFel] = useState<string | null>(null)
  const [hinder, sattHinder] = useState<Hinder[] | null>(null)
  const filer = new Set(yta.resultat.map((r) => r.dokumentId)).size

  useEffect(() => {
    dlg.current!.showModal()
    const f = falt.current!
    f.focus()
    f.setSelectionRange(0, forslag.toLowerCase().endsWith('.pdf') ? forslag.length - 4 : forslag.length)
  }, [])
  useEffect(() => {
    if (hinder) hinderRubrik.current?.focus()
  }, [hinder])

  async function spara(nuYta: Arbetsyta, nuFormat: Format) {
    if (sparar) return
    const filnamn = stadaFilnamn(namn, forslag)
    sattSparar(nuFormat === 'pdfa' ? 'kontrollerar' : 'sparar')
    sattFel(null)
    sattHinder(null)
    status(nuFormat === 'pdfa' ? texter.kontrollerar : texter.sparar)
    const ut = await sparaResultat(nuYta, filnamn, nuFormat, { bygg, ladda: laddaNed, typsnitt: async (t, f, k) => (await laddaSnitt(t, f, k)).bytes })
    sattSparar(null)
    if (ut.ok) {
      status(texter.sparad(ut.filnamn))
      dlg.current?.close()
      stang({ filnamn: ut.filnamn, format })
    } else if ('hinder' in ut) {
      sattHinder(ut.hinder)
      status(texter.hinderRubrik)
    } else {
      sattFel(ut.meddelande)
      status(ut.meddelande)
    }
  }

  const avbryt = () => {
    if (sparar) return
    dlg.current?.close()
    stang(null)
  }

  const sidor = hinder ? hinderPerSida(yta, hinder) : []
  const allaHarHinder = sidor.length >= yta.resultat.length

  return (
    <dialog
      ref={dlg}
      class="dialog"
      aria-labelledby={hinder ? 'hinder-rubrik' : 'spara-rubrik'}
      onCancel={(e) => {
        e.preventDefault()
        if (hinder) {
          sattHinder(null)
          falt.current?.focus()
        } else avbryt()
      }}
    >
      {hinder ? (
        <div class="dialoginnehall">
          <h2 id="hinder-rubrik" class="mellanrubrik" tabIndex={-1} ref={hinderRubrik}>
            {texter.hinderRubrik}
          </h2>
          <div class="meddelande meddelande-varning">
            <Ikon namn="varning" />
            <div>
              <p>
                <strong>{texter.hinderText(sidor.length)}</strong>
              </p>
              <p>{allaHarHinder ? texter.hinderTaBortAlla : texter.hinderVal}</p>
            </div>
          </div>
          <ul class="hinderlista" aria-label={texter.hinderRubrik}>
            {sidor.map((s) => (
              <li key={s.resultatId}>
                <strong>{s.rubrik}</strong>
                <ul>
                  {s.orsaker.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          {sparar && (
            <div class="vantindikator" aria-live="polite">
              <span class="snurra" aria-hidden="true" />
              {sparar === 'kontrollerar' ? texter.kontrollerar : texter.sparar}
            </div>
          )}
          <div class="dialogknappar">
            <button
              type="button"
              class="knapp-sekundar"
              aria-disabled={!!sparar}
              onClick={() => {
                if (sparar) return
                sattHinder(null)
                falt.current?.focus()
              }}
            >
              {texter.avbryt}
            </button>
            {!allaHarHinder && (
              <button
                type="button"
                class="knapp-sekundar"
                aria-disabled={!!sparar}
                onClick={() => {
                  if (sparar) return
                  const ny = taBortSidor(sidor.map((s) => s.resultatId))
                  sattYta(ny)
                  status(texter.hinderBorttagna(sidor.length))
                  void spara(ny, 'pdfa')
                }}
              >
                <Ikon namn="taBort" />
                {texter.hinderTaBort(sidor.length)}
              </button>
            )}
            <button
              type="button"
              class="knapp-primar"
              aria-disabled={!!sparar}
              onClick={() => {
                if (sparar) return
                // Reservvägen ändrar inte det valda formatet till nästa gång.
                void spara(yta, 'pdf')
              }}
            >
              <Ikon namn="ladda" />
              {texter.hinderVanlig}
            </button>
          </div>
        </div>
      ) : (
        <form
          method="dialog"
          onSubmit={(e) => {
            e.preventDefault()
            void spara(yta, format)
          }}
          aria-busy={sparar ? 'true' : undefined}
        >
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
              aria-disabled={!!sparar}
              readOnly={!!sparar}
              onInput={(e) => sattNamn((e.target as HTMLInputElement).value)}
            />
            <span id="filnamn-hjalp" class="dampad liten">{texter.filnamnHjalp}</span>
          </label>
          <fieldset class="valgrupp" disabled={!!sparar}>
            <legend class="faltetikett">{texter.format}</legend>
            {(
              [
                ['pdfa', texter.formatPdfa, texter.formatPdfaHjalp],
                ['pdf', texter.formatPdf, texter.formatPdfHjalp],
              ] as const
            ).map(([v, rubrik, hjalp]) => (
              <label class="val" key={v}>
                <input type="radio" name="format" value={v} checked={format === v} onChange={() => sattFormat(v)} aria-describedby={`format-${v}-hjalp`} />
                <span>
                  {rubrik}
                  <span id={`format-${v}-hjalp`} class="dampad liten blocktext">
                    {hjalp}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>
          {sparar && (
            <div class="vantindikator">
              <span class="snurra" aria-hidden="true" />
              {sparar === 'kontrollerar' ? texter.kontrollerar : texter.sparar}
            </div>
          )}
          <div class="dialogknappar">
            <button type="button" class="knapp-sekundar" aria-disabled={!!sparar} onClick={avbryt}>
              {texter.avbryt}
            </button>
            <button type="submit" class="knapp-primar" aria-disabled={!!sparar}>
              <Ikon namn="ladda" />
              {texter.spara}
            </button>
          </div>
        </form>
      )}
    </dialog>
  )
}
