// FEAT-002: FR-FIL-006, FR-FIL-009, FR-FIL-010 och meddelandenas innehåll (FR-ALM-006).
import { describe, expect, it } from 'vitest'
import { felmeddelande, forkontroll, MAX_FILSTORLEK, sidgrans } from '../../src/karna/validering'

const b = (s: string) => new TextEncoder().encode(s)

describe('förkontroll', () => {
  it('godtar en fil som börjar med %PDF-, även efter skräp i början', () => {
    expect(forkontroll(10, b('%PDF-1.7\n'))).toBeNull()
    expect(forkontroll(10, b('\n\n  %PDF-1.4'))).toBeNull()
  })
  it('avvisar annat än PDF (FR-FIL-006)', () => {
    expect(forkontroll(10, b('Det här är ingen PDF.'))).toBe('inte-pdf')
    expect(forkontroll(10, b('\x89PNG\r\n'))).toBe('inte-pdf')
  })
  it('avvisar filer över 100 MB men inte exakt 100 MB (FR-FIL-009)', () => {
    expect(forkontroll(MAX_FILSTORLEK, b('%PDF-'))).toBeNull()
    expect(forkontroll(MAX_FILSTORLEK + 1, b('%PDF-'))).toBe('for-stor')
  })
})

describe('sidgräns (FR-FIL-010)', () => {
  it('tillåter upp till 500 sidor totalt', () => {
    expect(sidgrans(400, 100)).toBeNull()
    expect(sidgrans(401, 100)).toBe('for-manga-sidor')
  })
})

describe('meddelanden', () => {
  it('namnger filen, orsaken och vad man kan göra', () => {
    expect(felmeddelande('inte-pdf', 'Bild.png')).toMatch(/^Bild\.png är ingen PDF-fil.*Bara PDF-filer/)
    expect(felmeddelande('for-stor', 'Stor.pdf')).toContain('100 MB')
    expect(felmeddelande('losenord', 'L.pdf')).toContain('lösenordsskyddad')
    expect(felmeddelande('skadad', 'S.pdf')).toContain('skadad')
    expect(felmeddelande('for-manga-sidor', 'X.pdf', 450)).toContain('redan 450 sidor')
  })
})
