# Teknisk design: FEAT-011 – Om-sida med licenser, verifieringsrapport och tillgänglighetsredogörelse

> Implementerar: FR-DOK-004..008 · Stöder: NFR-SEC-005 · Realiserar: UC-009, UC-010 · Skärmar: SCR-APP-009, SCR-APP-010, SCR-APP-011
> Status: Byggd utan separat G4 (Ägarens beslut 2026-11-12) · Datum: 2026-11-12

## Design
- **`scripts/om-data.mjs`** körs tillsammans med tokens (före dev, build, lint och test) och skriver `src/karna/om-data.ts` (genereras, i .gitignore):
  - namn och version ur `package.json`, versionsdatum ur rubriken för versionen i `CHANGELOG.md` (saknas den visas "inte släppt");
  - licensförteckning: alla produktionsberoenden enligt license-checker med version, licens och licenstext (utom `@napi-rs/canvas`, som pdf.js bara använder i Node), typsnitten Carlito, Tinos och Cousine med version ur typsnittsfilen och OFL-texten, och ikonerna efter Lucide (ISC);
  - `docs/verifieringsrapport.md` och `docs/tillganglighetsredogorelse.md` omvandlade till HTML med en enkel, egen omvandlare (rubriker, stycken, listor, tabeller).
- **`src/ui/Om.tsx`**: stor dialog med namn, version och datum, meningen om att inget lämnar datorn, knappar till rapporten och redogörelsen och licenstabellen (namnet fäller ut licenstexten). Rapporten och redogörelsen visas i samma dialog med Tillbaka; Esc går tillbaka till om-sidan.
- **Verifieringsrapporten** skrivs inför varje release (NFR-SEC-005) och anger för NFR-SEC-001..004, NFR-PRIV-001..002 och FR-ALM-008 hur kravet verifierats och resultatet. De manuella proven i Edge från SharePoint står som återstående tills Ägaren gjort dem.

## Acceptanskriterier
`tests/e2e/feat-011.spec.ts`: om-sidan visar namn, version, meningen och licenserna med version och licenstext, axe utan fel; rapporten har en rad per krav och redogörelsen kända brister, axe utan fel; DS-02 med dold.pdf (skript) ger inga nätverksanrop, inga skript körs, och inget utom temat finns i webbläsarens lagring.
