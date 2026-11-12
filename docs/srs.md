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
- **FIL** – läsa in PDF-filer från datorn.
- **SID** – välja, ordna, ta bort och vrida sidor.
- **FHV** – ständig förhandsvisning av resultatet, en sida i taget.
- **STA** – en vattenstämpel (bild) med genomskinlighet, opacitet och storlek.
- **TXT** – en textetikett med storlek, färg, bakgrund, typsnitt och stil.
- **PLC** – fri och färdig placering, säkerhetsmarginal och kantskydd.
- **DOL** – visa och redigera dold information.
- **SPA** – skapa och spara resultatet som PDF/A-2b eller vanlig PDF.
- **ALM** – ångra, börja om, startläge, meddelanden, språk, tema.
- **DOK** – hjälp, om-sida, licenser, verifieringsrapport, tillgänglighetsredogörelse.

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
| FR-TXT-008 | När användaren slår på fetstil eller kursiv ska appen visa etiketten med vald stil. | Must | Active | Källa: BH-012. Must enligt ägaren 2026-11-12. Varje inbakat typsnitt behöver snitten normal, fet, kursiv och fet kursiv. |
| FR-TXT-009 | När användaren väljer "alla sidor" för textetiketten ska appen lägga etiketten på alla sidor i resultatet. | Must | Active | Källa: BH-005. |
| FR-TXT-010 | När användaren markerar eller avmarkerar en sida i resultatraden för textetiketten ska appen lägga till eller ta bort etiketten på just den sidan, oberoende av vattenstämpelns sidval. | Must | Active | Källa: BH-005, BG-004. |
| FR-TXT-011 | När användaren väljer att ta bort textetiketten ska appen ta bort etiketten från alla sidor. | Must | Active | Källa: BH-005. |
| FR-TXT-012 | Medan etikettfältet är tomt ska appen inte lägga någon textetikett på sidorna. | Must | Active | Källa: BH-005. |
| FR-TXT-013 | Om etikettens text innehåller ett tecken som det valda typsnittet saknar så ska appen visa en varning som namnger tecknet. | Must | Active | Källa: BH-005, BH-003 (resultatet ska motsvara förhandsvisningen). |
| FR-TXT-014 | Medan "alla sidor" är valt för textetiketten, när en sida läggs till i resultatet, ska appen lägga etiketten även på den nya sidan. | Must | Active | Källa: BH-005, BG-003. |
| FR-TXT-015 | Där kontrastvarning ingår ska appen varna när textfärg och bakgrundsfärg har för låg kontrast. | Won't | Active | Källa: BH-012. Bortvald av ägaren 2026-11-12. |

#### 3.1.6 PLC – Placering av vattenstämpel och textetikett

