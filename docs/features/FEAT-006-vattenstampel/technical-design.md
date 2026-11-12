# Teknisk design: FEAT-006 – Vattenstämpel

> Implementerar: FR-STA-001..012, FR-PLC-001..011, FR-FHV-006 (stämpeln), FR-SPA-008 (stämpeln) · Realiserar: UC-003, UC-005 · Skärmar: SCR-APP-002 Vattenstämpel, SCR-APP-001 (förhandsvisning och resultatrad)
> Status: Byggd utan separat G4 (Ägarens beslut 2026-11-12) · Datum: 2026-11-12

## Design
- **Layoutmodellen `src/karna/layout.ts`** (ADR-006, R4) är det enda stället som räknar ut placering. Allt räknas i PDF-punkter i sidans visade riktning, med origo i övre vänstra hörnet.
  - `Placering {ankare, dxMm, dyMm, egen}`: avstånd från ankarets kanter (hörn) eller förskjutning från mitten (sidhuvud, sidfot). Samma avstånd ger samma läge mot referenskanten på sidor med olika storlek och riktning (FR-PLC-008).
  - `ruta(sida, objekt, placering)` håller objektet innanför kanten och krymper det med samma proportioner om det är större än sidan (FR-PLC-011). `placeringFranRuta` är den omvända och används vid dra, pilar och storleksändring. `flytta` flyttar i visad riktning (FR-PLC-003). `inomMarginal` ger marginalvarningen (5 mm, FR-PLC-010). `overlappar` finns för FR-PLC-012 (FEAT-007).
- **Operationer `src/karna/markning.ts`**: `sattStampelbild` (ny stämpel: 100 %, nedre högra hörnet 10 mm, alla sidor; byte behåller resten, FR-STA-009), `taBortStampel`, `sattOpacitet`, `sattStampelbredd`, `sattPlacering`, `sattAllaSidor`, `vaxlaPaSida`. Generiska för stämpel och etikett.
  - "Alla sidor" av låter stämpeln ligga kvar bara på den aktiva sidan; tas stämpeln bort från en sida gäller inte längre "alla sidor". Nya sidor får stämpeln bara när "alla sidor" gäller (FR-STA-012).
- **Bild** (`bildinlasning.ts`, `validering.ts`): typ avgörs av filens första byte, högst 20 MB, avkodas med `createImageBitmap` för storlek och för att upptäcka skadade filer (FR-STA-011). JPEG i CMYK ritas om till PNG i RGB, eftersom PDF/A-2b inte tillåter CMYK utan profil; stämpeln är appens eget objekt, så BG-009 berörs inte.
- **Förvald storlek** (FR-STA-005 lämnade det till UX): 40 mm bred, mindre om bilden annars blir högre än sidan; 5 mm som minst. Knapparna Större och Mindre ändrar 5 mm.
- **Förhandsvisningen** (`Overlagg.tsx`): streckad säkerhetsmarginal (SVG i `--ui-marginal-a/b`), stämpeln som bild med opacitet. Flytta med mus eller piltangenter (1 mm, Skift 10 mm); storlek med fyra hörnhandtag, motsatt hörn står still. Under dragningen visas en tillfällig ruta; först när musen släpps blir det ett ångra-steg.
- **Panelen** (`Markning.tsx`, `StampelPanel.tsx`, `Placeringsvaljare.tsx`): flikar enligt design.md, inaktiv med förklaring tills resultatet har sidor. Välj bild med knapp eller dra in bilden på panelen. Opacitet med reglage och fält, bredd med fält och knappar, placeringsväljare som radiogrupp med piltangenter, avstånd 0–50 mm, "Alla sidor". Varning inom marginalen anger sidorna.
- **Resultatraden** får kryssrutan "Stämpel" per sida (FR-STA-008).
- **Exporten** (`src/bygg/overlagg.ts`): stämpeln läggs i ett eget innehållsflöde efter sidans egna (R8). Ett koordinatsystem med origo i den visade sidans nedre vänstra hörn sätts med `cm` utifrån beskärningsrutan och rotationen, så att stämpeln står upprätt och hamnar där layoutmodellen säger även på vridna sidor. Opacitet via ExtGState, PNG-alfa som SMask (FR-STA-002); båda tillåtna i PDF/A-2b.
- **Sidmått** för alla sidor hämtas via pdf.js och cachas i `dokumentregister.ts`, så att marginalvarningen gäller alla sidor.

## Acceptanskriterier
- `tests/enhet/layout.test.ts`: förval på A4 stående, liggande och Letter, sidhuvud och sidfot, avstånd 0–50, pilar, kant, krympning, omvänd placering, marginal, överlapp, storlek.
- `tests/enhet/markning.test.ts`: ny stämpel, byte, opacitet, alla sidor och per sida, ny sida, ta bort, bildkontroll och JPEG-komponenter.
- `tests/enhet/stampel-export.test.ts`: stämpelns ruta i den sparade filen, mätt med pdf.js som förhandsvisningen använder, är lika med layoutmodellens på sidor med olika storlek, vridning 90 och 180, /Rotate 270 och beskärningsruta (MF-02); källsidornas flöden finns kvar oförändrade (R8); PNG med alfa och opacitet godkänns av veraPDF som PDF/A-2b; JPEG fungerar.
- `tests/e2e/feat-006.spec.ts`: inaktiv märkning; fel bild; ny stämpel med förval; opacitet; storlek med knapp, fält och hörn; dra; färdig placering; marginalvarning med sidor; axe; sidval; sparad fil med stämpel på rätt sidor; ta bort; byte behåller inställningar och CMYK-JPEG kan sparas som PDF/A; hela flödet med bara tangentbord.
