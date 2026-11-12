# Software Requirements Specification: PDF-bagaren (XRB.pdf)

> Version: 0.1 · Status: Draft · Last updated: 2026-11-12
> Requirement syntax: EARS
> Underlag: docs/systemkontext.md v1.0 och docs/behov.md v1.0 (baslinje G0, 2026-11-12). Varje krav anger sin källa (BH/FV/BG/UB/OM) i kolumnen Notes.

## Revision History
| Version | Date | Author | Changes |
| :------ | :--- | :----- | :------ |

## 1. Introduction
### 1.1 Purpose
Dokumentet specificerar kraven på PDF-bagaren, en fristående webbapplikation för att sätta samman sidor ur flera PDF-filer och märka dem med vattenstämpel och textetikett. Det riktar sig till ägaren, som granskar och godkänner kraven (grind G1), och till de skills som tar fram arkitektur, UX, plan och kod.

### 1.2 Product vision & scope
**Problem:** kollegor utan särskild datorvana behöver sätta samman sidor ur flera PDF:er, till exempel ett originalbeslut med en inskannad sida som bär namnteckningen, och märka PDF:er med vattenstämpel eller text, utan att dokumenten skickas till externa tjänster.

**Vision:** en enkel "ihopbakning" i webbläsaren: välj sidor, ordna dem, lägg till stämpel och text, se resultatet hela tiden och spara en PDF/A-2-fil som motsvarar förhandsvisningen.

**Ingår:** inläsning av PDF-filer från användarens dator; val, ordning och rotation av sidor; en vattenstämpel (bild) och en textetikett per fil på alla eller valda sidor; ständig förhandsvisning; visning och redigering av dold information; sparande av resultatet som PDF/A-2 på användarens dator.

**Ingår inte:** redigering av sidornas innehåll, omvandling av text till bild, textigenkänning (OCR), hantering av redan digitalt signerade filer, digital signering, server eller molntjänst, användarkonton, flera stämplar eller etiketter per fil, placering sida för sida (BG-002, BG-003, BG-009).

### 1.3 Goals & success metrics
- **MF-01:** en användare som prövar appen första gången lyckas baka ihop två PDF:er och kan se och förstå vilka sidor som kommer med från respektive dokument.
- **MF-02:** den sparade filen motsvarar förhandsvisningen.
- Mätbart (FV-001): en ny kollega sätter utan hjälp på högst 5 minuter samman tre sidor ur en PDF med två ur en annan och lägger en textetikett centrerat i sidhuvudet.

### 1.4 Definitions, acronyms & abbreviations
Se bilaga A.

