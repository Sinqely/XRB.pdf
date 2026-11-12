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

#### 3.1.2 SID – Sidval, ordning och rotation

| ID | Requirement | Priority | Status | Notes / rules |
| :-- | :---------- | :------- | :----- | :------------ |
| FR-SID-001 | När en fil har lästs in ska appen visa filens sidor som miniatyrer, var och en märkt med dokumentets namn och sidnummer. | Must | Active | Källa: BH-002. Märkningen är text, inte bara färg (BG-004). |
| FR-SID-002 | När användaren väljer en sida i ett inläst dokument ska appen lägga till sidan sist i resultatet. | Must | Active | Källa: BH-001. |
| FR-SID-003 | När användaren väljer bort en sida som finns i resultatet ska appen ta bort sidan ur resultatet. | Must | Active | Källa: BH-001. |
| FR-SID-004 | När användaren väljer "välj alla" för ett dokument ska appen lägga till dokumentets ännu inte valda sidor sist i resultatet i dokumentets ordning. | Must | Active | Källa: BH-001, FV-001. |
| FR-SID-005 | När användaren väljer "välj bort alla" för ett dokument ska appen ta bort dokumentets alla sidor ur resultatet. | Must | Active | Källa: BH-001. |
| FR-SID-006 | Appen ska visa resultatets sidor i en egen rad i resultatordning, där varje sida är märkt med ursprungsdokumentets namn och sidnummer. | Must | Active | Källa: BH-002, MF-01. Ubiquitous: gäller hela tiden. |
| FR-SID-007 | När användaren drar en sida i resultatraden och släpper den på en ny plats ska appen flytta sidan dit. | Must | Active | Källa: BH-001 ("drag and drop"). |
| FR-SID-008 | När användaren väljer "flytta upp" eller "flytta ner" för en sida i resultatraden, med knapp eller tangentbord, ska appen flytta sidan ett steg i vald riktning. | Must | Active | Källa: BG-004 (alternativ till dra och släpp). |
| FR-SID-009 | När användaren väljer att ta bort en sida ur resultatraden ska appen ta bort sidan ur resultatet. | Must | Active | Källa: BH-001. Sidan finns kvar i sitt ursprungsdokument och kan väljas igen. |
| FR-SID-010 | När användaren väljer att vrida en sida åt höger eller vänster ska appen vrida sidan 90 grader i vald riktning i resultatet. | Should | Active | Källa: BH-014, DS-01. Vridningen ändrar sidans visningsriktning, inte dess innehåll (BG-009). |
| FR-SID-011 | Appen ska visa antalet sidor i resultatet. | Must | Active | Källa: BH-002, FV-001. |
| FR-SID-012 | När användaren väljer att förstora en miniatyr ska appen visa sidan i större format tills användaren stänger visningen. | Should | Active | Källa: BH-002, DS-01. Stängs med knapp eller Esc (BG-004). |
| FR-SID-013 | När användaren väljer en sida som redan finns i resultatet en gång till ska appen lägga till ytterligare en förekomst av sidan i resultatet. | Could | Active | Källa: BH-001. Ägaren 2026-11-12: Could. Om Could inte byggs gäller FR-SID-002 och FR-SID-003 som val/bortval. |
| FR-SID-014 | När användaren flyttar, lägger till, tar bort eller vrider en sida ska appen meddela ändringen i ett statusmeddelande som skärmläsare läser upp. | Must | Active | Källa: BG-004. T.ex. "Sida 2 ur Beslut.pdf flyttad till plats 4". |

#### 3.1.3 FHV – Förhandsvisning

