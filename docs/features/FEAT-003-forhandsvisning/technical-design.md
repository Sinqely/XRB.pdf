# Teknisk design: FEAT-003 – Förhandsvisning av resultatet

> Implementerar: FR-FHV-001..005, FR-FHV-007..010 · Realiserar: UC-002 · Skärm: SCR-APP-001 (förhandsvisningen)
> Status: Byggd utan separat G4 (Ägarens beslut 2026-11-12, samlad granskning) · Datum: 2026-11-12

## Design
- **pdf.js-adaptern** får `sidmatt(pdf, sidindex, vridning)` (punkter efter /Rotate och extra vridning) och `ritaSida(pdf, sidindex, canvas, skala, vridning)` som ritar på en dold canvas och kopierar, så att den synliga inte blinkar; ritningen kan avbrytas när användaren bläddrar vidare.
- **`Forhandsvisning.tsx`** visar resultatets aktiva sida. Aktiv sida är UI-tillstånd i `App.tsx`, inte i arbetsytan (så att bläddring inte blir ångra-steg). Tas den aktiva sidan bort visas sidan som tog dess plats.
- Skala: "Anpassa" (standard, hela sidan syns) eller fast värde 25–400 % med Zooma in/ut (FR-FHV-008, Should).
- Tangenter när ytan har fokus: Vänster/Upp/Page Up föregående, Höger/Ner/Page Down nästa, Home/End första/sista (FR-FHV-009).
- Under sidan: "Sida N av M · ur <dokument>, sida K" (FR-FHV-003, FR-FHV-007) med Föregående/Nästa.
- Överlägg (stämpel, etikett, säkerhetsmarginal) ritas av FEAT-006/007 via egenskapen `overlagg`, i samma koordinater som sidan (punkter × skala).
- Tomt resultat: de tre stegen (FR-FHV-010).
- Resultatraden markerar aktiv sida med ram 3 px `--ui-text` och `aria-current`; klick eller fokus på en sida visar den (FR-FHV-004).

## Acceptanskriterier
Prövas i `tests/e2e/feat-003.spec.ts`: förklaring vid tomt resultat, första sidan visas med plats och ursprung, Nästa, val i raden, piltangenter och Page Down, ändring syns inom 1 s (NFR-PERF-001), borttagen aktiv sida, zoom.
