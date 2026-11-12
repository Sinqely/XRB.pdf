# Teknisk design: FEAT-007 – Textetikett

> Implementerar: FR-TXT-001..014, FR-PLC-012 (Could), FR-FHV-006 (etiketten), FR-SPA-008 (etiketten) · Realiserar: UC-004, UC-005 · Skärmar: SCR-APP-003 Textetikett, SCR-APP-001
> Status: Byggd utan separat G4 (Ägarens beslut 2026-11-12) · Datum: 2026-11-12

## Avvikelse från ADR-007 (för Ägarens granskning)
- **Tinos och Cousine i stället för Liberation Serif och Liberation Mono.** Liberation Serif och Mono version 2 bygger på just Tinos och Cousine; formerna och måtten är desamma (metriskt kompatibla med Times New Roman och Courier New). Tinos och Cousine finns som OFL-filer med fyra snitt i fontsource 5.3.0. Licens OFL-1.1 som tidigare. tokens.json har uppdaterats.
- **TTF i stället för WOFF2, och hela typsnittet bäddas in.** fontkit kan inte läsa WOFF2-filerna och kan inte göra delmängder av de här TTF-filerna, så filerna är omvandlade till TTF (latinsk teckenuppsättning, med å, ä, ö, é, ü, – och €) och bäddas in hela. Det gör resultatfilen 30–90 kB större per använt snitt. Appen blir 4,6 MB, under målet 8 MB.
- Gränssnittets Carlito ligger kvar som WOFF2 (bara CSS).

## Design
- **Mått `src/karna/etikett.ts`** (ADR-006): `etikettMatt(font, etikett)` ger rutan ur textens glyfbredder och typsnittets över- och underhäng, plus marginal 0,3 × storleken när etiketten har bakgrund. Kerning och ligaturer är avstängda i både fontkit (`TEXTFUNKTIONER`) och förhandsvisningens CSS, så varje tecken blir en glyf med sin bredd. `saknadeTecken` (FR-TXT-013) och `stadaEtikettText` (en rad, 200 tecken).
- **Operationer** (`markning.ts`): `andraEtikett` skapar etiketten med förvalen (12 pt, svart, ingen bakgrund, Carlito, sidhuvudet 10 mm, alla sidor) vid första texten; val som görs innan texten skrivs sparas. Tom text ger ingen etikett på sidorna (`etikettSyns`). `taBortEtikett` glömmer inställningarna. Sidval och placering delas med stämpeln.
- **Typsnitt i gränssnittet** (`src/ui/typsnitt.ts`): de tolv filerna bakas in som data och avkodas först när ett snitt används. Samma bytes ger fontkit-måtten, en `FontFace` för förhandsvisningen och filen som skickas till bygg-arbetstråden, så arbetstråden inte bär egna kopior.
- **Förhandsvisningen** ritar etiketten i SVG med baslinjen där måtten säger, så att texten står på samma ställe som i filen. Flytta med mus eller piltangenter som stämpeln; storleken ändras med fältet.
- **Panelen** (`EtikettPanel.tsx`, `Fargval.tsx`): textfält med räknare "n av 200" och gräns, storlek 6–72 pt, textfärg och bakgrund med de åtta färgerna ur tokens.json, "Egen färg" och för bakgrund "Ingen", typsnitt, fet och kursiv, placeringsväljare, alla sidor och "Ta bort etiketten". Varningar för saknade tecken (uppläses), säkerhetsmarginal och överlapp med stämpeln (FR-PLC-012).
- **Ångra:** text som skrivs i följd blir ett ångra-steg (`andraText` i App).
- **Exporten** (`overlagg.ts`): bakgrundsruta och text med `drawText` i samma koordinatsystem som stämpeln; typsnittet bäddas in med samma funktioner avstängda. Etiketten ritas efter stämpeln och ligger alltså överst.

## Acceptanskriterier
- `tests/enhet/etikett.test.ts`: förval, tom text, 200 tecken, en rad, storlek 6–72, sidval, alla sidor, nya sidor, ta bort; alla tolv snitt har svenska tecken och samma bredd som PDF-inbäddningen; saknade tecken namnges; marginal vid bakgrund; i den sparade filen läser pdf.js ut etikettens text med å, ä och ö på rätt sidor och med baslinjen där layoutmodellen säger, även på vriden sida; PDF/A-2b godkänns av veraPDF.
- `tests/e2e/feat-007.spec.ts`: hela DS-02 med förval, storlek, färg, bakgrund, typsnitt, stil, saknat tecken, axe, sidval, inbäddat typsnitt i sparad fil, tom text och ta bort; 200-teckensgränsen; skrivandet som ett ångra-steg; pilar, marginalvarning och överlappsvarning.
