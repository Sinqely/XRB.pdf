# Anteckningar från projektuppsättningen

> Framtaget av project-scaffolding 2026-11-12 · Gäller det gångbara skelettet (docs/implementation-plan.md avsnitt 2)

## Uppsättningsplan (bekräftad genom G3)

- **En byggenhet**, som motsvarar arkitekturens enda behållare: HTML-filen med huvudtråd, läs-arbetstråd (pdf.js) och bygg-arbetstråd (pdf-lib) (architecture.md 5.1). Ingen monorepo, eftersom det bara finns en körbar enhet.
- **Stack** enligt ADR-001, ADR-003, ADR-004, ADR-008, ADR-009: TypeScript, Preact, Vite med vite-plugin-singlefile, pdfjs-dist, @cantoo/pdf-lib med @pdf-lib/fontkit, Vitest, Playwright, axe-core.
- **Pakethanterare:** npm (följer med Node; inget annat angavs).
- **Ingen databas, ingen server, ingen driftsättning.** Ägaren laddar själv upp filen (ADR-010, docs/forvaltning.md).

## Generator

| Enhet | Generator | Version | Flaggor |
| :-- | :-- | :-- | :-- |
| app (repo-roten) | `npm create vite@latest pdf-bagaren -- --template preact-ts --no-interactive` | create-vite 9.3.4 (Vite 8.3, Preact 11, TypeScript 7.0 i mallen) | Genererad i tillfällig mapp och kopierad till repo-roten utan att skriva över README.md och docs/ |

Borttaget ur mallen: exempelbilder, `public/`, mallens CSS och demokomponent, favicon-länk (en extern ikonfil skulle bryta en-fil-regeln).

## Versioner (låsta exakt i package-lock.json)

| Paket | Version | Licens | Roll |
| :-- | :-- | :-- | :-- |
| preact | 11.x | MIT | Gränssnitt (ADR-008) |
| pdfjs-dist | 6.5.438 | Apache-2.0 | Läsa och rita (ADR-003) |
| @cantoo/pdf-lib | 2.11.1 | MIT | Bygga resultatet (ADR-004) |
| @pdf-lib/fontkit | 1.1.1 | MIT | Typsnitt (ADR-007), används från FEAT-007 |
| Carlito (4 snitt, WOFF2) | ur GP MS | OFL-1.1 | Gränssnittets typsnitt; licens i `src/resurser/typsnitt/OFL-Carlito.txt` |
| vite / vite-plugin-singlefile | 8.3 / 2.3.4 | MIT | Bygge (ADR-009) |
| typescript | 6.0.3 | Apache-2.0 | Se avvikelse 1 |
| vitest, @playwright/test, axe-core, eslint, typescript-eslint | 5.1 / 1.65 / 4.14 / 10.14 / 8.72 | MIT/Apache-2.0/MPL-2.0 | Bara utvecklingsverktyg; följer inte med appen |

## Avvikelser och beslut

1. **TypeScript 6.0 i stället för mallens 7.0.** typescript-eslint stöder bara TypeScript under 6.1. Lintreglerna R1 och R3 och byggblockens gränser kräver typescript-eslint, så TypeScript låstes till 6.0.3. Byt till 7 när typescript-eslint stöder det.
2. **pdf.js 6 har inte längre inställningen `isEvalSupported`.** pdf.js använder inte `eval` (kontrollerat i källan) och CSP saknar `unsafe-eval`. Regel R6 kontrolleras därför genom att pdf.js bara används i `src/las/pdfjs-adapter.ts` och att `pdf.sandbox` aldrig importeras. Förslag: justera texten i ADR-003/R6 vid nästa arkitekturändring.
3. **Arbetstrådar bakas in med Vites `?worker&inline`** och startas från `blob:`-adresser. CSP: `worker-src blob:`.
4. **CSP sätts efter bygget** (`scripts/efter-bygge.mjs`) med sha256-hash för det inbakade skriptet, eftersom innehållet först är känt då. Utvecklingsservern (`npm run dev`) har ingen CSP; spärren prövas alltid mot den byggda filen.
5. **Sparande med `<a download>`** och en blob-adress. Det är en navigering, inte en anslutning, och spärras inte av `connect-src 'none'`.
6. **Webbläsartest lokalt bara i Chromium.** Molnmiljön har en förinstallerad Chromium och får inte installera fler. WebKit körs i GitHub Actions.
7. **Täckning:** rapport med `vitest --coverage` vid behov, ingen tröskel (architecture.md 8.7, report-only). Täckningsverktyget (`@vitest/coverage-v8`) installeras när det behövs första gången.
9. **Öppnad direkt från disken (`file://`) fastnar inläsningen i Chromium.** pdf.js arbetstråd startar men svarar inte när sidan har ursprunget `null`. Över http/https (SharePoint, `npm run preview`) fungerar allt. Om appen någon gång ska kunna öppnas från en lokal eller synkad mapp behöver pdf.js köras utan separat arbetstråd där; följs upp i FEAT-002 (felbesked i stället för att fastna).
8. **Testfilerna** i `tests/filer/` skapas av `scripts/skapa-testfiler.mjs` och innehåller bara påhittad text.

## Vad som är stubbat

- Sidval och ordning: alla sidor i inlästa filer läggs till i ordning (FEAT-001).
- Dra och släpp, ta bort fil, miniatyrer för alla sidor (FEAT-001).
- Förhandsvisning (FEAT-003), felbesked per orsak (FEAT-002; nu ett allmänt meddelande), ångra (FEAT-005).
- Märkning (FEAT-006, FEAT-007), dold information (FEAT-008), arkivformat och veraPDF (FEAT-009).
- Hjälp och om-sida (FEAT-010, FEAT-011).
- Spara-dialogen SCR-APP-005: filnamnet sätts automatiskt.
- pdf.js standardtypsnitt och CMaps är inte inbakade än; pdf.js använder datorns typsnitt för icke inbäddade typsnitt (`useSystemFonts`). Tas om hand i FEAT-003.

## Klart när – status

| Villkor (plan avsnitt 2) | Status |
| :-- | :-- |
| CI grön | Grönt lokalt och i GitHub Actions (körning 1 och 2, 2026-11-12), inklusive e2e i WebKit. |
| Fungerar från test-SharePoint i Edge (och Safari) | **Väntar på Ägaren** (docs/forvaltning.md avsnitt 2) |
| Inga nätverksanrop efter laddning, fungerar offline | Visat i e2e-test lokalt; **väntar på prov på SharePoint** |
| Starttid från SharePoint mätt | **Väntar på Ägaren** |

## Kommandon som verifierats

```
rm -rf node_modules dist && npm ci
npm run lint && npm run test:enhet && npm run build && npm run licenser && npm run sarbarheter
UTAN_WEBKIT=1 PW_CHROMIUM_PATH=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npm run test:e2e
```