| ID | Requirement | Priority | Status | Notes / rules |
| :-- | :---------- | :------- | :----- | :------------ |
| FR-PLC-001 | Appen ska ge vattenstämpeln och textetiketten var sin placering, som gäller på alla sidor där respektive objekt ligger. | Must | Active | Källa: BG-003. |
| FR-PLC-002 | När användaren drar vattenstämpeln eller textetiketten i förhandsvisningen och släpper den ska appen flytta objektet dit. | Must | Active | Källa: BH-009. |
| FR-PLC-003 | Medan vattenstämpeln eller textetiketten har fokus, när användaren trycker på en piltangent, ska appen flytta objektet 1 mm i pilens riktning, eller 10 mm om Skift hålls ned. | Must | Active | Källa: BH-009, BG-004. |
| FR-PLC-004 | När användaren väljer en färdig placering (övre vänstra, övre högra, nedre vänstra eller nedre högra hörnet, centrerat i sidhuvudet eller centrerat i sidfoten) ska appen placera objektet där med valt avstånd till sidkanten. | Must | Active | Källa: BH-019. |
| FR-PLC-005 | När användaren anger ett avstånd till sidkanten mellan 0 och 50 mm ska appen placera objektet med det avståndet från den kant eller det hörn som den färdiga placeringen utgår från. | Must | Active | Källa: BH-019. Förval 10 mm. |
| FR-PLC-006 | När en textetikett läggs till ska appen placera den centrerat i sidhuvudet med 10 mm avstånd till sidkanten. | Must | Active | Källa: BH-019, FV-001 (testet använder centrerat sidhuvud). |
| FR-PLC-007 | När en vattenstämpel läggs till ska appen placera den i nedre högra hörnet med 10 mm avstånd till sidkanterna. | Must | Active | Källa: BH-019. |
| FR-PLC-008 | Appen ska placera vattenstämpel och textetikett på sidor med olika storlek eller riktning så att avståndet till placeringens referenskant eller referenshörn är detsamma på alla sidor. | Must | Active | Källa: BG-003, BH-009. Vridna sidor räknas i sin visade riktning. |
| FR-PLC-009 | Medan en vattenstämpel eller textetikett finns ska appen visa en säkerhetsmarginal på 5 mm från sidkanten i förhandsvisningen. | Must | Active | Källa: BH-010. Marginalen syns bara i förhandsvisningen, inte i den sparade filen. |
| FR-PLC-010 | Om vattenstämpeln eller textetiketten hamnar inom säkerhetsmarginalen på någon av sina sidor så ska appen visa en varning som anger vilka sidor det gäller. | Must | Active | Källa: BH-010. Varningen läses upp av skärmläsare (BG-004). |
| FR-PLC-011 | Om en flytt, storleksändring eller ändrad text skulle göra att vattenstämpeln eller textetiketten hamnar helt eller delvis utanför någon av sina sidor så ska appen hålla objektet innanför sidkanten. | Must | Active | Källa: BH-010. |
| FR-PLC-012 | Om vattenstämpeln och textetiketten överlappar varandra på någon sida så ska appen visa en varning som anger vilka sidor det gäller. | Could | Active | Källa: BH-009. |

#### 3.1.7 DOL – Dold information

| ID | Requirement | Priority | Status | Notes / rules |
| :-- | :---------- | :------- | :----- | :------------ |
| FR-DOL-001 | När användaren väljer att spara resultatet ska appen, innan filen skapas, visa en panel "Dold information" för de dokument vars sidor ingår i resultatet. | Must | Active | Källa: BH-018. Panelen kan också öppnas när som helst. |
| FR-DOL-002 | Medan panelen "Dold information" visas ska appen för varje berört dokument visa titel, författare, ämne, nyckelord, programmet som skapade filen samt skapad- och ändringsdatum. | Must | Active | Källa: BH-018. |
| FR-DOL-003 | När resultatet får sin första sida ska appen förifylla resultatets titel, författare, ämne och nyckelord med värdena från det dokument som sidan kommer från. | Must | Active | Källa: BH-018. Förifyllning bekräftad av ägaren 2026-11-12. |
| FR-DOL-004 | När användaren ändrar eller tömmer resultatets titel, författare, ämne eller nyckelord ska appen använda de nya värdena i den sparade filen. | Must | Active | Källa: BH-018. |
| FR-DOL-005 | Medan panelen "Dold information" visas ska appen lista kommentarer på resultatets sidor med sin text och vilken resultatsida de finns på. | Must | Active | Källa: BH-018. |
| FR-DOL-006 | När användaren ändrar texten i en kommentar ska appen använda den nya texten i den sparade filen. | Must | Active | Källa: BH-018. |
| FR-DOL-007 | När användaren väljer att ta bort en kommentar ska appen utelämna kommentaren ur den sparade filen. | Must | Active | Källa: BH-018. Förval: kommentarer behålls. |
| FR-DOL-008 | Medan panelen "Dold information" visas ska appen lista bifogade filer i de berörda dokumenten med namn och storlek. | Must | Active | Källa: BH-018. |
| FR-DOL-009 | När användaren väljer att ta bort en bifogad fil ska appen utelämna den ur den sparade filen. | Must | Active | Källa: BH-018. |
| FR-DOL-010 | Om en bifogad fil inte är tillåten i PDF/A-2 så ska appen utelämna den ur den sparade filen och i panelen ange att den tas bort och varför. | Must | Active | Källa: BH-018, BH-017. |
| FR-DOL-011 | Medan panelen "Dold information" visas ska appen lista formulärfält på resultatets sidor och låta användaren välja om de ska behållas eller tas bort. | Must | Active | Källa: BH-018. |
| FR-DOL-012 | Om ett berört dokument innehåller skript eller andra aktiva element så ska appen utelämna dem ur den sparade filen och i panelen ange att de tas bort och varför. | Must | Active | Källa: BH-018, BH-017. |
| FR-DOL-013 | Appen ska utelämna kommentarer, formulärfält och annan information som hör till sidor som inte ingår i resultatet ur den sparade filen. | Must | Active | Källa: BH-018, OM-05. |
| FR-DOL-014 | Medan inga berörda dokument innehåller dold information utöver metadata ska appen visa "Ingen dold information hittades" i panelen. | Must | Active | Källa: BH-018, FV-001. |
| FR-DOL-015 | Där bevarande av bokmärken ingår ska appen behålla bokmärken som pekar på sidor i resultatet och låta dem peka på sidornas nya plats. | Could | Active | Källa: BH-018. Byggs det inte tas alla bokmärken bort. |

