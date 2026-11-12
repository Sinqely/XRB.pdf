// Inläsning och validering (FEAT-002; architecture.md 5.2 och 8.3). Rena funktioner: filen kontrolleras
// helt innan arbetsytan ändras, och ett fel rör bara den fil det gäller (FR-FIL-007).
import { texter } from './texter'

export const MAX_FILSTORLEK = 100 * 1024 * 1024
export const MAX_SIDOR = 500

export type Filfel = 'inte-pdf' | 'for-stor' | 'losenord' | 'skadad' | 'for-manga-sidor'

/** Kontroll före läsning: storlek och att filen börjar som en PDF (inom de första 1 024 byten, som läsare tillåter). */
export function forkontroll(storlekByte: number, borjan: Uint8Array): Filfel | null {
  if (storlekByte > MAX_FILSTORLEK) return 'for-stor'
  const text = String.fromCharCode(...borjan.subarray(0, 1024))
  return text.includes('%PDF-') ? null : 'inte-pdf'
}

export function sidgrans(redanInlasta: number, nya: number): Filfel | null {
  return redanInlasta + nya > MAX_SIDOR ? 'for-manga-sidor' : null
}

export function felmeddelande(fel: Filfel, namn: string, redanInlasta = 0): string {
  switch (fel) {
    case 'inte-pdf':
      return texter.felIntePdf(namn)
    case 'for-stor':
      return texter.felForStor(namn)
    case 'losenord':
      return texter.felLosenord(namn)
    case 'skadad':
      return texter.felSkadad(namn)
    case 'for-manga-sidor':
      return texter.felForMangaSidor(namn, redanInlasta)
  }
}