| ID | Requirement | Priority | Status | Notes / rules |
| :-- | :---------- | :------- | :----- | :------------ |
| FR-FHV-001 | Medan resultatet innehåller minst en sida ska appen visa en förhandsvisning av en resultatsida i taget bredvid sidvalet. | Must | Active | Källa: BH-003 ("hela tiden"). |
| FR-FHV-002 | När användaren väljer föregående eller nästa sida i förhandsvisningen ska appen visa den resultatsidan. | Must | Active | Källa: BH-003. |
| FR-FHV-003 | Medan förhandsvisningen visar en sida ska appen visa sidans plats i resultatet i formen "Sida N av M". | Must | Active | Källa: BH-002, BH-003. |
| FR-FHV-004 | När användaren väljer en sida i resultatraden ska appen visa den sidan i förhandsvisningen. | Must | Active | Källa: BH-003. |
| FR-FHV-005 | När användaren ändrar sidval, sidordning, rotation, vattenstämpel eller textetikett ska appen uppdatera förhandsvisningen så att den visar ändringen. | Must | Active | Källa: BH-003. Svarstid enligt NFR-PERF (fas 3). |
| FR-FHV-006 | Appen ska visa vattenstämpel och textetikett i förhandsvisningen med samma innehåll, placering, storlek, opacitet och färger som i den sparade filen. | Must | Active | Källa: BH-003, MF-02. Verifieras genom jämförelse med den sparade filen i en vanlig PDF-läsare. |
| FR-FHV-007 | Medan förhandsvisningen visar en sida ska appen visa vilket dokument och vilken sida i dokumentet sidan kommer från. | Must | Active | Källa: BH-002, MF-01. |
| FR-FHV-008 | När användaren väljer att zooma in, zooma ut eller anpassa till fönstrets bredd ska appen ändra förhandsvisningens skala därefter. | Should | Active | Källa: BH-003, BG-004 (förstoring). |
| FR-FHV-009 | Medan fokus finns i förhandsvisningen, när användaren trycker på piltangenterna eller Page Up/Page Down, ska appen visa föregående eller nästa resultatsida. | Must | Active | Källa: BG-004. |
| FR-FHV-010 | Medan resultatet saknar sidor ska appen i förhandsvisningens yta visa en kort förklaring av hur man läser in filer och väljer sidor. | Must | Active | Källa: FV-001. |
| FR-FHV-011 | Där visning av flera sidor samtidigt ingår ska appen visa flera resultatsidor i förhandsvisningen samtidigt. | Won't | Active | Källa: BH-003 ("en sida i taget går bra"). Inte i version 1. |

#### 3.1.4 STA – Vattenstämpel

| ID | Requirement | Priority | Status | Notes / rules |
| :-- | :---------- | :------- | :----- | :------------ |
| FR-STA-001 | När användaren väljer en bildfil i formatet PNG eller JPEG som vattenstämpel ska appen lägga bilden som vattenstämpel på de sidor som är valda för stämpeln. | Must | Active | Källa: BH-004. Filväljare och dra och släpp. |
| FR-STA-002 | Appen ska återge genomskinliga delar av en PNG-bild som genomskinliga i vattenstämpeln, både i förhandsvisningen och i den sparade filen. | Must | Active | Källa: BH-007. |
| FR-STA-003 | När en vattenstämpel läggs till ska appen sätta stämpelns opacitet till 100 %. | Must | Active | Källa: BH-008. Förval 100 % (helt synlig), ägaren 2026-11-12. |
| FR-STA-004 | När användaren ändrar opaciteten med reglaget eller sifferfältet ska appen sätta stämpelns opacitet till det valda värdet mellan 0 och 100 %. | Must | Active | Källa: BH-008. Reglaget och fältet visar samma värde. |
| FR-STA-005 | När användaren drar i ett hörn av vattenstämpeln i förhandsvisningen ska appen ändra stämpelns storlek med bibehållna proportioner. | Must | Active | Källa: BH-015. Förvald storlek bestäms i UX-designen. |
| FR-STA-006 | När användaren anger stämpelns storlek i sifferfältet eller med knapparna för större och mindre ska appen ändra stämpelns storlek med bibehållna proportioner. | Must | Active | Källa: BH-015, BG-004 (tangentbordsalternativ). |
| FR-STA-007 | När användaren väljer "alla sidor" för vattenstämpeln ska appen lägga stämpeln på alla sidor i resultatet. | Must | Active | Källa: BH-004. |
| FR-STA-008 | När användaren markerar eller avmarkerar en sida i resultatraden för vattenstämpeln ska appen lägga till eller ta bort stämpeln på just den sidan. | Must | Active | Källa: BH-004. Valet görs med tangentbord eller mus (BG-004). |
| FR-STA-009 | När användaren väljer en ny bild medan en vattenstämpel finns ska appen ersätta den tidigare bilden och behålla opacitet, storleksförhållande, placering och sidval. | Must | Active | Källa: BH-004 (en stämpel per fil), BG-003. |
| FR-STA-010 | När användaren väljer att ta bort vattenstämpeln ska appen ta bort stämpeln från alla sidor. | Must | Active | Källa: BH-004. |
| FR-STA-011 | Om användaren väljer en bildfil som inte är PNG eller JPEG, är skadad eller är större än 20 MB så ska appen avvisa bilden och visa ett meddelande som namnger filen och orsaken. | Must | Active | Källa: DS-04. |
| FR-STA-012 | Medan "alla sidor" är valt för vattenstämpeln, när en sida läggs till i resultatet, ska appen lägga stämpeln även på den nya sidan. | Must | Active | Källa: BH-004, BG-003. |
| FR-STA-013 | Där vridning av vattenstämpeln ingår ska appen låta användaren vrida stämpeln. | Won't | Active | Källa: BG-002. Inte i version 1 (ägaren 2026-11-12). |

