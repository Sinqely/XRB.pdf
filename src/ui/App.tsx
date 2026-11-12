// Skalet för SCR-APP-001 Arbetsyta (docs/ux-foundations.md, docs/design.md §3).
// Skelett: läsa in PDF, visa dokument och sidantal, spara en ihopbakad kopia.
import { useEffect, useRef, useState } from 'preact/hooks'
import { texter } from '../karna/texter'
import { lasTema, sattTema, type Tema } from '../karna/tema'
import { laggTillDokument, skapaTillstand, uniktNamn, uppdateraDokument } from '../karna/tillstand'
import type { Arbetsyta } from '../karna/typer'
import { oppnaPdf, ritaMiniatyr } from '../las/pdfjs-adapter'
import { bygg } from '../bygg/bygg-klient'

const tillstand = skapaTillstand()
let nastaId = 1

export function App() {
  const [yta, sattYta] = useState<Arbetsyta>(tillstand.hamta())
  const [status, sattStatus] = useState('')
  const [fel, sattFel] = useState<string | null>(null)
  const [upptagen, sattUpptagen] = useState(false)
  const [tema, sattTemaVal] = useState<Tema>(lasTema())
  const filval = useRef<HTMLInputElement>(null)

  useEffect(() => tillstand.lyssna(sattYta), [])
  useEffect(() => sattTema(tema), [tema])

  async function lasIn(filer: FileList | null) {
    if (!filer) return
    sattFel(null)
    for (const fil of Array.from(filer)) {
      sattStatus(texter.lasesIn(fil.name))
      try {
        const bytes = new Uint8Array(await fil.arrayBuffer())
        const { sidantal, pdf } = await oppnaPdf(bytes)
        const id = `dok-${nastaId++}`
        const namn = uniktNamn(fil.name, tillstand.hamta().dokument)
        tillstand.andra((nu) => laggTillDokument(nu, { id, namn, bytes, sidantal, forstaMiniatyr: null }))
        sattStatus(texter.inlast(namn, sidantal))
        ritaMiniatyr(pdf, 0, 88)
          .then((url) => tillstand.andra((nu) => uppdateraDokument(nu, id, { forstaMiniatyr: url })))
          .catch(() => undefined)
      } catch {
        sattFel(texter.kundeInteLasas(fil.name))
        sattStatus(texter.kundeInteLasas(fil.name))
      }
    }
    if (filval.current) filval.current.value = ''
  }

  async function spara() {
    if (yta.resultat.length === 0 || upptagen) return
    sattUpptagen(true)
    sattFel(null)
    sattStatus(texter.sparar)
    try {
      const dokument = Object.fromEntries(yta.dokument.map((d) => [d.id, d.bytes.slice()]))
      const bytes = await bygg({ dokument, sidor: yta.resultat })
      const namn = `${yta.dokument[0].namn.replace(/\.pdf$/i, '').replace(/ \(\d+\)$/, '')}-ihopbakad.pdf`
      const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = namn
      document.body.append(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
      sattStatus(texter.sparad(namn))
    } catch {
      sattFel(texter.sparFel)
      sattStatus(texter.sparFel)
    } finally {
      sattUpptagen(false)
    }
  }

  const tomt = yta.resultat.length === 0
  return (
    <div class="app">
      <header class="sidhuvud">
        <span class="appnamn">{texter.appnamn}</span>
        <div class="verktyg">
          <button type="button" class="knapp-text" onClick={() => sattTemaVal(tema === 'mork' ? 'ljus' : 'mork')}>
            {tema === 'mork' ? texter.temaLjust : texter.temaMorkt}
          </button>
          <button
            type="button"
            class="knapp-primar"
            aria-disabled={tomt || upptagen}
            aria-describedby={tomt ? 'baka-forklaring' : undefined}
            onClick={spara}
          >
            {upptagen ? texter.sparar : texter.bakaIhop}
          </button>
          {tomt && (
            <span id="baka-forklaring" class="dold-for-oga">
              {texter.bakaIhopInaktiv}
            </span>
          )}
        </div>
      </header>

      <main class="kolumner">
        <section class="kolumn" aria-labelledby="rubrik-filer">
          <h2 id="rubrik-filer" class="kolumnrubrik">{texter.kolumnFiler}</h2>
          <div class="slappyta">
            <p class="ingress-latt">{texter.slappInstruktion}</p>
            <button type="button" class="knapp-sekundar" onClick={() => filval.current?.click()}>
              {texter.valjFiler}
            </button>
            <input
              ref={filval}
              id="filval"
              type="file"
              accept="application/pdf,.pdf"
              multiple
              hidden
              onChange={(e) => lasIn((e.target as HTMLInputElement).files)}
            />
          </div>
          {fel && (
            <div class="meddelande meddelande-fel" role="alert">
              {fel}
            </div>
          )}
          <ul class="dokumentlista">
            {yta.dokument.map((d) => (
              <li key={d.id} class="dokumentkort">
                <div class="dokumentnamn">{d.namn}</div>
                <div class="metadata">{texter.sidor(d.sidantal)}</div>
                {d.forstaMiniatyr ? (
                  <img class="miniatyr" src={d.forstaMiniatyr} alt={texter.miniatyr(1, d.sidantal, d.namn)} width={88} />
                ) : (
                  <div class="miniatyr miniatyr-ritas">Ritar …</div>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section class="kolumn kolumn-mitt" aria-labelledby="rubrik-resultat">
          <h2 id="rubrik-resultat" class="kolumnrubrik">
            {texter.kolumnResultat} · {texter.sidor(yta.resultat.length)}
          </h2>
          {tomt ? <p class="ingress">{texter.ingress}</p> : null}
          <p class="metadata">{tomt ? texter.resultatTomt : null}</p>
        </section>

        <section class="kolumn" aria-labelledby="rubrik-markning">
          <h2 id="rubrik-markning" class="kolumnrubrik">{texter.kolumnMarkning}</h2>
          <p class="metadata">{texter.markningSenare}</p>
        </section>
      </main>

      <div class="statusyta" role="status" aria-live="polite">
        {status}
      </div>
    </div>
  )
}