### 1.5 References
- docs/systemkontext.md v1.0, docs/behov.md v1.0, docs/gates.md
- GP MS – Grafisk profil materielsystem (https://claude.ai/artifact/Wgb53Foof3RoCAjtMMBYY5)
- ISO 19005-2 (PDF/A-2); RA-FS 2009:2; Arkivlagen (1990:782)
- Lag (2018:1937) om tillgänglighet till digital offentlig service; EN 301 549; WCAG 2.1

## 2. Overall Description
### 2.1 Product perspective
En enda webbapplikation som läggs upp på organisationens SharePoint och körs helt i användarens webbläsare. Externa parter: användarens dator (källfiler och sparad fil), webbläsaren (Edge, Safari), SharePoint (publicering), mottagare av filen (digitalt arkiv, e-post, signeringsverktyg). Ingen server tar emot dokument (BG-001, OM-03, OM-06).

### 2.2 Product functions (summary)
*(fylls i när funktionsområdena är fastställda)*

### 2.3 User classes & characteristics
- **Kollegor (användare, IN-02):** utan särskild datorvana, använder appen sporadiskt, ska klara uppgiften första gången utan instruktioner. Kan använda tangentbord eller skärmläsare (BG-004).
- **Ägaren (IN-01, förvaltare IN-03):** beslutar, publicerar nya versioner på SharePoint och vidareutvecklar appen tillsammans med Claude. Skriver ingen kod.

### 2.4 Operating environment
Microsoft Edge (primärt) och Safari på Mac (sekundärt) på organisationens datorer. Appen öppnas från SharePoint, där HTML-filer körs (OM-02, OM-03).

### 2.5 Constraints
- Inga dokument eller delar av dem lämnar användarens dator (BG-001).
- Alla bibliotek och typsnitt är inbakade; inget hämtas vid användning (BG-007).
- Endast tillåtande licenser, inte GPL eller AGPL (BG-008).
- Sidornas innehåll ändras inte (BG-009).
- Publicering genom att lägga upp appen på SharePoint, utan server eller installation (BH-016).
- Gränssnittet följer GP MS: mörkt tema som standard, Calibri med Carlito inbäddad som reserv (FV-002).
- Tillgänglighet enligt WCAG 2.1 AA (BG-004).
- Resultatet ska vara PDF/A-2 (BH-017).

### 2.6 Assumptions & dependencies
- Det digitala arkivet tar emot PDF/A-2 (antaget, G0-anmärkning 1).
- RA-FS 2009:2 gäller tills vidare (G0-anmärkning 2).
- Spår i webbläsaren hanteras av organisationen (OM-09).

## 3. Specific Requirements
### 3.1 Functional requirements

Kraven skrivs i EARS: *När* (händelse), *Medan* (tillstånd), *Där* (valbar funktion), *Om … så* (oönskad händelse) eller utan villkor. Systemet kallas "appen". Prioritet: Must, Should, Could, Won't.

#### 3.1.1 FIL – Inläsning av filer

| ID | Requirement | Priority | Status | Notes / rules |
| :-- | :---------- | :------- | :----- | :------------ |
| FR-FIL-001 | När användaren väljer en eller flera filer i appens filväljare ska appen läsa in de valda filerna till arbetsytan. | Must | Active | Källa: BH-001. Filväljaren är också tangentbordsalternativet till FR-FIL-002 (BG-004). |
| FR-FIL-002 | När användaren drar en eller flera filer från datorn och släpper dem på arbetsytan ska appen läsa in filerna. | Must | Active | Källa: BH-001, FV-001. |
| FR-FIL-003 | När användaren läser in filer medan arbetsytan redan innehåller filer ska appen lägga till de nya filerna och behålla de befintliga filerna och användarens val oförändrade. | Must | Active | Källa: BH-001 (två eller fler filer). |
| FR-FIL-004 | När en fil har lästs in ska appen visa filens namn och antal sidor på arbetsytan. | Must | Active | Källa: BH-002. |
| FR-FIL-005 | När användaren väljer att ta bort en inläst fil ska appen ta bort filen och alla dess sidor från arbetsytan, resultatet och förhandsvisningen. | Must | Active | Källa: BH-001, BH-003. |
| FR-FIL-006 | Om användaren försöker läsa in en fil som inte är en PDF så ska appen avvisa filen och visa ett meddelande som namnger filen och förklarar att bara PDF-filer kan läsas in. | Must | Active | Källa: DS-04, FV-001. Avgörs av filens innehåll, inte bara filändelsen. |
| FR-FIL-007 | Om en fil är skadad eller inte går att läsa så ska appen avvisa filen, visa ett meddelande som namnger filen och orsaken, och behålla övriga filer oförändrade. | Must | Active | Källa: DS-04. |
| FR-FIL-008 | Om en fil är lösenordsskyddad så ska appen avvisa filen och visa ett meddelande som namnger filen och förklarar att lösenordsskyddade filer inte kan läsas in. | Must | Active | Källa: DS-04. Upplåsning med lösenord är Won't i version 1 (se FR-FIL-014). |
| FR-FIL-009 | Om en fil är större än 100 MB så ska appen avvisa filen och visa ett meddelande som namnger filen och anger gränsen. | Must | Active | Källa: DS-04. Gränsen bekräftad av ägaren 2026-11-12. |
| FR-FIL-010 | Om en inläsning skulle göra att arbetsytan innehåller fler än 500 sidor totalt så ska appen avvisa filen och visa ett meddelande som anger gränsen och hur många sidor som redan finns. | Must | Active | Källa: DS-04. |
| FR-FIL-011 | Medan en fil läses in ska appen visa en väntindikator som namnger filen. | Should | Active | Källa: FV-001. |
| FR-FIL-012 | När användaren läser in samma fil mer än en gång ska appen visa varje inläsning som ett separat dokument. | Should | Active | Källa: BH-001. Dokumenten skiljs åt med löpnummer i namnet, inte bara med färg (BG-004). |
| FR-FIL-013 | När en fil har lästs in eller avvisats ska appen meddela utfallet i ett statusmeddelande som skärmläsare läser upp. | Must | Active | Källa: BG-004. |
| FR-FIL-014 | Där upplåsning av lösenordsskyddade filer ingår ska appen låta användaren skriva in lösenordet för att läsa in filen. | Won't | Active | Källa: DS-04. Inte i version 1 (ägaren 2026-11-12). |

### 3.2 External interface requirements
*(fas 4)*

### 3.3 Non-functional requirements
*(fas 3)*

### 3.4 Other requirements
*(fas 3)*

## Appendix A — Glossary
| Term | Betydelse |
| :-- | :-- |
| Arbetsyta | Appens vy där inlästa filer, valda sidor och förhandsvisning visas. |
| Ihopbakning | Att sätta samman valda sidor ur flera PDF:er till en fil utan att ändra sidornas innehåll. |
| Vattenstämpel | En bild som läggs ovanpå valda sidor. |
| Textetikett | En rad valfri text som läggs ovanpå valda sidor. |
| Dold information | Innehåll i en PDF som inte syns på sidan: metadata, kommentarer, bilagor, formulärfält, skript. |
| PDF/A-2 | Arkivformat enligt ISO 19005-2. |

## Appendix B — Open questions / TBD
| ID | Fråga | Status |
| :-- | :-- | :-- |
| TBD-01 | Ska lösenordsskyddade filer kunna låsas upp i en senare version (FR-FIL-014)? | Öppen, inte version 1 |