#### 3.1.8 SPA – Skapa och spara resultatet

| ID | Requirement | Priority | Status | Notes / rules |
| :-- | :---------- | :------- | :----- | :------------ |
| FR-SPA-001 | När användaren väljer "Baka ihop och spara" ska appen skapa resultatfilen och erbjuda den för sparande på användarens dator via webbläsarens sparfunktion. | Must | Active | Källa: BH-001, BG-001. Filen lämnar aldrig datorn. Panelen för dold information visas först (FR-DOL-001). |
| FR-SPA-002 | När användaren anger ett filnamn ska appen använda det som namn på den sparade filen, med ändelsen .pdf. | Must | Active | Källa: FV-001. |
| FR-SPA-003 | När resultatet får sin första sida ska appen föreslå filnamnet "<första dokumentets namn>-ihopbakad.pdf". | Should | Active | Källa: FV-001. |
| FR-SPA-004 | När användaren sparar ett resultat där alla sidor tillåter det ska appen skapa filen som PDF/A-2b. | Must | Active | Källa: BH-017. Nivå b (grundnivå); nivå a kräver taggad struktur som källfilerna normalt saknar. |
| FR-SPA-005 | Om någon sida i resultatet hindrar att filen blir giltig PDF/A-2b så ska appen, innan filen skapas, visa en varning som listar sidorna och orsaken och låta användaren ta bort sidorna, avbryta eller spara som vanlig PDF. | Must | Active | Källa: BH-017, BG-009 (sidan görs inte om). Ägaren 2026-11-12: det ska gå att spara som vanlig PDF. |
| FR-SPA-006 | När användaren väljer att spara som vanlig PDF ska appen skapa filen utan att märka den som PDF/A. | Must | Active | Källa: BH-017, BH-011. |
| FR-SPA-007 | Appen ska kopiera varje sidas innehåll till resultatfilen utan att omvandla text till bild eller lägga till text från bild. | Must | Active | Källa: BG-009, BH-006. |
| FR-SPA-008 | Appen ska lägga vattenstämpel och textetikett ovanpå sidornas innehåll i resultatfilen med samma placering, storlek, opacitet, färger och typsnitt som i förhandsvisningen. | Must | Active | Källa: BH-003, MF-02. |
| FR-SPA-009 | Appen ska skapa resultatfilen utan kryptering, lösenord eller behörighetsbegränsningar. | Must | Active | Källa: BH-011 (ska kunna signeras digitalt efteråt). |
| FR-SPA-010 | Medan resultatet saknar sidor ska appen visa "Baka ihop och spara" som inaktiv tillsammans med en förklaring av varför. | Must | Active | Källa: FV-001. |
| FR-SPA-011 | Medan resultatfilen skapas ska appen visa en väntindikator. | Must | Active | Källa: FV-001. |
| FR-SPA-012 | Om skapandet av resultatfilen misslyckas så ska appen visa ett felmeddelande som förklarar vad som hände och behålla arbetsytan oförändrad. | Must | Active | Källa: DS-04. |
| FR-SPA-013 | När resultatfilen har sparats ska appen behålla arbetsytan så att användaren kan ändra och spara igen. | Must | Active | Källa: FV-001. |

