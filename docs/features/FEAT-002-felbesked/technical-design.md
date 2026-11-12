# Teknisk design: FEAT-002 – Tydliga felbesked och gränser vid inläsning

> Implementerar: FR-FIL-006..013 · Realiserar: UC-001 (undantag 3a, 3b) · Skärm: SCR-APP-001 (fel i område)
> Status: Byggd utan separat G4 (Ägarens beslut 2026-11-12) · Datum: 2026-11-12

## Design
- **`src/karna/validering.ts`** (ren): `forkontroll(storlek, första 1 024 byte)` → `for-stor` (> 100 MB, FR-FIL-009) eller `inte-pdf` (saknar `%PDF-`, FR-FIL-006); `sidgrans(redan, nya)` → `for-manga-sidor` (> 500 totalt, FR-FIL-010); `felmeddelande(fel, namn, redan)` med texter som säger vad som hände och vad man gör (FR-ALM-006).
- **Ordning i `inlasning.ts`:** förkontroll på de första 1 024 byten (hela filen läses inte om den är för stor) → pdf.js öppnar (lösenord → `losenord`, FR-FIL-008; annat fel → `skadad`, FR-FIL-007) → sidgräns. Arbetsytan ändras först när allt är godkänt, så felet rör bara den filen (architecture.md 8.3).
- Fel visas som `meddelande` (fel, `role="alert"`) överst i Filer-kolumnen, ett per fil, med stängknapp, och upprepas i statusytan (FR-FIL-013). Väntindikator med filnamnet medan filen läses (FR-FIL-011). Dubbletter får löpnummer (FR-FIL-012, redan i FEAT-001).
- Nya testfiler: `losenord.pdf` (krypterad med användarlösenord) och `skadad.pdf` (PDF-huvud utan giltig struktur).

## Acceptanskriterier
`tests/enhet/validering.test.ts` (gränser och texter) och `tests/e2e/feat-002.spec.ts` (fyra fel bland godkända filer, sidgränsen 500).
