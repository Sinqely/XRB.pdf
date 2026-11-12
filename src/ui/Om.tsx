// Om PDF-bagaren SCR-APP-009 (FR-DOK-004..006) med Verifieringsrapport SCR-APP-010 (FR-DOK-007) och
// Tillgänglighetsredogörelse SCR-APP-011 (FR-DOK-008), FEAT-011. Innehållet genereras i bygget (scripts/om-data.mjs).
import { useEffect, useRef, useState } from 'preact/hooks'
import { omData } from '../karna/om-data'
import { texter } from '../karna/texter'
import { Ikon } from './ikoner'

type Vy = 'om' | 'rapport' | 'tillganglighet'

export function OmDialog({ stang }: { stang: () => void }) {
  const dlg = useRef<HTMLDialogElement>(null)
  const rubrik = useRef<HTMLHeadingElement>(null)
  const [vy, sattVy] = useState<Vy>('om')
  const [fran, sattFran] = useState<Vy | null>(null)
  useEffect(() => {
    dlg.current?.showModal()
  }, [])
  useEffect(() => {
    rubrik.current?.focus()
  }, [vy])
  const klar = () => {
    dlg.current?.close()
    stang()
  }
  const visa = (v: Vy) => {
    sattFran(vy)
    sattVy(v)
  }
  const titel = vy === 'om' ? texter.omRubrik : vy === 'rapport' ? texter.omRapport : texter.omTillganglighet
  return (
    <dialog
      ref={dlg}
      class="dialog dialog-stor"
      aria-labelledby="om-rubrik"
      onCancel={(e) => {
        e.preventDefault()
        if (vy !== 'om') sattVy('om')
        else klar()
      }}
    >
      <div class="dialoginnehall">
        <h2 id="om-rubrik" class="mellanrubrik" tabIndex={-1} ref={rubrik}>
          {titel}
        </h2>
        <div class="hjalp-innehall om-innehall" tabIndex={0} role="region" aria-labelledby="om-rubrik">
          {vy === 'om' ? (
            <>
              <p class="om-version">
                <strong>{omData.namn}</strong> {texter.omVersion(omData.version, omData.datum)}
              </p>
              <div class="meddelande">
                <Ikon namn="skold" />
                <p>
                  <strong>{texter.omInget}</strong>
                </p>
              </div>
              <div class="knapprad">
                <button type="button" class="knapp-sekundar" onClick={() => visa('rapport')}>
                  {texter.omVisaRapport}
                </button>
                <button type="button" class="knapp-sekundar" onClick={() => visa('tillganglighet')}>
                  {texter.omVisaTillganglighet}
                </button>
              </div>
              <section aria-labelledby="om-licenser">
                <h3 id="om-licenser" class="underrubrik">
                  {texter.omLicenser}
                </h3>
                <p>{texter.omLicenserIngress}</p>
                <table class="licenstabell">
                  <thead>
                    <tr>
                      <th scope="col">{texter.omNamn}</th>
                      <th scope="col">{texter.omVersionKolumn}</th>
                      <th scope="col">{texter.omLicens}</th>
                      <th scope="col">{texter.omTyp}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {omData.licenser.map((l) => (
                      <tr key={l.namn}>
                        <th scope="row" class="brytbar">
                          <details>
                            <summary>{l.namn}</summary>
                            <pre class="licenstext" tabIndex={0} aria-label={texter.omLicensFor(l.namn)}>{l.text}</pre>
                          </details>
                        </th>
                        <td>{l.version || '–'}</td>
                        <td>{l.licens}</td>
                        <td>{texter.omTypNamn[l.typ]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </>
          ) : (
            // Innehållet är appens egna dokument, omvandlade till HTML i bygget (inget från användaren).
            <div class="dokumenttext" dangerouslySetInnerHTML={{ __html: vy === 'rapport' ? omData.verifieringsrapport : omData.tillganglighet }} />
          )}
        </div>
        <div class="dialogknappar">
          {vy !== 'om' && (
            <button type="button" class="knapp-sekundar" onClick={() => sattVy(fran && fran !== vy ? fran : 'om')}>
              <Ikon namn="vanster" />
              {texter.omTillbaka}
            </button>
          )}
          <button type="button" class="knapp-primar" onClick={klar}>
            {texter.klar}
          </button>
        </div>
      </div>
    </dialog>
  )
}
