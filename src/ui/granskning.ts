// Granskningen av dold information per dokument-id (FEAT-008), bara i minnet (FR-ALM-008).
// Görs i bygg-arbetstråden första gången panelen behöver dokumentet.
import { useEffect, useState } from 'preact/hooks'
import { granskaDokument } from '../bygg/bygg-klient'
import type { Granskning } from '../karna/dold'
import type { Dokument } from '../karna/typer'

const resultat = new Map<string, Granskning | 'fel' | 'lases'>()

export interface Granskningslage {
  readonly klara: Readonly<Record<string, Granskning>>
  /** Dokument som inte gick att läsa. */
  readonly fel: readonly string[]
  readonly lases: boolean
}

export function useGranskning(dokument: readonly Dokument[]): Granskningslage {
  const [, sattVersion] = useState(0)
  const nyckel = dokument.map((d) => d.id).join(',')
  useEffect(() => {
    let aktiv = true
    for (const d of dokument) {
      if (resultat.has(d.id)) continue
      resultat.set(d.id, 'lases')
      granskaDokument(d.bytes).then(
        (g) => resultat.set(d.id, g),
        () => resultat.set(d.id, 'fel'),
      ).finally(() => aktiv && sattVersion((v) => v + 1))
    }
    return () => {
      aktiv = false
    }
  }, [nyckel])
  const klara: Record<string, Granskning> = {}
  const fel: string[] = []
  let lases = false
  for (const d of dokument) {
    const r = resultat.get(d.id)
    if (r === 'fel') fel.push(d.id)
    else if (r === 'lases' || r === undefined) lases = true
    else klara[d.id] = r
  }
  return { klara, fel, lases }
}

/** Glömmer granskningar för dokument som inte längre finns. */
export function stadaGranskningar(kvar: ReadonlySet<string>) {
  for (const id of [...resultat.keys()]) if (!kvar.has(id)) resultat.delete(id)
}
