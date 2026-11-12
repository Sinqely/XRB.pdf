# Requirements Traceability Matrix

> Source: docs/srs.md, docs/use-cases.md, docs/architecture.md (Design ref), docs/implementation-plan.md (Plan ref) · Last updated: 2026-11-12
> Kolumnen Source anger behov eller annat underlag i docs/behov.md och docs/systemkontext.md. Design ref, Plan ref och Test ref fylls i av senare faser.

| Req ID | Requirement (short) | Priority | Status | Source | Use case(s) | Design ref | Plan ref | Test ref |
| :----- | :------------------ | :------- | :----- | :----- | :---------- | :--------- | :------- | :------- |
| FR-FIL-001 | Läsa in de valda filerna till arbetsytan | Must | Active | BH-001 | UC-001 | features/FEAT-001-baka-ihop/technical-design.md, features/FEAT-001-baka-ihop/ui-design.md | FEAT-001 | _TBD_ |
| FR-FIL-002 | Läsa in filerna | Must | Active | BH-001, FV-001 | UC-001 | ADR-003, features/FEAT-001-baka-ihop/technical-design.md, features/FEAT-001-baka-ihop/ui-design.md | FEAT-001 | _TBD_ |
| FR-FIL-003 | Lägga till de nya filerna och behålla de befintliga filerna och användarens val oföränd… | Must | Active | BH-001 | UC-001 | features/FEAT-001-baka-ihop/technical-design.md, features/FEAT-001-baka-ihop/ui-design.md | FEAT-001 | _TBD_ |
| FR-FIL-004 | Visa filens namn och antal sidor på arbetsytan | Must | Active | BH-002 | UC-001 | features/FEAT-001-baka-ihop/technical-design.md, features/FEAT-001-baka-ihop/ui-design.md | FEAT-001 | _TBD_ |
| FR-FIL-005 | Ta bort filen och alla dess sidor från arbetsytan, resultatet och förhandsvisningen | Must | Active | BH-001, BH-003 | UC-001 | features/FEAT-001-baka-ihop/technical-design.md, features/FEAT-001-baka-ihop/ui-design.md | FEAT-001 | _TBD_ |
| FR-FIL-006 | Avvisa filen och visa ett meddelande som namnger filen och förklarar att bara PDF-filer… | Must | Active | DS-04, BH-020, FV-001 | UC-001 | _TBD_ | FEAT-002 | _TBD_ |
| FR-FIL-007 | Avvisa filen, visa ett meddelande som namnger filen och orsaken, och behålla övriga fil… | Must | Active | DS-04, BH-020 | UC-001 | ADR-003 | FEAT-002 | _TBD_ |
| FR-FIL-008 | Avvisa filen och visa ett meddelande som namnger filen och förklarar att lösenordsskydd… | Must | Active | DS-04, BH-020 | UC-001 | ADR-003 | FEAT-002 | _TBD_ |
| FR-FIL-009 | Avvisa filen och visa ett meddelande som namnger filen och anger gränsen | Must | Active | DS-04, BH-020 | UC-001 | _TBD_ | FEAT-002 | _TBD_ |
| FR-FIL-010 | Avvisa filen och visa ett meddelande som anger gränsen och hur många sidor som redan finns | Must | Active | DS-04, BH-020 | UC-001 | _TBD_ | FEAT-002 | _TBD_ |
| FR-FIL-011 | Visa en väntindikator som namnger filen | Should | Active | FV-001 | UC-001 | _TBD_ | FEAT-002 | _TBD_ |
| FR-FIL-012 | Visa varje inläsning som ett separat dokument | Should | Active | BH-001 | UC-001 | _TBD_ | FEAT-002 | _TBD_ |
| FR-FIL-013 | Meddela utfallet i ett statusmeddelande som skärmläsare läser upp | Must | Active | BG-004 | UC-001 | _TBD_ | FEAT-002 | _TBD_ |
| FR-FIL-014 | Låta användaren skriva in lösenordet för att läsa in filen | Won't | Active | DS-04, BH-020 | UC-001 | _TBD_ | _TBD_ | _TBD_ |
| FR-SID-001 | Visa filens sidor som miniatyrer, var och en märkt med dokumentets namn och sidnummer | Must | Active | BH-002 | UC-001 | ADR-003, features/FEAT-001-baka-ihop/technical-design.md, features/FEAT-001-baka-ihop/ui-design.md | FEAT-001 | _TBD_ |
| FR-SID-002 | Lägga till sidan sist i resultatet | Must | Active | BH-001 | UC-002 | features/FEAT-001-baka-ihop/technical-design.md, features/FEAT-001-baka-ihop/ui-design.md | FEAT-001 | _TBD_ |
| FR-SID-003 | Ta bort sidan ur resultatet | Must | Active | BH-001 | UC-002 | features/FEAT-001-baka-ihop/technical-design.md, features/FEAT-001-baka-ihop/ui-design.md | FEAT-001 | _TBD_ |
| FR-SID-004 | Lägga till dokumentets ännu inte valda sidor sist i resultatet i dokumentets ordning | Must | Active | BH-001, FV-001 | UC-002 | features/FEAT-001-baka-ihop/technical-design.md, features/FEAT-001-baka-ihop/ui-design.md | FEAT-001 | _TBD_ |
| FR-SID-005 | Ta bort dokumentets alla sidor ur resultatet | Must | Active | BH-001 | UC-002 | features/FEAT-001-baka-ihop/technical-design.md, features/FEAT-001-baka-ihop/ui-design.md | FEAT-001 | _TBD_ |
| FR-SID-006 | Visa resultatets sidor i en egen rad i resultatordning, där varje sida är märkt med urs… | Must | Active | BH-002, MF-01 | UC-002 | features/FEAT-001-baka-ihop/technical-design.md, features/FEAT-001-baka-ihop/ui-design.md | FEAT-001 | _TBD_ |
| FR-SID-007 | Flytta sidan dit | Must | Active | BH-001 | UC-002 | ADR-008, features/FEAT-001-baka-ihop/technical-design.md, features/FEAT-001-baka-ihop/ui-design.md | FEAT-001 | _TBD_ |
| FR-SID-008 | Flytta sidan ett steg i vald riktning | Must | Active | BG-004 | UC-002 | ADR-008, features/FEAT-001-baka-ihop/technical-design.md, features/FEAT-001-baka-ihop/ui-design.md | FEAT-001 | _TBD_ |
| FR-SID-009 | Ta bort sidan ur resultatet | Must | Active | BH-001 | UC-002 | features/FEAT-001-baka-ihop/technical-design.md, features/FEAT-001-baka-ihop/ui-design.md | FEAT-001 | _TBD_ |
| FR-SID-010 | Vrida sidan 90 grader i vald riktning i resultatet | Should | Active | BH-014, DS-01 | UC-002 | ADR-004 | FEAT-004 | _TBD_ |
| FR-SID-011 | Visa antalet sidor i resultatet | Must | Active | BH-002, FV-001 | UC-002 | features/FEAT-001-baka-ihop/technical-design.md, features/FEAT-001-baka-ihop/ui-design.md | FEAT-001 | _TBD_ |
| FR-SID-012 | Visa sidan i större format tills användaren stänger visningen | Should | Active | BH-002, DS-01 | UC-002 | _TBD_ | FEAT-004 | _TBD_ |
| FR-SID-013 | Lägga till ytterligare en förekomst av sidan i resultatet | Could | Active | BH-001 | UC-002 | _TBD_ | FEAT-004 | _TBD_ |
| FR-SID-014 | Meddela ändringen i ett statusmeddelande som skärmläsare läser upp | Must | Active | BG-004 | UC-002 | features/FEAT-001-baka-ihop/technical-design.md, features/FEAT-001-baka-ihop/ui-design.md | FEAT-001 | _TBD_ |
| FR-FHV-001 | Visa en förhandsvisning av en resultatsida i taget bredvid sidvalet | Must | Active | BH-003 | UC-002 | ADR-003 | FEAT-003 | _TBD_ |
| FR-FHV-002 | Visa den resultatsidan | Must | Active | BH-003 | UC-002 | _TBD_ | FEAT-003 | _TBD_ |
| FR-FHV-003 | Visa sidans plats i resultatet i formen "Sida N av M" | Must | Active | BH-002, BH-003 | UC-002 | _TBD_ | FEAT-003 | _TBD_ |
| FR-FHV-004 | Visa den sidan i förhandsvisningen | Must | Active | BH-003 | UC-002 | _TBD_ | FEAT-003 | _TBD_ |
| FR-FHV-005 | Uppdatera förhandsvisningen så att den visar ändringen | Must | Active | BH-003 | UC-002, UC-003, UC-004 | _TBD_ | FEAT-003 | _TBD_ |
| FR-FHV-006 | Visa vattenstämpel och textetikett i förhandsvisningen med samma innehåll, placering, s… | Must | Active | BH-003, MF-02 | UC-002, UC-003, UC-004 | ADR-003, ADR-006 | FEAT-006, FEAT-007 | _TBD_ |
| FR-FHV-007 | Visa vilket dokument och vilken sida i dokumentet sidan kommer från | Must | Active | BH-002, MF-01 | UC-002 | _TBD_ | FEAT-003 | _TBD_ |
| FR-FHV-008 | Ändra förhandsvisningens skala därefter | Should | Active | BH-003, BG-004 | UC-002 | _TBD_ | FEAT-003 | _TBD_ |
| FR-FHV-009 | Visa föregående eller nästa resultatsida | Must | Active | BG-004 | UC-002 | _TBD_ | FEAT-003 | _TBD_ |
| FR-FHV-010 | I förhandsvisningens yta visa en kort förklaring av hur man läser in filer och väljer s… | Must | Active | FV-001 | UC-002 | _TBD_ | FEAT-003 | _TBD_ |
| FR-FHV-011 | Visa flera resultatsidor i förhandsvisningen samtidigt | Won't | Active | BH-003 | UC-002 | _TBD_ | _TBD_ | _TBD_ |
| FR-STA-001 | Lägga bilden som vattenstämpel på de sidor som är valda för stämpeln | Must | Active | BH-004 | UC-003 | _TBD_ | FEAT-006 | _TBD_ |
| FR-STA-002 | Återge genomskinliga delar av en PNG-bild som genomskinliga i vattenstämpeln, både i fö… | Must | Active | BH-007 | UC-003 | ADR-004 | FEAT-006 | _TBD_ |
| FR-STA-003 | Sätta stämpelns opacitet till 100 % | Must | Active | BH-008 | UC-003 | _TBD_ | FEAT-006 | _TBD_ |
| FR-STA-004 | Sätta stämpelns opacitet till det valda värdet mellan 0 och 100 % | Must | Active | BH-008 | UC-003 | ADR-004 | FEAT-006 | _TBD_ |
| FR-STA-005 | Ändra stämpelns storlek med bibehållna proportioner | Must | Active | BH-015 | UC-003 | _TBD_ | FEAT-006 | _TBD_ |
| FR-STA-006 | Ändra stämpelns storlek med bibehållna proportioner | Must | Active | BH-015, BG-004 | UC-003 | _TBD_ | FEAT-006 | _TBD_ |
| FR-STA-007 | Lägga stämpeln på alla sidor i resultatet | Must | Active | BH-004 | UC-003 | _TBD_ | FEAT-006 | _TBD_ |
| FR-STA-008 | Lägga till eller ta bort stämpeln på just den sidan | Must | Active | BH-004 | UC-003 | _TBD_ | FEAT-006 | _TBD_ |
| FR-STA-009 | Ersätta den tidigare bilden och behålla opacitet, storleksförhållande, placering och si… | Must | Active | BH-004, BG-003 | UC-003 | _TBD_ | FEAT-006 | _TBD_ |
| FR-STA-010 | Ta bort stämpeln från alla sidor | Must | Active | BH-004 | UC-003 | _TBD_ | FEAT-006 | _TBD_ |
| FR-STA-011 | Avvisa bilden och visa ett meddelande som namnger filen och orsaken | Must | Active | DS-04, BH-020 | UC-003 | _TBD_ | FEAT-006 | _TBD_ |
| FR-STA-012 | Lägga stämpeln även på den nya sidan | Must | Active | BH-004, BG-003 | UC-003 | _TBD_ | FEAT-006 | _TBD_ |
| FR-STA-013 | Låta användaren vrida stämpeln | Won't | Active | BG-002 | UC-003 | _TBD_ | _TBD_ | _TBD_ |
| FR-TXT-001 | Lägga texten som en textetikett på en rad på de sidor som är valda för etiketten | Must | Active | BH-005 | UC-004 | _TBD_ | FEAT-007 | _TBD_ |
| FR-TXT-002 | Inte ta emot fler tecken och visa att gränsen är nådd | Must | Active | BH-005 | UC-004 | _TBD_ | FEAT-007 | _TBD_ |
| FR-TXT-003 | Sätta textstorleken till 12 pt, textfärgen till svart, ingen bakgrundsfärg och typsnitt… | Must | Active | BH-012, BH-013 | UC-004 | ADR-007 | FEAT-007 | _TBD_ |
| FR-TXT-004 | Visa etiketten i den storleken | Must | Active | BH-012 | UC-004 | _TBD_ | FEAT-007 | _TBD_ |
| FR-TXT-005 | Visa etikettens text i den färgen | Must | Active | BH-012 | UC-004 | _TBD_ | FEAT-007 | _TBD_ |
| FR-TXT-006 | Visa en fylld yta i den färgen bakom texten | Must | Active | BH-012 | UC-004 | ADR-004 | FEAT-007 | _TBD_ |
| FR-TXT-007 | Visa etiketten i det typsnittet | Should | Active | BH-013, BG-007, BG-008 | UC-004 | ADR-007 | FEAT-007 | _TBD_ |
| FR-TXT-008 | Visa etiketten med vald stil | Must | Active | BH-012 | UC-004 | ADR-007 | FEAT-007 | _TBD_ |
| FR-TXT-009 | Lägga etiketten på alla sidor i resultatet | Must | Active | BH-005 | UC-004 | _TBD_ | FEAT-007 | _TBD_ |
| FR-TXT-010 | Lägga till eller ta bort etiketten på just den sidan, oberoende av vattenstämpelns sidval | Must | Active | BH-005, BG-004 | UC-004 | _TBD_ | FEAT-007 | _TBD_ |
| FR-TXT-011 | Ta bort etiketten från alla sidor | Must | Active | BH-005 | UC-004 | _TBD_ | FEAT-007 | _TBD_ |
| FR-TXT-012 | Inte lägga någon textetikett på sidorna | Must | Active | BH-005 | UC-004 | _TBD_ | FEAT-007 | _TBD_ |
| FR-TXT-013 | Visa en varning som namnger tecknet | Must | Active | BH-005, BH-003 | UC-004 | ADR-006, ADR-007 | FEAT-007 | _TBD_ |
| FR-TXT-014 | Lägga etiketten även på den nya sidan | Must | Active | BH-005, BG-003 | UC-004 | _TBD_ | FEAT-007 | _TBD_ |
| FR-TXT-015 | Varna när textfärg och bakgrundsfärg har för låg kontrast | Won't | Active | BH-012 | UC-004 | _TBD_ | _TBD_ | _TBD_ |
| FR-PLC-001 | Ge vattenstämpeln och textetiketten var sin placering, som gäller på alla sidor där res… | Must | Active | BG-003 | UC-005 | ADR-006 | FEAT-006 | _TBD_ |
| FR-PLC-002 | Flytta objektet dit | Must | Active | BH-009 | UC-005 | _TBD_ | FEAT-006 | _TBD_ |
| FR-PLC-003 | Flytta objektet 1 mm i pilens riktning, eller 10 mm om Skift hålls ned | Must | Active | BH-009, BG-004 | UC-005 | _TBD_ | FEAT-006 | _TBD_ |
| FR-PLC-004 | Placera objektet där med valt avstånd till sidkanten | Must | Active | BH-019 | UC-005 | ADR-006 | FEAT-006 | _TBD_ |
| FR-PLC-005 | Placera objektet med det avståndet från den kant eller det hörn som den färdiga placeri… | Must | Active | BH-019 | UC-005 | ADR-006 | FEAT-006 | _TBD_ |
| FR-PLC-006 | Placera den centrerat i sidhuvudet med 10 mm avstånd till sidkanten | Must | Active | BH-019, FV-001 | UC-004, UC-005 | ADR-006 | FEAT-006 | _TBD_ |
| FR-PLC-007 | Placera den i nedre högra hörnet med 10 mm avstånd till sidkanterna | Must | Active | BH-019 | UC-003, UC-005 | ADR-006 | FEAT-006 | _TBD_ |
| FR-PLC-008 | Placera vattenstämpel och textetikett på sidor med olika storlek eller riktning så att… | Must | Active | BG-003, BH-009 | UC-005 | ADR-006 | FEAT-006 | _TBD_ |
| FR-PLC-009 | Visa en säkerhetsmarginal på 5 mm från sidkanten i förhandsvisningen | Must | Active | BH-010 | UC-005 | _TBD_ | FEAT-006 | _TBD_ |
| FR-PLC-010 | Visa en varning som anger vilka sidor det gäller | Must | Active | BH-010 | UC-005 | ADR-006 | FEAT-006 | _TBD_ |
| FR-PLC-011 | Hålla objektet innanför sidkanten | Must | Active | BH-010 | UC-005 | ADR-006 | FEAT-006 | _TBD_ |
| FR-PLC-012 | Visa en varning som anger vilka sidor det gäller | Could | Active | BH-009 | UC-005 | _TBD_ | FEAT-007 | _TBD_ |
| FR-DOL-001 | När användaren väljer att spara resultatet ska appen, innan filen skapas, visa en panel… | Must | Active | BH-018 | UC-006, UC-007 | _TBD_ | FEAT-008 | _TBD_ |
| FR-DOL-002 | För varje berört dokument visa titel, författare, ämne, nyckelord, programmet som skapa… | Must | Active | BH-018 | UC-006 | _TBD_ | FEAT-008 | _TBD_ |
| FR-DOL-003 | Förifylla resultatets titel, författare, ämne och nyckelord med värdena från det dokume… | Must | Active | BH-018 | UC-006 | _TBD_ | FEAT-008 | _TBD_ |
| FR-DOL-004 | Använda de nya värdena i den sparade filen | Must | Active | BH-018 | UC-006 | ADR-004 | FEAT-008 | _TBD_ |
| FR-DOL-005 | Lista kommentarer på resultatets sidor med sin text och vilken resultatsida de finns på | Must | Active | BH-018 | UC-006 | _TBD_ | FEAT-008 | _TBD_ |
| FR-DOL-006 | Använda den nya texten i den sparade filen | Must | Active | BH-018 | UC-006 | ADR-004 | FEAT-008 | _TBD_ |
| FR-DOL-007 | Utelämna kommentaren ur den sparade filen | Must | Active | BH-018 | UC-006 | ADR-004 | FEAT-008 | _TBD_ |
| FR-DOL-008 | Lista bifogade filer i de berörda dokumenten med namn och storlek | Must | Active | BH-018 | UC-006 | _TBD_ | FEAT-008 | _TBD_ |
| FR-DOL-009 | Utelämna den ur den sparade filen | Must | Active | BH-018 | UC-006 | ADR-004 | FEAT-008 | _TBD_ |
| FR-DOL-010 | Utelämna den ur den sparade filen och i panelen ange att den tas bort och varför | Must | Active | BH-018, BH-017 | UC-006 | ADR-005 | FEAT-008 | _TBD_ |
| FR-DOL-011 | Lista formulärfält på resultatets sidor och låta användaren välja om de ska behållas el… | Must | Active | BH-018 | UC-006 | ADR-004 | FEAT-008 | _TBD_ |
| FR-DOL-012 | Utelämna dem ur den sparade filen och i panelen ange att de tas bort och varför | Must | Active | BH-018, BH-017 | UC-006 | ADR-005 | FEAT-008 | _TBD_ |
| FR-DOL-013 | Utelämna kommentarer, formulärfält och annan information som hör till sidor som inte in… | Must | Active | BH-018, OM-05 | UC-006 | ADR-004 | FEAT-008 | _TBD_ |
| FR-DOL-014 | Visa "Ingen dold information hittades" i panelen | Must | Active | BH-018, FV-001 | UC-006 | _TBD_ | FEAT-008 | _TBD_ |
| FR-DOL-015 | Behålla bokmärken som pekar på sidor i resultatet och låta dem peka på sidornas nya plats | Could | Active | BH-018 | UC-006 | _TBD_ | FEAT-008 | _TBD_ |
| FR-SPA-001 | Skapa resultatfilen och erbjuda den för sparande på användarens dator via webbläsarens… | Must | Active | BH-001, BG-001 | UC-007 | ADR-001, ADR-004, features/FEAT-001-baka-ihop/technical-design.md, features/FEAT-001-baka-ihop/ui-design.md | FEAT-001 | _TBD_ |
| FR-SPA-002 | Använda det som namn på den sparade filen, med ändelsen .pdf | Must | Active | FV-001 | UC-007 | features/FEAT-001-baka-ihop/technical-design.md, features/FEAT-001-baka-ihop/ui-design.md | FEAT-001 | _TBD_ |
| FR-SPA-003 | Föreslå filnamnet "<första dokumentets namn>-ihopbakad.pdf" | Should | Active | FV-001 | UC-007 | _TBD_ | FEAT-009 | _TBD_ |
| FR-SPA-004 | Skapa filen som PDF/A-2b | Must | Active | BH-017 | UC-007 | ADR-005 | FEAT-009 | _TBD_ |
| FR-SPA-005 | Om någon sida i resultatet hindrar att filen blir giltig PDF/A-2b så ska appen, innan f… | Must | Active | BH-017, BG-009 | UC-007 | ADR-005 | FEAT-009 | _TBD_ |
| FR-SPA-006 | Skapa filen utan att märka den som PDF/A | Must | Active | BH-017, BH-011 | UC-007 | ADR-005 | FEAT-009 | _TBD_ |
| FR-SPA-007 | Kopiera varje sidas innehåll till resultatfilen utan att omvandla text till bild eller… | Must | Active | BG-009, BH-006 | UC-007 | ADR-004, features/FEAT-001-baka-ihop/technical-design.md | FEAT-001 | _TBD_ |
| FR-SPA-008 | Lägga vattenstämpel och textetikett ovanpå sidornas innehåll i resultatfilen med samma… | Must | Active | BH-003, MF-02 | UC-007 | ADR-004, ADR-006 | FEAT-006, FEAT-007 | _TBD_ |
| FR-SPA-009 | Skapa resultatfilen utan kryptering, lösenord eller behörighetsbegränsningar | Must | Active | BH-011 | UC-007 | ADR-004, features/FEAT-001-baka-ihop/technical-design.md | FEAT-001 | _TBD_ |
| FR-SPA-010 | Visa "Baka ihop och spara" som inaktiv tillsammans med en förklaring av varför | Must | Active | FV-001 | UC-007 | features/FEAT-001-baka-ihop/technical-design.md, features/FEAT-001-baka-ihop/ui-design.md | FEAT-001 | _TBD_ |
| FR-SPA-011 | Visa en väntindikator | Must | Active | FV-001 | UC-007 | features/FEAT-001-baka-ihop/technical-design.md, features/FEAT-001-baka-ihop/ui-design.md | FEAT-001 | _TBD_ |
| FR-SPA-012 | Visa ett felmeddelande som förklarar vad som hände och behålla arbetsytan oförändrad | Must | Active | DS-04, BH-020 | UC-007 | features/FEAT-001-baka-ihop/technical-design.md, features/FEAT-001-baka-ihop/ui-design.md | FEAT-001 | _TBD_ |
| FR-SPA-013 | Behålla arbetsytan så att användaren kan ändra och spara igen | Must | Active | FV-001 | UC-007 | features/FEAT-001-baka-ihop/technical-design.md, features/FEAT-001-baka-ihop/ui-design.md | FEAT-001 | _TBD_ |
| FR-ALM-001 | Återställa den senaste ändringen av sidval, sidordning, rotation, vattenstämpel, textet… | Must | Active | FV-001 | UC-008 | ADR-008 | FEAT-005 | _TBD_ |
| FR-ALM-002 | Göra om den senast ångrade ändringen | Must | Active | FV-001 | UC-008 | ADR-008 | FEAT-005 | _TBD_ |
| FR-ALM-003 | Be om bekräftelse och, om användaren bekräftar, tömma arbetsytan helt | Must | Active | FV-001 | UC-008 | ADR-008 | FEAT-005 | _TBD_ |
| FR-ALM-004 | Låta webbläsaren fråga om användaren vill lämna sidan | Must | Active | FV-001 | UC-007, UC-008 | _TBD_ | FEAT-005 | _TBD_ |
| FR-ALM-005 | Visa en kort förklaring av hur appen används och en yta med texten "Dra in PDF-filer hä… | Must | Active | FV-001, MF-01 | UC-001 | _TBD_ | FEAT-010 | _TBD_ |
| FR-ALM-006 | Formulera alla meddelanden på svenska i klartext så att de anger vad som hände och hur… | Must | Active | FV-001, BG-004 | — | _TBD_ | Foundations | _TBD_ |
| FR-ALM-007 | Visa hela gränssnittet på svenska | Must | Active | IN-02, FV-003 | — | _TBD_ | Foundations | _TBD_ |
| FR-ALM-008 | Inte spara dokument, sidor, bilder eller metadata i webbläsarens beständiga lagring | Must | Active | BG-001, OM-09, IN-06 | — | ADR-001, ADR-008 | Foundations | _TBD_ |
| FR-ALM-009 | Visa gränssnittet i GP MS ljusa tema tills användaren väljer mörkt tema igen | Must | Active | FV-002 | UC-009 | ADR-008 | Foundations | _TBD_ |
| FR-ALM-010 | Visa en lista med alla kortkommandon | Should | Active | BG-004 | UC-009 | _TBD_ | FEAT-010 | _TBD_ |
| FR-DOK-001 | Vid varje steg (läsa in, välja sidor, vattenstämpel, textetikett, spara) visa en kort h… | Must | Active | FV-001 | UC-009 | _TBD_ | FEAT-010 | _TBD_ |
| FR-DOK-002 | Visa de tre huvudstegen (läs in filer, välj och ordna sidor, baka ihop och spara) i kor… | Must | Active | FV-001, MF-01 | UC-001, UC-009 | _TBD_ | FEAT-010 | _TBD_ |
| FR-DOK-003 | Visa steg-för-steg-beskrivningar av de två vardagsfallen: beslut med inskannad namnteck… | Must | Active | FV-001 | UC-009 | _TBD_ | FEAT-010 | _TBD_ |
| FR-DOK-004 | Visa appens namn, versionsnummer och versionsdatum | Must | Active | UB-01 | UC-009, UC-010 | ADR-010 | FEAT-011 | _TBD_ |
| FR-DOK-005 | Visa en tydlig mening om att inga filer eller uppgifter lämnar användarens dator | Must | Active | BG-001 | UC-009 | ADR-002 | FEAT-011 | _TBD_ |
| FR-DOK-006 | Visa licensförteckningen med varje inbakat bibliotek och typsnitt, dess version och licens | Must | Active | BG-008 | UC-009 | ADR-010 | FEAT-011 | _TBD_ |
| FR-DOK-007 | Visa verifieringsrapporten för informationssäkerhet för den aktuella versionen, inklusi… | Must | Active | UB-02, BG-001 | UC-009, UC-010 | ADR-002, ADR-010 | FEAT-011 | _TBD_ |
| FR-DOK-008 | Visa redogörelsen för appens tillgänglighet | Must | Active | BG-004, OM-08 | UC-009 | ADR-010 | FEAT-011 | _TBD_ |
| FR-DOK-009 | Visa listan med kortkommandon | Must | Active | BG-004 | UC-009 | _TBD_ | FEAT-010 | _TBD_ |
| FR-DOK-010 | Ge varje knapp, fält, miniatyr och förhandsvisad sida ett beskrivande namn som skärmläs… | Must | Active | BG-004 | UC-009 | ADR-008 | Foundations | _TBD_ |
| FR-DOK-011 | Visa den på om-sidan | Won't | Active | UB-01 | UC-009 | _TBD_ | _TBD_ | _TBD_ |
| NFR-PERF-001 | Förhandsvisningen visar en ändring inom 1 sekund efter att användaren gjort den, för re… | Must | Active | BH-003 | UC-002 | ADR-003, ADR-006 | _TBD_ | _TBD_ |
| NFR-PERF-002 | En PDF-fil på 20 MB eller 100 sidor är inläst och alla miniatyrer visas inom 5 sekunder | Must | Active | BH-001, FV-001 | UC-001 | ADR-003 | _TBD_ | _TBD_ |
| NFR-PERF-003 | Ett resultat på 100 sidor med vattenstämpel och textetikett har skapats och erbjuds för… | Must | Active | BH-001 | UC-007 | ADR-004 | _TBD_ | _TBD_ |
| NFR-PERF-004 | Appen är klar att använda inom 3 sekunder efter att den öppnats från SharePoint | Must | Active | FV-001, BH-016 | — | ADR-001, ADR-008 | _TBD_ | _TBD_ |
| NFR-SEC-001 | Inget filinnehåll, ingen bild och ingen metadata från användarens filer skickas över nä… | Must | Active | BG-001, UB-02 | UC-007 | ADR-001, ADR-002 | _TBD_ | _TBD_ |
| NFR-SEC-002 | Efter att appen laddats gör den inga nätverksanrop; en teknisk spärr i appen hindrar we… | Must | Active | BG-001, BG-007, UB-02 | — | ADR-002 | _TBD_ | _TBD_ |
| NFR-SEC-003 | Skript och andra aktiva element i inlästa PDF-filer körs aldrig; verifieras med en test… | Must | Active | BH-018, UB-02 | — | ADR-003 | _TBD_ | _TBD_ |
| NFR-SEC-004 | Vid release har inget inbakat bibliotek någon känd sårbarhet med allvarlighetsgrad hög… | Must | Active | BG-007, UB-02 | UC-010 | ADR-009, ADR-010 | _TBD_ | _TBD_ |
| NFR-SEC-005 | Inför varje release tas en verifieringsrapport fram som för varje informationssäkerhets… | Must | Active | UB-02 | UC-010 | ADR-002, ADR-010 | _TBD_ | _TBD_ |
| NFR-USE-001 | Minst 4 av 5 kollegor som inte sett appen förut sätter, utan hjälp eller instruktioner… | Must | Active | FV-001, MF-01 | UC-002, UC-004 | _TBD_ | _TBD_ | _TBD_ |
| NFR-USE-002 | Gränssnittets färger, kontraster och typsnitt följer GP MS (version 2026-11-12); gransk… | Should | Active | FV-002 | — | ADR-007 | _TBD_ | _TBD_ |
| NFR-ACC-001 | Appen uppfyller WCAG 2.1 nivå AA (EN 301 549); verifieras med automatisk kontroll och m… | Must | Active | BG-004, OM-08 | — | ADR-008, ADR-009 | _TBD_ | _TBD_ |
| NFR-ACC-002 | DS-01 och DS-02 kan genomföras helt med tangentbord samt med skärmläsaren NVDA i Edge o… | Must | Active | BG-004 | UC-005 | ADR-008 | _TBD_ | _TBD_ |
| NFR-COMP-001 | Alla Must-krav uppfylls i de två senaste huvudversionerna av Microsoft Edge på Windows | Must | Active | BG-005 | — | ADR-001, ADR-003, ADR-009 | _TBD_ | _TBD_ |
| NFR-COMP-002 | Alla Must-krav uppfylls i de två senaste huvudversionerna av Safari på macOS | Should | Active | BG-006 | — | ADR-001, ADR-003, ADR-009 | _TBD_ | _TBD_ |
| NFR-COMP-003 | Appen är fullt användbar i webbläsarfönster från 1 280 × 720 pixlar; mobil och surfplat… | Must | Active | IN-02, FV-004 | — | ADR-008 | _TBD_ | _TBD_ |
| NFR-COMP-004 | En fil sparad som PDF/A-2b godkänns som PDF/A-2b av valideringsverktyget veraPDF | Must | Active | BH-017 | UC-007 | ADR-005, ADR-007, ADR-009 | _TBD_ | _TBD_ |
| NFR-COMP-005 | Den sparade filen visas med samma sidor, ordning, stämpel och etikett i Adobe Acrobat R… | Must | Active | BH-011, MF-02 | UC-007 | ADR-004 | _TBD_ | _TBD_ |
| NFR-MAINT-001 | Appen levereras som en enda HTML-fil som innehåller all kod, alla bibliotek och alla ty… | Must | Active | BH-016, BG-007 | UC-010 | ADR-001, ADR-007, ADR-009 | _TBD_ | _TBD_ |
| NFR-MAINT-002 | En förvaltningsinstruktion i repot beskriver steg för steg hur ägaren lägger upp en ny… | Must | Active | BH-016, UB-01 | UC-010 | ADR-001, ADR-010 | _TBD_ | _TBD_ |
| NFR-MAINT-003 | Varje version har ett versionsnummer och en post i en versionshistorik i repot | Must | Active | UB-01 | UC-010 | ADR-010 | _TBD_ | _TBD_ |
| NFR-MAINT-004 | Varje Must-krav har minst ett automatiskt test, och testfilerna (PDF:er, bilder) finns… | Must | Active | UB-01 | UC-010 | ADR-008, ADR-009 | _TBD_ | _TBD_ |
| NFR-LEG-001 | Varje inbakat bibliotek och typsnitt har en tillåtande licens (t.ex. MIT, BSD, Apache 2… | Must | Active | BG-008 | — | ADR-003, ADR-004, ADR-005, ADR-007, ADR-009 | _TBD_ | _TBD_ |
| NFR-PRIV-001 | Appen samlar inte in statistik, användningsdata eller felrapporter | Must | Active | BG-001 | — | ADR-002 | _TBD_ | _TBD_ |
| NFR-PRIV-002 | Ingen behandling av personuppgifter i användarens filer sker utanför användarens dator | Must | Active | BG-001, OM-05, IN-06 | — | ADR-001, ADR-002 | _TBD_ | _TBD_ |
