# Teknisk design: FEAT-008 – Granska och rensa dold information före sparandet

> Implementerar: FR-DOL-001..014 (FR-DOL-015 Could byggs inte: alla bokmärken tas bort) · Realiserar: UC-006, UC-007 · Skärmar: SCR-APP-004 Dold information, SCR-APP-001 (knappen i sidhuvudet)
> Status: Byggd utan separat G4 (Ägarens beslut 2026-11-12) · Datum: 2026-11-12

## Design
- **`src/bygg/dold.ts`** (byggblocket Dold information, körs i bygg-arbetstråden):
  - `granska(bytes)` läser ett dokument med pdf-lib och ger metadata (titel, författare, ämne, nyckelord, program, skapad, ändrad), kommentarer per sida, bifogade filer (på dokumentnivå och som kommentar på en sida), formulärfält med värde och sidor, samt skript och andra aktiva element (öppningsskript, dokumentskript, dokumenthändelser, sidåtgärder, skript i länkar, kommentarer och fält, åtgärder som startar program eller skickar formulärdata) och programdata (`PieceInfo`).
  - `rensa(...)` tillämpas på kopian efter `copyPages`: kommentarer får ny text eller tas bort (med sina popupfönster), fält tas bort per fullständigt namn, bilagor på sidor tas bort efter val och alltid i PDF/A, bilagor på dokumentnivå kopieras med i vanlig PDF om de inte tas bort. Skript, åtgärder utanför GoTo/GoToR/URI/Named, sidåtgärder, programdata och artikeltrådar tas alltid bort.
  - **Sidor utanför resultatet (FR-DOL-013):** `copyPages` drar med sig objekt som kommentarer och fält pekar på, till exempel hela sidor via länkar och `/P`. Därför pekas `/P` om till den egna sidan, länkar till sidor som är med pekas om till sidans plats i resultatet och länkar till sidor som inte är med tas bort, fältträdet beskärs till grenar med widgetar på resultatets sidor, och `stada(doc)` tar bort alla objekt som inget längre pekar på innan filen skrivs.
  - Innehållsflödena rörs aldrig (R8). Kommentarer och fält ändras bara som PDF-objekt.
- **`src/karna/dold.ts`**: typerna för granskningen, `panelinnehall` (filtrerar på resultatets sidor och anger platser i resultatet), `resultatetsUppgifter` (förifyllning från första sidans dokument, FR-DOL-003) och operationerna `sattUppgift`, `sattKommentartext`, `sattBorttagen`, `sattFaltBorttaget`. Valen ligger i `sparval.dold` och kan ångras.
- **Export:** `Byggbegaran.dold` bär valen per dokument; saknas `uppgifter` används första sidans dokument.
- **Gränssnittet** (`DoldDialog.tsx`, stor dialog): uppgifter om resultatet (skrivskyddade tills dokumenten är lästa), ett avsnitt per berört dokument med metadata, kommentarer (textyta och "Ta bort kommentaren"), bifogade filer (med förklaring om PDF/A), formulärfält och det som alltid tas bort med orsak. "Ingen dold information hittades" när inget finns utöver metadata. Före sparandet med Avbryt och "Fortsätt till sparandet", från sidhuvudet med Klar. Granskningen görs en gång per dokument och sparas bara i minnet (`granskning.ts`).

## Tolkningar
- Förifyllningen följer resultatets nuvarande första sida tills användaren ändrar ett fält; därefter gäller användarens värden.
- Förval: kommentarer, fält och bilagor behålls (FR-DOL-007). Bilagor tas alltid bort i PDF/A, eftersom appen inte kan kontrollera att de själva är PDF/A.
- Samma fält på två sidor ur samma dokument kan bli två fält med samma namn i resultatet; värdet följer med i båda.
- En ändrad kommentar på en textruta (FreeText) visar den gamla texten på sidan tills läsaren ritar om den, eftersom utseendet inte görs om (R8).

## Testfil
`tests/filer/dold.pdf` (3 sidor ur arkivbar.pdf) har metadata, kommentarer på sida 1 och 3, länkar från sida 1 till sida 2 och 3, en bilaga som kommentar på sida 3, ett formulärfält med skript på sida 2, öppningsskript, dokumentskript, en bilaga på dokumentnivå och programdata på sida 2.

## Acceptanskriterier
- `tests/enhet/dold.test.ts`: granskningen läser allt ovan; förifylld och ändrad metadata; inga sidobjekt, kommentarer eller bilagor från sida 3; länken pekas om; skript och programdata borta; förval behåller; valen ändrar och tar bort; PDF/A utan bilagor godkänns av veraPDF; innehållsflöden orörda.
- `tests/enhet/dold-panel.test.ts`: filtrering och platser, förifyllning, val i byggbegäran, ingen dold information.
- `tests/e2e/feat-008.spec.ts`: panelen före sparandet med allt innehåll och axe utan fel i båda teman; valen följer med i filen och kan ångras; förval behåller; "Ingen dold information hittades" med bara tangentbord.
