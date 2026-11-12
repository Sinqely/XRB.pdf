// Skalet för SCR-APP-001 Arbetsyta (docs/ux-foundations.md; FEAT-001 ui-design.md).
import { useEffect, useRef, useState } from 'preact/hooks'
import { texter } from '../karna/texter'
import { lasTema, sattTema, type Tema } from '../karna/tema'
import { skapaTillstand } from '../karna/tillstand'
import type { Andring } from '../karna/arbetsyta'
import type { Arbetsyta } from '../karna/typer'
import { filerUrSlapp, lasInFiler } from './inlasning'
import { Filkolumn } from './Filkolumn'
import { Resultatrad } from './Resultatrad'
import { Forhandsvisning } from './Forhandsvisning'
import { SparaDialog } from './SparaDialog'
import { Ikon } from './ikoner'
import { Bekrafta } from './Bekrafta'
import { stada } from './dokumentregister'

const tillstand = skapaTillstand()

export function App() {
  const [yta, sattYta] = useState<Arbetsyta>(tillstand.hamta())
  const [status, sattStatusText] = useState('')
  const [fel, sattFel] = useState<string[]>([])
  const [lasesIn, sattLasesIn] = useState<string | null>(null)
  const [dragOver, sattDragOver] = useState(false)
  const [dialog, sattDialog] = useState(false)
  const [sparad, sattSparad] = useState<Arbetsyta>(tillstand.hamta())
  const [borjaOmFraga, sattBorjaOmFraga] = useState(false)
  const [aktivOnskad, sattAktiv] = useState<string | null>(null)
  const senasteAktivPlats = useRef(0)
  const [tema, sattTemaVal] = useState<Tema>(lasTema())
  const filval = useRef<HTMLInputElement>(null)
  const bakaKnapp = useRef<HTMLButtonElement>(null)

  useEffect(
    () =>
      tillstand.lyssna((y) => {
        sattYta(y)
        stada(tillstand.dokumentIHistoriken())
      }),
    [],
  )

  // Osparat arbete: webbläsaren frågar innan fliken stängs eller laddas om (FR-ALM-004).
  const osparat = yta !== sparad && yta.dokument.length > 0
  useEffect(() => {
    if (!osparat) return
    const fraga = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', fraga)
    return () => window.removeEventListener('beforeunload', fraga)
  }, [osparat])

  function angra() {
    const m = tillstand.angra()
    if (m !== null) sattStatus(m ? texter.angrade(m) : texter.angradeUtan)
  }
  function gorOm() {
    const m = tillstand.gorOm()
    if (m !== null) sattStatus(m ? texter.gjordesOm(m) : texter.gjordesOmUtan)
  }

  // Kortkommandon Ctrl/Cmd+Z, Ctrl+Y och Cmd+Skift+Z; inte i textfält, där webbläsarens egen ångra gäller.
  useEffect(() => {
    const tangent = (e: KeyboardEvent) => {
      const mal = e.target as HTMLElement
      if (mal.closest('input, textarea, dialog')) return
      const mod = e.ctrlKey || e.metaKey
      if (!mod) return
      const k = e.key.toLowerCase()
      if (k === 'z' && !e.shiftKey) {
        e.preventDefault()
        angra()
      } else if (k === 'y' || (k === 'z' && e.shiftKey)) {
        e.preventDefault()
        gorOm()
      }
    }
    document.addEventListener('keydown', tangent)
    return () => document.removeEventListener('keydown', tangent)
  }, [])
  useEffect(() => sattTema(tema), [tema])

  // Samma meddelande två gånger i rad ska också läsas upp: töm först (design §5).
  function sattStatus(text: string) {
    if (!text) return
    sattStatusText('')
    requestAnimationFrame(() => sattStatusText(text))
  }

  function andra(fn: (y: Arbetsyta) => Andring) {
    let meddelande = ''
    tillstand.andra((nu) => {
      const a = fn(nu)
      meddelande = a.meddelande
      return a.yta
    }, () => meddelande)
    sattStatus(meddelande)
  }

  function lasIn(filer: Iterable<File>) {
    void lasInFiler(filer, tillstand, {
      status: sattStatus,
      fel: (t) => sattFel((f) => [...f, t]),
      lasesIn: sattLasesIn,
    })
  }

  // Släpp i hela fönstret, så att webbläsaren inte öppnar PDF:en själv (FR-FIL-002).
  useEffect(() => {
    let djup = 0
    const arFiler = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes('Files')
    const in_ = (e: DragEvent) => {
      if (!arFiler(e)) return
      djup++
      sattDragOver(true)
    }
    const ut = (e: DragEvent) => {
      if (!arFiler(e)) return
      djup = Math.max(0, djup - 1)
      if (djup === 0) sattDragOver(false)
    }
    const over = (e: DragEvent) => {
      if (arFiler(e)) e.preventDefault()
    }
    const slapp = (e: DragEvent) => {
      if (!arFiler(e)) return
      e.preventDefault()
      djup = 0
      sattDragOver(false)
      lasIn(filerUrSlapp(e))
    }
    document.addEventListener('dragenter', in_)
    document.addEventListener('dragleave', ut)
    document.addEventListener('dragover', over)
    document.addEventListener('drop', slapp)
    return () => {
      document.removeEventListener('dragenter', in_)
      document.removeEventListener('dragleave', ut)
      document.removeEventListener('dragover', over)
      document.removeEventListener('drop', slapp)
    }
  }, [])

  const tomt = yta.resultat.length === 0
  // Aktiv sida i förhandsvisningen: den valda om den finns kvar, annars sidan på samma plats (FR-FHV-004, FR-FHV-005).
  const aktivPlats = yta.resultat.findIndex((r) => r.id === aktivOnskad)
  if (aktivPlats >= 0) senasteAktivPlats.current = aktivPlats
  const aktivId = aktivPlats >= 0 ? aktivOnskad : (yta.resultat[Math.min(senasteAktivPlats.current, yta.resultat.length - 1)]?.id ?? null)
  const forklaring = yta.dokument.length === 0 ? texter.bakaIhopIngaFiler : texter.bakaIhopIngaSidor
  return (
    <div class="app">
      <header class="sidhuvud">
        <span class="appnamn">
          <span class="logga" aria-hidden="true">
            <Ikon namn="fil" storlek={18} />
          </span>
          {texter.appnamn}
        </span>
        <div class="verktyg">
          <span class="verktygsgrupp">
            <button type="button" class="knapp-text" aria-disabled={!tillstand.kanAngra()} aria-keyshortcuts="Control+Z" onClick={() => tillstand.kanAngra() && angra()}>
              <Ikon namn="angra" />
              {texter.angra}
            </button>
            <button type="button" class="knapp-text" aria-disabled={!tillstand.kanGorOm()} aria-keyshortcuts="Control+Y" onClick={() => tillstand.kanGorOm() && gorOm()}>
              <Ikon namn="gorOm" />
              {texter.gorOm}
            </button>
            <button type="button" class="knapp-text" aria-disabled={yta.dokument.length === 0} onClick={() => yta.dokument.length > 0 && sattBorjaOmFraga(true)}>
              <Ikon namn="borjaOm" />
              {texter.borjaOm}
            </button>
          </span>
          <button type="button" class="knapp-text" onClick={() => sattTemaVal(tema === 'mork' ? 'ljus' : 'mork')}>
            <Ikon namn={tema === 'mork' ? 'sol' : 'mane'} />
            {tema === 'mork' ? texter.temaLjust : texter.temaMorkt}
          </button>
          {tomt && (
            <span id="baka-forklaring" class="dampad liten">
              {forklaring}
            </span>
          )}
          <button
            ref={bakaKnapp}
            type="button"
            class="knapp-primar"
            aria-disabled={tomt}
            aria-describedby={tomt ? 'baka-forklaring' : undefined}
            onClick={() => !tomt && sattDialog(true)}
          >
            <Ikon namn="ladda" />
            {texter.bakaIhop}
          </button>
        </div>
      </header>

      <main class="kolumner">
        <Filkolumn
          yta={yta}
          andra={andra}
          oppnaFilval={() => filval.current?.click()}
          dragOver={dragOver}
          lasesIn={lasesIn}
          fel={fel}
          stangFel={(i) => sattFel((f) => f.filter((_, j) => j !== i))}
        />
        <input
          ref={filval}
          id="filval"
          type="file"
          accept="application/pdf,.pdf"
          multiple
          hidden
          onChange={(e) => {
            const el = e.target as HTMLInputElement
            if (el.files) lasIn(Array.from(el.files))
            el.value = ''
          }}
        />

        <section class="kolumn kolumn-mitt" aria-labelledby="rubrik-resultat">
          <Resultatrad yta={yta} andra={andra} aktivId={aktivId} sattAktiv={sattAktiv} />
          <Forhandsvisning yta={yta} aktivId={aktivId} sattAktiv={sattAktiv} />
        </section>

        <section class="kolumn" aria-labelledby="rubrik-markning">
          <h2 id="rubrik-markning" class="kolumnrubrik">
            <span class="steg" aria-hidden="true">3</span>
            {texter.kolumnMarkning}
          </h2>
          <p class="ingress-latt dampad">{texter.markningSenare}</p>
        </section>
      </main>

      <div class="statusyta" role="status" aria-live="polite">
        {status && <Ikon namn="bock" storlek={16} />}
        {status}
      </div>

      {borjaOmFraga && (
        <Bekrafta
          rubrik={texter.borjaOmRubrik}
          text={texter.borjaOmText}
          ja={texter.borjaOmJa}
          nej={texter.avbryt}
          svar={(ja) => {
            sattBorjaOmFraga(false)
            if (ja) {
              tillstand.borjaOm()
              sattSparad(tillstand.hamta())
              sattFel([])
              sattStatus(texter.borjadeOm)
            }
          }}
        />
      )}

      {dialog && (
        <SparaDialog
          yta={yta}
          status={sattStatus}
          stang={(sparatSom) => {
            sattDialog(false)
            if (sparatSom) {
              tillstand.ersatt((nu) => ({ ...nu, sparval: { ...nu.sparval, filnamn: sparatSom } }))
              sattSparad(tillstand.hamta())
            }
            bakaKnapp.current?.focus()
          }}
        />
      )}
    </div>
  )
}
