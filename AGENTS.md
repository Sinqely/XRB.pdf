# PDF-bagaren – instruktioner för kodagenter

PDF-bagaren är en fristående webbapp som sätter ihop sidor ur flera PDF-filer och lägger på vattenstämpel och textetikett. Allt körs i webbläsaren och levereras som **en enda HTML-fil** som Ägaren lägger upp på SharePoint. Dialog och dokument är på svenska. I dokument kallas ägaren alltid "Ägaren".

## Dokument (läs före ändringar)

| Dokument | Innehåll |
| :-- | :-- |
| [docs/behov.md](docs/behov.md), [docs/systemkontext.md](docs/systemkontext.md) | Intressentbehov (BH/FV/BG/UB) och omgivning |
| [docs/srs.md](docs/srs.md), [docs/use-cases.md](docs/use-cases.md), [docs/rtm.md](docs/rtm.md) | Krav (EARS), användningsfall, spårbarhet |
| [docs/architecture.md](docs/architecture.md) | Arkitektur, ADR-001..010, testbara regler R1–R8 |
| [docs/ux-foundations.md](docs/ux-foundations.md) | Användare, flöden, skärmar SCR-APP-001..013 |
| [docs/design.md](docs/design.md), [docs/tokens.json](docs/tokens.json) | **Designsystemet (GP MS). Läs design.md före allt gränssnittsarbete.** tokens.json är enda källan för värden. |
| [docs/implementation-plan.md](docs/implementation-plan.md) | Funktioner FEAT-001..011 och byggordning |
| [docs/gates.md](docs/gates.md) | Grindlogg; inget går vidare utan Ägarens uttryckliga godkännande |
| [docs/scaffold-notes.md](docs/scaffold-notes.md) | Hur projektet sattes upp, avvikelser, vad som är stubbat |

## Kommandon

```
npm ci                 # installera
npm run dev            # utvecklingsserver (genererar tokens.css först)
npm run build          # bygger dist/index.html med CSP; kontrollerar R2 och R7
npm run lint           # ESLint med R1, R3 och byggblockens gränser
npm run test:enhet     # Vitest
npm run test:e2e       # Playwright i Chromium och WebKit mot den byggda filen
npm run licenser       # bara tillåtande licenser (NFR-LEG-001)
npm run sarbarheter    # inga höga/kritiska sårbarheter i inbakade bibliotek
npm test               # allt ovan i ordning
```

Lokalt i molnmiljön: `UTAN_WEBKIT=1 PW_CHROMIUM_PATH=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npm run test:e2e` (WebKit körs i CI).

## Struktur och gränser

```
src/ui/      gränssnitt (Preact). Får använda karna, las, bygg.
src/karna/   tillstånd, typer, texter, tema. Får inte importera ui, las eller bygg.
src/las/     pdf.js-adapter (läsa och rita). Får inte importera ui eller bygg.
src/bygg/    export, PDF/A, dold information; körs i bygg-arbetstråden. Får inte importera ui eller las.
src/resurser/ typsnitt och andra inbakade filer (med licensfiler).
scripts/     tokens-till-css, efter-bygge (CSP, R2, R7), skapa-testfiler
tests/       enhet/ (Vitest), e2e/ (Playwright), filer/ (testfiler utan känsligt innehåll)
```

Gränserna kontrolleras av ESLint (`eslint.config.js`).

## Regler som aldrig får brytas

- **Inga nätverksanrop** (R1, ADR-002). Inget får hämtas utifrån: inga CDN:er, typsnittstjänster, analys eller felrapporter. Allt bakas in.
- **Ingen beständig lagring av dokumentdata** (R3, FR-ALM-008). Bara `src/karna/tema.ts` får använda `localStorage`.
- **Sidornas innehåll ändras aldrig** (BG-009, R8). Sidor kopieras som objekt; ingen rastrering, ingen OCR.
- **Bara tillåtande licenser** (NFR-LEG-001): MIT, BSD, ISC, Apache-2.0, 0BSD, Zlib, OFL-1.1, CC0-1.0. Aldrig GPL eller AGPL.
- **Bara pdf.js-adaptern öppnar PDF:er med pdf.js** (R6); `pdf.sandbox` importeras aldrig.
- **Placering räknas bara i layoutmodellen** (R4, ADR-006) när den finns.
- **Alla texter på svenska** i `src/karna/texter.ts` (FR-ALM-006, FR-ALM-007).
- **Färger, avstånd och typsnitt bara via tokens** (docs/design.md §7). Ändra värden i docs/tokens.json, aldrig i genererade `src/ui/tokens.css`.
- **Tester försvagas eller hoppas aldrig över.** Varje Must-krav har minst ett automatiskt test (NFR-MAINT-004).
