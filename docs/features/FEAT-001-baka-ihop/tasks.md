# Uppgifter: FEAT-001 – Baka ihop sidor ur flera filer

> Genomför: docs/features/FEAT-001-baka-ihop/technical-design.md (och ui-design.md för skärmarna)
> Status per uppgift: ej påbörjad / pågår / klar · Senast uppdaterad: 2026-11-12

- [ ] T1 – Typer och tillstånd: `Resultatsida.id`, `Dokument.storlekByte`, `Arbetsyta.sparval`; ta bort `forstaMiniatyr` och `uppdateraDokument` (design §4; B1, B2)
      Klart när: `npm run typkontroll` och befintliga enhetstester går igenom; `tests/enhet/tillstand.test.ts` prövar att id:n är unika och att `uniktNamn` ger löpnummer.
- [ ] T2 – Arbetsyteoperationer i `src/karna/arbetsyta.ts` med meddelanden i `texter.ts` (design §3.1; FR-FIL-003, FR-FIL-005, FR-SID-002..009, FR-SID-014)
      Klart när: enhetstester för AC-3, AC-4, AC-6, AC-7, AC-9 (flytt och borttagning, även vid kanterna och med okänt id) och AC-10 (meddelandenas innehåll) går igenom.
- [ ] T3 – Miniatyrkö och `stangPdf` i `src/las/`, `dokumentregister.ts` i `src/ui/`; ny testfil med 100 sidor i `scripts/skapa-testfiler.mjs` (design §3.2, §5; FR-SID-001, NFR-PERF-002)
      Klart när: ett e2e-test läser in 100-sidorsfilen och ser alla miniatyrer inom 5 sekunder i Chromium (AC-17), och borttaget dokument frigör sina blob-adresser (kontrolleras i samma test via antalet `img` med `blob:`).
- [ ] T4 – Byggprotokoll med löpnummer och `Byggfel` i `bygg-klient.ts`/`bygg-arbetstrad.ts`; `src/ui/spara.ts` med `foreslaFilnamn`, `stadaFilnamn`, `sparaResultat` (design §3.3, §3.4; FR-SPA-001, FR-SPA-002, FR-SPA-012, FR-SPA-013; B4, B5)
      Klart när: enhetstester för AC-12 (förslag, städning, ändelse, tomt namn, löpnummer bort) och AC-14 (falsk `bygg` som kastar: utfallet är fel och arbetsytan samma objekt) går igenom; `export.test.ts` (AC-13, R8) går fortfarande igenom.
- [ ] T5 – Inläsning i `src/ui/inlasning.ts` med filväljare och släpp i hela fönstret (design §3.5; FR-FIL-001, FR-FIL-002)
      Klart när: inläsningen fungerar från filväljaren och från ett släpp i e2e (AC-1, AC-2), och ett fel i en fil lämnar övriga orörda.
- [ ] T6 – Gränssnittet enligt ui-design.md: släppyta, dokumentkort med knappar, miniatyrrutnät, resultatrad med dra och släpp, knappar och kortkommandon, spara-dialog, statusyta (design §5; SCR-APP-001, SCR-APP-005)
      Klart när: skärmarna visas enligt ui-design.md i mörkt och ljust tema, och all logik går genom `arbetsyta.ts` och `spara.ts` (inga tillståndsändringar direkt i komponenterna).
- [ ] T7 – E2E för DS-01 utan stämpel (UC-001, UC-002, UC-007): ett test med mus och dra och släpp, ett med bara tangentbord; skelettets test anpassas till B1 (design §6)
      Klart när: testen prövar AC-1..AC-16 i Chromium lokalt och i Chromium och WebKit i CI; den sparade filens sidor jämförs med källsidorna byte för byte och i rätt ordning; axe-core utan fel i tillstånden tom, med resultat och spara-dialog; noll nätverksanrop, även från `file://`.
- [ ] T8 – Verifiering: alla acceptanskriterier i design §6 visade; `npm test` grönt (lint med gränser och R1/R3, enhet, bygge med R2/R7, licenser, sårbarheter, e2e); CI grönt; CHANGELOG och version 0.2.0
      Klart när: allt ovan är grönt och acceptansrapporten kan skrivas (grind G5).