#### 3.1.5 TXT – Textetikett

| ID | Requirement | Priority | Status | Notes / rules |
| :-- | :---------- | :------- | :----- | :------------ |
| FR-TXT-001 | När användaren skriver en text i etikettfältet ska appen lägga texten som en textetikett på en rad på de sidor som är valda för etiketten. | Must | Active | Källa: BH-005. Högst 200 tecken; å, ä och ö ska återges korrekt. |
| FR-TXT-002 | Om användaren försöker skriva mer än 200 tecken i etikettfältet så ska appen inte ta emot fler tecken och visa att gränsen är nådd. | Must | Active | Källa: BH-005. |
| FR-TXT-003 | När en textetikett läggs till ska appen sätta textstorleken till 12 pt, textfärgen till svart, ingen bakgrundsfärg och typsnittet Carlito. | Must | Active | Källa: BH-012, BH-013. Förval bekräftade av ägaren 2026-11-12. |
| FR-TXT-004 | När användaren anger en textstorlek mellan 6 och 72 pt ska appen visa etiketten i den storleken. | Must | Active | Källa: BH-012. |
| FR-TXT-005 | När användaren väljer en av de förvalda färgerna eller anger en egen färg som textfärg ska appen visa etikettens text i den färgen. | Must | Active | Källa: BH-012. |
| FR-TXT-006 | När användaren väljer en bakgrundsfärg för etiketten ska appen visa en fylld yta i den färgen bakom texten. | Must | Active | Källa: BH-012 ("för ökad synlighet"). Alternativet "ingen" tar bort ytan. |
| FR-TXT-007 | När användaren väljer ett typsnitt bland appens inbakade typsnitt ska appen visa etiketten i det typsnittet. | Should | Active | Källa: BH-013, BG-007, BG-008. Urval: Carlito, ett typsnitt med seriffer och ett med fast teckenbredd, alla med tillåtande licens och möjliga att bädda in i PDF/A-2. |
| FR-TXT-008 | När användaren slår på fetstil eller kursiv ska appen visa etiketten med vald stil. | Could | Active | Källa: BH-012. |
| FR-TXT-009 | När användaren väljer "alla sidor" för textetiketten ska appen lägga etiketten på alla sidor i resultatet. | Must | Active | Källa: BH-005. |
| FR-TXT-010 | När användaren markerar eller avmarkerar en sida i resultatraden för textetiketten ska appen lägga till eller ta bort etiketten på just den sidan, oberoende av vattenstämpelns sidval. | Must | Active | Källa: BH-005, BG-004. |
| FR-TXT-011 | När användaren väljer att ta bort textetiketten ska appen ta bort etiketten från alla sidor. | Must | Active | Källa: BH-005. |
| FR-TXT-012 | Medan etikettfältet är tomt ska appen inte lägga någon textetikett på sidorna. | Must | Active | Källa: BH-005. |
| FR-TXT-013 | Om etikettens text innehåller ett tecken som det valda typsnittet saknar så ska appen visa en varning som namnger tecknet. | Must | Active | Källa: BH-005, BH-003 (resultatet ska motsvara förhandsvisningen). |
| FR-TXT-014 | Medan "alla sidor" är valt för textetiketten, när en sida läggs till i resultatet, ska appen lägga etiketten även på den nya sidan. | Must | Active | Källa: BH-005, BG-003. |
| FR-TXT-015 | Där kontrastvarning ingår ska appen varna när textfärg och bakgrundsfärg har för låg kontrast. | Won't | Active | Källa: BH-012. Bortvald av ägaren 2026-11-12. |

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