#### 3.1.9 ALM – Allmänt: tillstånd, ångra och meddelanden

| ID | Requirement | Priority | Status | Notes / rules |
| :-- | :---------- | :------- | :----- | :------------ |
| FR-ALM-001 | När användaren väljer "Ångra" eller trycker Ctrl+Z (Cmd+Z på Mac) ska appen återställa den senaste ändringen av sidval, sidordning, rotation, vattenstämpel, textetikett, placering eller dold information. | Must | Active | Källa: FV-001. |
| FR-ALM-002 | När användaren väljer "Gör om" eller trycker Ctrl+Y (Cmd+Skift+Z på Mac) ska appen göra om den senast ångrade ändringen. | Must | Active | Källa: FV-001. |
| FR-ALM-003 | När användaren väljer "Börja om" ska appen be om bekräftelse och, om användaren bekräftar, tömma arbetsytan helt. | Must | Active | Källa: FV-001. |
| FR-ALM-004 | Om användaren stänger eller laddar om fliken medan arbetsytan innehåller arbete som inte har sparats så ska appen låta webbläsaren fråga om användaren vill lämna sidan. | Must | Active | Källa: FV-001. |
| FR-ALM-005 | Medan arbetsytan saknar inlästa filer ska appen visa en kort förklaring av hur appen används och en yta med texten "Dra in PDF-filer här eller välj filer". | Must | Active | Källa: FV-001, MF-01. |
| FR-ALM-006 | Appen ska formulera alla meddelanden på svenska i klartext så att de anger vad som hände och hur användaren kan gå vidare. | Must | Active | Källa: FV-001, BG-004. |
| FR-ALM-007 | Appen ska visa hela gränssnittet på svenska. | Must | Active | Källa: IN-02. |
| FR-ALM-008 | Appen ska inte spara dokument, sidor, bilder eller metadata i webbläsarens beständiga lagring. | Must | Active | Källa: BG-001, OM-09, IN-06. Inget finns kvar när fliken stängs. |
| FR-ALM-009 | När användaren väljer ljust tema ska appen visa gränssnittet i GP MS ljusa tema tills användaren väljer mörkt tema igen. | Must | Active | Källa: FV-002. Mörkt tema är standard. Ägaren 2026-11-12: Must. Valet av tema får sparas i webbläsaren (inte dokumentdata). |
| FR-ALM-010 | När användaren väljer att visa kortkommandon ska appen visa en lista med alla kortkommandon. | Should | Active | Källa: BG-004. |

#### 3.1.10 DOK – Dokumentation och beskrivningar i appen

