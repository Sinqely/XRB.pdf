# Teknisk design: FEAT-009 – Spara i arkivformat PDF/A-2b

> Implementerar: FR-SPA-004..006 (FR-SPA-003 fanns redan) · Realiserar: UC-007 · Skärmar: SCR-APP-005 Spara, SCR-APP-006 Arkivformat-varning
> Status: Byggd utan separat G4 (Ägarens beslut 2026-11-12) · Datum: 2026-11-12

## Design
- **`src/bygg/pdfa.ts`** (ADR-005): egen PDF/A-2b-modul utan nya beroenden.
  - `forkontroll(doc)` går igenom varje sidas innehåll och resurser rekursivt (formulärobjekt, mönster, Type3-typsnitt, kommentarers utseenden) och ger `Hinder {sida, kod, detalj}`. Koder: `typsnitt` (ej inbäddat), `cmyk` (DeviceCMYK eller k/K utan färgprofil), `lzw`, `interpolering`, `kommentar-utseende` (saknar utseende eller utskriftsflagga), `media` (ljud, video, 3D, inbäddad fil), `overforingsfunktion` (TR/TR2), `postscript`.
  - `komplettera(doc, uppgifter)` lägger till det som saknas utan att röra sidornas innehåll (R8): XMP-metadata som stämmer med dokumentinformationen, utdataavsikt GTS_PDFA1 med en egen sRGB-profil (`srgb-icc.ts`, ICC v2) samt tar bort JavaScript och otillåtna åtgärder på dokumentnivå. `sattFilId` ger filen ett ID.
  - Hinder rättas aldrig genom att sidan görs om (BG-009). Användaren väljer i stället.
- **`export.ts`**: `kontrollera(begaran)` kör förkontrollen; `bakaIhop` med `format: 'pdfa'` vägrar skapa en fil med hinder. Vridning sätts i `/Rotate`.
- **Bygg-arbetstråden** kör förkontrollen först vid PDF/A och svarar med antingen filen eller hindren (`Byggutfall`).
- **Spara-dialogen** (`SparaDialog.tsx`, `spara.ts`): formatval som radiogrupp med "Arkivformat PDF/A (rekommenderas)" förvalt och "Vanlig PDF". Valet sparas i `sparval.format` till nästa sparande. Under kontrollen visas "Kontrollerar sidorna …".
- **Varningen SCR-APP-006** visas i samma dialog: rubrik med fokus, förklaring, lista per sida ("Sida 3 i resultatet (beslut.pdf, sida 1)") med orsaker i klartext (`texter.hinder`), och knapparna Avbryt (tillbaka till spara-dialogen), "Ta bort de N sidorna" (ett ångra-steg, sedan sparas resten som PDF/A) och "Spara som vanlig PDF" (primär). Har alla sidor hinder visas inte Ta bort, och texten säger varför.
- **Vanlig PDF** (FR-SPA-006) får varken utdataavsikt eller `pdfaid` i XMP.

## Verifiering med veraPDF
- `scripts/verapdf.mjs` kör veraPDF 1.28.2 (greenfield, `--flavour 2b`) och hämtar det med Maven till `verktyg/verapdf/lib` första gången. CI installerar Java 21 och hämtar veraPDF före testerna.
- veraPDF är ett testverktyg (GPL/MPL) som aldrig bakas in i appen, så NFR-LEG-001 berörs inte.
- Filen kopieras till en ASCII-sökväg före kontrollen, eftersom Java utan UTF-8-locale inte hittar sökvägar med å, ä och ö.

## Testfiler
`tests/filer/arkivbar.pdf` (2 sidor, Carlito inbäddat) kan bli PDF/A; `cmyk.pdf` har en CMYK-sida; `beslut.pdf` har Helvetica som inte är inbäddat. Skapas av `scripts/skapa-testfiler.mjs`.

## Acceptanskriterier
- `tests/enhet/pdfa.test.ts`: förkontrollen hittar inga hinder i arkivbar och rätt hinder per sida i beslut och cmyk; PDF/A vägras vid hinder; färgprofilens huvud; veraPDF godkänner resultatet som PDF/A-2b med orörda innehållsflöden och vridning; vanlig PDF saknar PDF/A-märkning.
- `tests/enhet/spara.test.ts`: förvalt format, begäran med format och vridning, hinder ger ingen fil, lista per sida med orsaker.
- `tests/e2e/feat-009.spec.ts`: förvalt arkivformat ger fil som veraPDF godkänner; varningen listar sidor och orsaker (axe utan fel); Avbryt, Spara som vanlig PDF och Ta bort sidorna (med ångra); alla sidor med hinder; valet behålls.
- `tests/e2e/feat-001.spec.ts`: formatet väljs med bara tangentbord.
