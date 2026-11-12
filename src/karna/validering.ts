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

// Bilder för vattenstämpel (FR-STA-001, FR-STA-011, IF-02).
export const MAX_BILDSTORLEK = 20 * 1024 * 1024
export type Bildtyp = 'png' | 'jpeg'
export type Bildfel = 'fel-typ' | 'for-stor' | 'skadad'

/** Bildens typ ur filens första byte; filnamnets ändelse räknas inte. */
export function bildtyp(borjan: Uint8Array): Bildtyp | null {
  const b = borjan
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return 'png'
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpeg'
  return null
}

export function bildkontroll(storlekByte: number, borjan: Uint8Array): Bildfel | null {
  if (!bildtyp(borjan)) return 'fel-typ'
  if (storlekByte > MAX_BILDSTORLEK) return 'for-stor'
  return null
}

/**
 * Antal färgkomponenter i en JPEG (1 grå, 3 RGB, 4 CMYK), eller null om ramhuvudet saknas.
 * CMYK-bilder ritas om till RGB i webbläsaren, eftersom PDF/A-2b inte tillåter CMYK utan profil.
 */
export function jpegKomponenter(b: Uint8Array): number | null {
  let i = 2
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) return null
    const m = b[i + 1]!
    if (m === 0xd8 || (m >= 0xd0 && m <= 0xd7) || m === 0x01) {
      i += 2
      continue
    }
    const langd = (b[i + 2]! << 8) | b[i + 3]!
    // SOF0..SOF15 utom DHT (C4), JPG (C8) och DAC (CC)
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return b[i + 9]!
    i += 2 + langd
  }
  return null
}