| ID | Requirement | Priority | Status | Notes / rules |
| :-- | :---------- | :------- | :----- | :------------ |
| FR-DOK-001 | Appen ska vid varje steg (läsa in, välja sidor, vattenstämpel, textetikett, spara) visa en kort hjälptext eller göra den nåbar via en hjälpknapp vid steget. | Must | Active | Källa: FV-001. |
| FR-DOK-002 | Medan arbetsytan saknar inlästa filer ska appen visa de tre huvudstegen (läs in filer, välj och ordna sidor, baka ihop och spara) i korthet. | Must | Active | Källa: FV-001, MF-01. Kompletterar FR-ALM-005. |
| FR-DOK-003 | När användaren öppnar hjälpen ska appen visa steg-för-steg-beskrivningar av de två vardagsfallen: beslut med inskannad namnteckning (DS-01) och märkning av en PDF (DS-02). | Must | Active | Källa: FV-001. |
| FR-DOK-004 | När användaren öppnar om-sidan ska appen visa appens namn, versionsnummer och versionsdatum. | Must | Active | Källa: UB-01. |
| FR-DOK-005 | När användaren öppnar om-sidan ska appen visa en tydlig mening om att inga filer eller uppgifter lämnar användarens dator. | Must | Active | Källa: BG-001. |
| FR-DOK-006 | När användaren öppnar om-sidan ska appen visa licensförteckningen med varje inbakat bibliotek och typsnitt, dess version och licens. | Must | Active | Källa: BG-008. |
| FR-DOK-007 | När användaren väljer att visa verifieringsrapporten på om-sidan ska appen visa verifieringsrapporten för informationssäkerhet för den aktuella versionen, inklusive verifieringen av att ingen information skickas externt. | Must | Active | Källa: UB-02, BG-001. Ägaren 2026-11-12. Rapporten följer med appen och tas fram inför varje release (se NFR-SEC). |
| FR-DOK-008 | När användaren väljer tillgänglighetsredogörelsen ska appen visa redogörelsen för appens tillgänglighet. | Must | Active | Källa: BG-004, OM-08. |
| FR-DOK-009 | När användaren öppnar hjälpen ska appen visa listan med kortkommandon. | Must | Active | Källa: BG-004. |
| FR-DOK-010 | Appen ska ge varje knapp, fält, miniatyr och förhandsvisad sida ett beskrivande namn som skärmläsare läser upp, för sidor i formen "Sida N av M ur <dokumentnamn>". | Must | Active | Källa: BG-004. |
| FR-DOK-011 | Där kontaktuppgift till förvaltaren ingår ska appen visa den på om-sidan. | Won't | Active | Källa: UB-01. Bortvald av ägaren 2026-11-12. |

### 3.2 External interface requirements

#### 3.2.1 Användargränssnitt
- Ett enda fönster (arbetsyta) med inlästa dokument och miniatyrer, resultatrad, förhandsvisning och paneler för vattenstämpel, textetikett, placering och dold information. Detaljerad utformning tas fram i UX-arbetet.
- Gränssnittet följer GP MS: mörkt tema som standard, ljust tema som val (FR-ALM-009), typsnittsstacken Calibri, Carlito, "Segoe UI", Arial (NFR-USE-002).
- Allt går att göra med tangentbord och skärmläsare (NFR-ACC-001, NFR-ACC-002).
- Avsett för datorskärm från 1 280 pixlars fönsterbredd (NFR-COMP-003).

#### 3.2.2 Hårdvarugränssnitt
Inga. Appen använder bara webbläsarens tillgång till datorns filsystem när användaren själv väljer eller drar in filer, och webbläsarens vanliga sparfunktion.

#### 3.2.3 Programvarugränssnitt
| ID | Gränssnitt | Riktning | Innehåll | Krav |
| :-- | :-- | :-- | :-- | :-- |
| IF-01 | PDF-filer från användarens dator | In | PDF (alla versioner som webbläsarbiblioteket kan läsa), även inskannade sidor | FR-FIL-001..010 |
| IF-02 | Bildfiler för vattenstämpel | In | PNG (med alfakanal) och JPEG, högst 20 MB | FR-STA-001, FR-STA-011 |
| IF-03 | Resultatfil till användarens dator | Ut | PDF/A-2b (ISO 19005-2), eller vanlig PDF efter användarens val; okrypterad | FR-SPA-001..009 |
| IF-04 | Webbläsaren | – | Microsoft Edge och Safari på Mac, de två senaste huvudversionerna | NFR-COMP-001, NFR-COMP-002 |
| IF-05 | SharePoint | – | Appen läggs upp som en fil och öppnas från organisationens SharePoint | NFR-MAINT-001, NFR-MAINT-002 |
| IF-06 | Mottagande system | – | Digitalt arkiv (PDF/A-2), PDF-läsare, verktyg för digital signering | NFR-COMP-004, NFR-COMP-005, FR-SPA-009 |

