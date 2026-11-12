// Kolumn 1 Filer i SCR-APP-001 (FEAT-001 ui-design.md): släppyta, dokumentkort och miniatyrrutnät.
import { texter } from '../karna/texter'
import { Hjalpknapp, type Hjalpavsnitt } from './Hjalp'
import { arVald, laggTillAlla, taBortAlla, taBortDokument, vaxlaSida, type Andring } from '../karna/arbetsyta'
import type { Arbetsyta, Dokument } from '../karna/typer'
import { Ikon } from './ikoner'
import { miniatyr, useMiniatyrer } from './dokumentregister'

interface Props {
  /** Öppnar hjälpen vid ett avsnitt (FR-DOK-001). */
  hjalp: (a: Hjalpavsnitt) => void
  yta: Arbetsyta
  andra: (fn: (y: Arbetsyta) => Andring) => void
  oppnaFilval: () => void
  dragOver: boolean
  lasesIn: string | null
  fel: string[]
  stangFel: (i: number) => void
}

export function Filkolumn({ yta, andra, oppnaFilval, dragOver, lasesIn, fel, stangFel, hjalp }: Props) {
  useMiniatyrer()
  const tom = yta.dokument.length === 0 && !lasesIn
  return (
    <section class="kolumn" aria-labelledby="rubrik-filer" aria-busy={lasesIn ? 'true' : undefined}>
      <div class="kolumnhuvud">
        <h2 id="rubrik-filer" class="kolumnrubrik">
          <span class="steg" aria-hidden="true">1</span>
          {texter.kolumnFiler}
        </h2>
        <Hjalpknapp avsnitt="lasaIn" oppna={hjalp} />
      </div>
      {fel.map((f, i) => (
        <div key={`${i}-${f}`} class="meddelande meddelande-fel" role="alert">
          <p>{f}</p>
          <button type="button" class="ikonknapp" aria-label={texter.stang} title={texter.stang} onClick={() => stangFel(i)}>
            <Ikon namn="kryss" />
          </button>
        </div>
      ))}
      <button type="button" class={`slappyta${tom ? ' slappyta-stor' : ''}${dragOver ? ' slappyta-drag' : ''}`} onClick={oppnaFilval}>
        <Ikon namn="moln" storlek={28} />
        <span>
          <strong>{dragOver ? texter.slappNu : tom ? texter.slappForsta : texter.slappFler}</strong>
          <span class="dampad">{texter.slappEllerKlicka}</span>
        </span>
      </button>
      {tom && <p class="dampad liten">{texter.ingress}</p>}
      <ul class="dokumentlista">
        {yta.dokument.map((d) => (
          <Dokumentkort key={d.id} d={d} yta={yta} andra={andra} />
        ))}
        {lasesIn && (
          <li class="dokumentkort">
            <div class="vantindikator">
              <span class="snurra" aria-hidden="true" />
              {texter.lasesIn(lasesIn)}
            </div>
          </li>
        )}
      </ul>
    </section>
  )
}

function Dokumentkort({ d, yta, andra }: { d: Dokument; yta: Arbetsyta; andra: Props['andra'] }) {
  const valda = Array.from({ length: d.sidantal }, (_, i) => arVald(yta, d.id, i))
  const allaValda = valda.every(Boolean)
  const ingaValda = !valda.some(Boolean)
  const forkl = (id: string, text: string) => <span id={id} class="dold-for-oga">{text}</span>
  return (
    <li class="dokumentkort">
      <div class="dokumenthuvud">
        <div>
          <h3 class="dokumentnamn">{d.namn}</h3>
          <p class="dampad liten">
            {texter.sidor(d.sidantal)} · {texter.storlek(d.storlekByte)}
          </p>
        </div>
        <button
          type="button"
          class="ikonknapp"
          aria-label={texter.taBortFil(d.namn)}
          title={texter.taBortFil(d.namn)}
          onClick={() => andra((y) => taBortDokument(y, d.id))}
        >
          <Ikon namn="taBort" />
        </button>
      </div>
      <div class="knapprad">
        <button
          type="button"
          class="knapp-sekundar knapp-liten"
          aria-disabled={allaValda}
          aria-describedby={allaValda ? `alla-${d.id}` : undefined}
          onClick={() => !allaValda && andra((y) => laggTillAlla(y, d.id))}
        >
          <Ikon namn="plus" storlek={16} />
          {texter.laggTillAlla}
        </button>
        {allaValda && forkl(`alla-${d.id}`, texter.allaRedanValda)}
        <button
          type="button"
          class="knapp-sekundar knapp-liten"
          aria-disabled={ingaValda}
          aria-describedby={ingaValda ? `inga-${d.id}` : undefined}
          onClick={() => !ingaValda && andra((y) => taBortAlla(y, d.id))}
        >
          {texter.taBortUrResultatet}
        </button>
        {ingaValda && forkl(`inga-${d.id}`, texter.ingaValda)}
      </div>
      <ul class="miniatyrnat">
        {valda.map((vald, i) => {
          const m = miniatyr(d.id, i)
          return (
            <li key={i}>
              <button
                type="button"
                class={`miniatyr${vald ? ' vald' : ''}`}
                aria-pressed={vald}
                aria-label={vald ? texter.miniatyrVald(i + 1, d.sidantal, d.namn) : texter.miniatyr(i + 1, d.sidantal, d.namn)}
                onClick={() => andra((y) => vaxlaSida(y, d.id, i))}
              >
                <Sidbild m={m} />
                {vald && (
                  <span class="valdmarke" aria-hidden="true">
                    <Ikon namn="bock" storlek={12} />
                    {texter.vald}
                  </span>
                )}{' '}
                <span class="sidtext" aria-hidden="true">
                  {texter.sidaKort(i + 1)}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </li>
  )
}

export function Sidbild({ m }: { m: ReturnType<typeof miniatyr> }) {
  if (m === null) return <span class="sidbild sidbild-platta">{texter.ritar}</span>
  if (m === 'fel') return <span class="sidbild sidbild-platta">{texter.sidanKundeInteVisas}</span>
  return <img class="sidbild" src={m} alt="" />
}
