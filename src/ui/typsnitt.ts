// Etikettens typsnitt (ADR-007): tolv inbakade TTF-filer (OFL). Samma fil ger förhandsvisningen (FontFace),
// måtten (fontkit) och PDF-inbäddningen (skickas till bygg-arbetstråden). Avkodas först när de behövs.
import { useEffect, useState } from 'preact/hooks'
import fontkit from '@pdf-lib/fontkit'
import type { Glyfkalla } from '../karna/etikett'
import type { Typsnitt } from '../karna/typer'
import sans400n from '../resurser/typsnitt/etikett/carlito-400-normal.ttf?inline'
import sans400k from '../resurser/typsnitt/etikett/carlito-400-italic.ttf?inline'
import sans700n from '../resurser/typsnitt/etikett/carlito-700-normal.ttf?inline'
import sans700k from '../resurser/typsnitt/etikett/carlito-700-italic.ttf?inline'
import serif400n from '../resurser/typsnitt/etikett/tinos-400-normal.ttf?inline'
import serif400k from '../resurser/typsnitt/etikett/tinos-400-italic.ttf?inline'
import serif700n from '../resurser/typsnitt/etikett/tinos-700-normal.ttf?inline'
import serif700k from '../resurser/typsnitt/etikett/tinos-700-italic.ttf?inline'
import mono400n from '../resurser/typsnitt/etikett/cousine-400-normal.ttf?inline'
import mono400k from '../resurser/typsnitt/etikett/cousine-400-italic.ttf?inline'
import mono700n from '../resurser/typsnitt/etikett/cousine-700-normal.ttf?inline'
import mono700k from '../resurser/typsnitt/etikett/cousine-700-italic.ttf?inline'

const filer: Record<string, string> = {
  'sans-400-normal': sans400n, 'sans-400-italic': sans400k, 'sans-700-normal': sans700n, 'sans-700-italic': sans700k,
  'serif-400-normal': serif400n, 'serif-400-italic': serif400k, 'serif-700-normal': serif700n, 'serif-700-italic': serif700k,
  'mono-400-normal': mono400n, 'mono-400-italic': mono400k, 'mono-700-normal': mono700n, 'mono-700-italic': mono700k,
}

export interface Etikettsnitt {
  readonly nyckel: string
  readonly bytes: Uint8Array
  readonly font: Glyfkalla
  /** CSS-familjen som förhandsvisningen ritar med. */
  readonly familj: string
}

const nyckel = (t: Typsnitt, fet: boolean, kursiv: boolean) => `${t}-${fet ? 700 : 400}-${kursiv ? 'italic' : 'normal'}`
const laddade = new Map<string, Etikettsnitt>()
const pagar = new Map<string, Promise<Etikettsnitt>>()

function avkoda(dataUrl: string): Uint8Array {
  const bin = atob(dataUrl.slice(dataUrl.indexOf(',') + 1))
  const ut = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) ut[i] = bin.charCodeAt(i)
  return ut
}

/** Laddar snittet: avkodar filen, läser den med fontkit och registrerar den för förhandsvisningen. */
export function laddaSnitt(t: Typsnitt, fet: boolean, kursiv: boolean): Promise<Etikettsnitt> {
  const k = nyckel(t, fet, kursiv)
  const klar = laddade.get(k)
  if (klar) return Promise.resolve(klar)
  let p = pagar.get(k)
  if (!p) {
    p = (async () => {
      const bytes = avkoda(filer[k]!)
      const font = fontkit.create(bytes) as unknown as Glyfkalla
      const familj = `PDF-bagaren etikett ${k}`
      const ff = new FontFace(familj, bytes.slice().buffer)
      document.fonts.add(await ff.load())
      const s = { nyckel: k, bytes, font, familj }
      laddade.set(k, s)
      return s
    })()
    pagar.set(k, p)
  }
  return p
}

/** Snittet för etiketten, eller null medan det laddas (komponenten ritas om när det är klart). */
export function useSnitt(t: Typsnitt | undefined, fet = false, kursiv = false): Etikettsnitt | null {
  const k = t ? nyckel(t, fet, kursiv) : ''
  const [, satt] = useState(0)
  useEffect(() => {
    if (t && !laddade.has(k)) void laddaSnitt(t, fet, kursiv).then(() => satt((n) => n + 1))
  }, [k])
  return t ? (laddade.get(k) ?? null) : null
}