#### 3.2.4 Kommunikationsgränssnitt
Inga. Efter att appen har öppnats kommunicerar den inte över nätverket (NFR-SEC-002).

### 3.3 Non-functional requirements
Mätvillkor där inget annat anges: en vanlig arbetsdator i organisationen med aktuell Edge.

| ID | Category | Requirement (metric, target, condition) | Priority | Notes |
| :-- | :------- | :-------------------------------------- | :------- | :---- |
| NFR-PERF-001 | Prestanda | Förhandsvisningen visar en ändring inom 1 sekund efter att användaren gjort den, för resultat med upp till 50 sidor. | Must | Källa: BH-003. |
| NFR-PERF-002 | Prestanda | En PDF-fil på 20 MB eller 100 sidor är inläst och alla miniatyrer visas inom 5 sekunder. | Must | Källa: BH-001, FV-001. |
| NFR-PERF-003 | Prestanda | Ett resultat på 100 sidor med vattenstämpel och textetikett har skapats och erbjuds för sparande inom 15 sekunder. | Must | Källa: BH-001. |
| NFR-PERF-004 | Prestanda | Appen är klar att använda inom 3 sekunder efter att den öppnats från SharePoint. | Must | Källa: FV-001, BH-016. |
| NFR-SEC-001 | Informationssäkerhet | Inget filinnehåll, ingen bild och ingen metadata från användarens filer skickas över nätverket; verifieras med webbläsarens nätverkslogg under DS-01 och DS-02 (noll överförda byte med dokumentinnehåll). | Must | Källa: BG-001, UB-02. |
| NFR-SEC-002 | Informationssäkerhet | Efter att appen laddats gör den inga nätverksanrop; en teknisk spärr i appen hindrar webbläsaren från att ansluta till andra adresser. Verifieras med nätverkslogg och med nätverket avstängt. | Must | Källa: BG-001, BG-007, UB-02. |
| NFR-SEC-003 | Informationssäkerhet | Skript och andra aktiva element i inlästa PDF-filer körs aldrig; verifieras med en testfil som innehåller skript. | Must | Källa: BH-018, UB-02. |
| NFR-SEC-004 | Informationssäkerhet | Vid release har inget inbakat bibliotek någon känd sårbarhet med allvarlighetsgrad hög eller kritisk enligt en aktuell sårbarhetsdatabas. | Must | Källa: BG-007, UB-02. |
| NFR-SEC-005 | Informationssäkerhet | Inför varje release tas en verifieringsrapport fram som för varje informationssäkerhetskrav (NFR-SEC-001..004, NFR-PRIV-001..002, FR-ALM-008) anger hur det verifierats och resultatet; rapporten följer med appen (FR-DOK-007). | Must | Källa: UB-02. |
| NFR-USE-001 | Användbarhet | Minst 4 av 5 kollegor som inte sett appen förut sätter, utan hjälp eller instruktioner, på högst 5 minuter samman tre sidor ur en PDF med två sidor ur en annan och lägger en textetikett centrerat i sidhuvudet, med korrekt resultat. | Must | Källa: FV-001, MF-01. |
| NFR-USE-002 | Användbarhet | Gränssnittets färger, kontraster och typsnitt följer GP MS (version 2026-11-12); granskas av ägaren mot profilen. | Should | Källa: FV-002. |
| NFR-ACC-001 | Tillgänglighet | Appen uppfyller WCAG 2.1 nivå AA (EN 301 549); verifieras med automatisk kontroll och manuell granskning. | Must | Källa: BG-004, OM-08. |
| NFR-ACC-002 | Tillgänglighet | DS-01 och DS-02 kan genomföras helt med tangentbord samt med skärmläsaren NVDA i Edge och VoiceOver i Safari. | Must | Källa: BG-004. |
| NFR-COMP-001 | Kompatibilitet | Alla Must-krav uppfylls i de två senaste huvudversionerna av Microsoft Edge på Windows. | Must | Källa: BG-005. |
| NFR-COMP-002 | Kompatibilitet | Alla Must-krav uppfylls i de två senaste huvudversionerna av Safari på macOS. | Should | Källa: BG-006. |
| NFR-COMP-003 | Kompatibilitet | Appen är fullt användbar i webbläsarfönster från 1 280 × 720 pixlar; mobil och surfplatta ingår inte. | Must | Källa: IN-02. |
| NFR-COMP-004 | Kompatibilitet | En fil sparad som PDF/A-2b godkänns som PDF/A-2b av valideringsverktyget veraPDF. | Must | Källa: BH-017. |
| NFR-COMP-005 | Kompatibilitet | Den sparade filen visas med samma sidor, ordning, stämpel och etikett i Adobe Acrobat Reader, Edges PDF-visare och Förhandsvisning på macOS. | Must | Källa: BH-011, MF-02. |
| NFR-MAINT-001 | Förvaltningsbarhet | Appen levereras som en enda HTML-fil som innehåller all kod, alla bibliotek och alla typsnitt. | Must | Källa: BH-016, BG-007. |
| NFR-MAINT-002 | Förvaltningsbarhet | En förvaltningsinstruktion i repot beskriver steg för steg hur ägaren lägger upp en ny version på SharePoint; ägaren kan följa den utan hjälp. | Must | Källa: BH-016, UB-01. |
| NFR-MAINT-003 | Förvaltningsbarhet | Varje version har ett versionsnummer och en post i en versionshistorik i repot. | Must | Källa: UB-01. |
| NFR-MAINT-004 | Förvaltningsbarhet | Varje Must-krav har minst ett automatiskt test, och testfilerna (PDF:er, bilder) finns i repot. | Must | Källa: UB-01. |
| NFR-LEG-001 | Licenser | Varje inbakat bibliotek och typsnitt har en tillåtande licens (t.ex. MIT, BSD, Apache 2.0, SIL OFL 1.1); inget har GPL eller AGPL. Verifieras mot licensförteckningen. | Must | Källa: BG-008. |
| NFR-PRIV-001 | Integritet | Appen samlar inte in statistik, användningsdata eller felrapporter. | Must | Källa: BG-001. |
| NFR-PRIV-002 | Integritet | Ingen behandling av personuppgifter i användarens filer sker utanför användarens dator. | Must | Källa: BG-001, OM-05, IN-06. |

### 3.4 Other requirements
- **Språk:** svenska i hela gränssnittet och i all dokumentation i appen (FR-ALM-007).
- **Tillgänglighetsredogörelse:** ska finnas och hållas aktuell (FR-DOK-008, OM-08).
- **Arkiv:** resultatet ska kunna bevaras enligt arkivreglerna; PDF/A-2b är valt format (FR-SPA-004, OM-07).

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
| TBD-02 | Vilket verktyg för digital signering används, så att NFR-COMP-005 och FR-SPA-009 kan verifieras mot det? | Öppen |
| TBD-03 | Tar det digitala arkivet emot PDF/A-2b? (G0-anmärkning 1) | Antaget |
| TBD-01 | Ska lösenordsskyddade filer kunna låsas upp i en senare version (FR-FIL-014)? | Öppen, inte version 1 |
