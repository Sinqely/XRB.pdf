# Behov: PDF-bagaren (XRB.pdf)

> Version: 0.1 · Status: Draft · Senast ändrad: 2026-11-12
> Underlag: intervju med ägaren 2026-11-12. Systemkontext: docs/systemkontext.md.

## Ändringslogg
| Version | Datum | Ändring | Orsak (grind eller CHG) |
| :-- | :-- | :-- | :-- |
| 0.1 | 2026-11-12 | Första utkast ur intervju 1. | Behovsfångst steg 4 påbörjat |
| 0.2 | 2026-11-12 | La till BH-007 (genomskinliga områden) och BH-008 (opacitet) för vattenstämpel. | Ägarens tillägg |
| 0.20 | 2026-11-12 | FV-001 bekräftad med mätbart kriterium (5 minuter). | Ägarens svar |
| 0.19 | 2026-11-12 | BH-006 bekräftad. La till BG-009 (sidornas konstruktion ändras inte, ingen OCR). | Ägarens svar |
| 0.18 | 2026-11-12 | BH-005 bekräftad (en textetikett, en rad). La till BH-019 (färdiga placeringar med valbart avstånd till kanten). | Ägarens svar |
| 0.17 | 2026-11-12 | BH-004 bekräftad (en vattenstämpel per fil), BH-018 helt bekräftad. | Ägarens svar |
| 0.16 | 2026-11-12 | BH-018 preciserad (se och ändra textuell dold information), BG-008 bekräftad (tillåtande licenser). | Ägarens svar |
| 0.15 | 2026-11-12 | BH-002 bekräftad. | Ägarens svar |
| 0.14 | 2026-11-12 | La till BG-007 (inbakade bibliotek), BG-008 (licenser) och BH-018 (dold information). Spår i webbläsaren hanteras av organisationen (OM-09). | Ägarens svar |
| 0.13 | 2026-11-12 | La till BG-005 (Edge), BG-006 (Safari) och UB-02 (verifieringsrapport för informationssäkerhet). | Ägarens svar |
| 0.12 | 2026-11-12 | Valideringskriterier för BH-004 och BH-005 skrivna ur ägarens svar. | Förberedelse G0 |
| 0.11 | 2026-11-12 | Driftbild bekräftad. Ägaren benämns neutralt "Ägaren". | Ägarens svar |
| 0.10 | 2026-11-12 | BG-004 tillgänglighet bekräftad som Måste. | Ägarens svar |
| 0.9 | 2026-11-12 | FV-002 uppdaterad efter ny version av GP MS (mörkt tema, Calibri/Carlito). | GP MS uppdaterad |
| 0.8 | 2026-11-12 | FV-002 bekräftad (Bör, GP MS, bara appen). BG-004 tillgänglighet föreslagen. | Ägarens svar |
| 0.7 | 2026-11-12 | La till IN-07 Organisationen och FV-002 (grafisk profil). | Ägarens tillägg |
| 0.6 | 2026-11-12 | Konflikten om arkivformat avgjord: PDF/A-2. BH-017 bekräftad. | Ägarens beslut |
| 0.5 | 2026-11-12 | Rangordning. La till BH-015 (stämpelstorlek), BH-016 (enkel publicering), BH-017 (arkivbeständighet) och konflikten om PDF/A och genomskinlighet. | Intervju 4 |
| 0.4 | 2026-11-12 | BH-001 utökad (fler än två filer, valfri ordning). La till BH-011–BH-014, BG-003, UB-01, utkast till driftbild, signaturkonflikten avgjord. | Intervju 3 |
| 0.3 | 2026-11-12 | BH-003 skärpt (ständig förhandsvisning med stämplar och text). La till BH-009 (styrd placering) och BH-010 (inte för nära kanten). | Ägarens tillägg |

Rangordning av de viktigaste behoven (ägaren 2026-11-12: "Användbarhet, ingen data skickas externt, enkel deployering."): 1. Användbarhet (FV-001, BH-002, BH-003). 2. BG-001 ingen data skickas externt. 3. BH-016 enkel publicering.

## 1. Behov, förväntningar och begränsningar per intressent

### IN-01 Ägaren
| ID | Slag | Egna ord / källa | Tolkning ("… behöver att systemet …") | Prio | Valideringskriterium | MF | Lösningsidé | Status |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| BG-001 | Begränsning | "Det är viktigt att data (pdf-filerna) aldrig skickas till externa källor." | Ägaren vill att inga PDF-filer eller delar av dem lämnar användarens dator. | Måste | Ägaren kan konstatera att appen fungerar med nätverket avstängt efter att den laddats, och att inget filinnehåll skickas iväg (granskas t.ex. i webbläsarens nätverkslogg). | MF-01 | Allt körs i webbläsaren | Bekräftad |
| BG-002 | Begränsning | "Det får aldrig bli så mycket funktioner som gör att de basala behoven inte möts." | Ägaren vill att appen bara har de funktioner som behövs för grundbehoven. | Måste | Ägarens helhetsbedömning; varje ny funktion prövas mot BH-001–BH-005. | MF-01 | | Bekräftad |
| BG-003 | Begränsning | "Textetiketter och stämplar ska hamna på samma sida hela tiden för att undvika för komplicerade funktioner (i alla fall i en första version)." (2026-11-12) | Ägaren har bestämt att en stämpel eller text får samma placering på alla sidor där den läggs, så att man inte behöver placera den sida för sida, åtminstone i första versionen. Tolkningen "samma ställe" `[TO VERIFY]`. | Måste | Stämpel och text placeras en gång och hamnar på samma ställe på alla valda sidor i den sparade filen. | MF-01 | | Förslag [TO VERIFY] |
| BG-005 | Begränsning | "Microsoft Edge primärt" (2026-11-12) | Ägaren vill att appen fungerar fullt ut i Microsoft Edge. | Måste | DS-01 och DS-02 genomförs i aktuell Edge på en arbetsdator, och resultatet stämmer med förhandsvisningen. | MF-01, MF-02 | | Bekräftad |
| BG-006 | Begränsning | "och Mac Safari sekundärt" (2026-11-12) | Ägaren vill att appen fungerar i Safari på Mac. | Bör | DS-01 och DS-02 genomförs i aktuell Safari på Mac. | MF-01, MF-02 | | Bekräftad |
| BG-007 | Begränsning | "vilka externa bibliotek som används samt om de ska/kan bakas in utan att hämtas varje gång" (2026-11-12) | Ägaren vill att alla externa bibliotek och typsnitt bakas in i appen, så att inget hämtas från internet när appen används. | Måste | Med nätverket avstängt efter att appen öppnats från SharePoint fungerar hela DS-01 och DS-02, och webbläsarens nätverkslogg visar inga anrop till andra adresser. | MF-01 | | Bekräftad |
| BG-008 | Begränsning | "Det kan också finnas behov av att resonera om vilka licenser externa bibliotek måste ha för att kunna användas i appen."; godkänt förslag (2026-11-12) | Ägaren vill att varje externt bibliotek och typsnitt har en tillåtande licens (t.ex. MIT, BSD, Apache 2.0, SIL OFL för typsnitt) som tillåter att det bakas in och sprids i organisationen. GPL och AGPL används inte. | Måste | En licensförteckning följer med appen och visar att varje komponent har en tillåtande licens; ingen komponent har GPL eller AGPL. | – | | Bekräftad |
| BG-009 | Begränsning | "Appen ska inte ändra enskilda sidors "konstruktion". Vare sig att göra bilder av text eller försöka göra text av skannad text. Det är alltså en "ihopbakning" som är syftet." (2026-11-12) | Ägaren vill att appen bara sätter ihop sidor och lägger stämpel och text ovanpå. Sidornas innehåll lämnas orört: text görs inte om till bild, och inskannade sidor tolkas inte till text (ingen OCR). | Måste | En textsida och en inskannad sida jämförs före och efter: textsidans text är fortfarande sökbar och oförändrad, och den inskannade sidan har samma bild och ingen tillagd text, utöver stämpel och etikett. | MF-02 | | Bekräftad |

### IN-02 Kollegor utan särskild datorvana (användare)
| ID | Slag | Egna ord / källa | Tolkning ("… behöver att systemet …") | Prio | Valideringskriterium | MF | Lösningsidé | Status |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| BH-001 | Behov | "slå samman flera pdf-filer till en"; "bara använda den skannade sidan … resten vill man ha original-dokumentet för"; "Sidor måste kunna väljas fritt från endera fil (och fler än två) genom enkla medel (drag and drop). Alla sidor behöver naturligtvis inte vara med" (2026-11-12) | Användaren behöver att systemet på ett enkelt sätt låter hen plocka valfria sidor ur två eller fler PDF:er, i valfri ordning, och sätta ihop dem till en fil. Sidor som inte väljs kommer inte med. | Måste | Med ett riktigt originaldokument, ett skannat beslut och en tredje fil skapas en fil där beslutssidan ersätter motsvarande originalsida, några sidor är bortvalda och ordningen är den användaren valt. | MF-01 | Dra och släpp | Bekräftad |
| BH-002 | Behov | "kan se och förstå vilka sidor som kommer med från respektive dokument" | Användaren behöver att systemet tydligt visar vilka sidor som är valda och vilket dokument varje sida kommer ifrån. | Måste | En ny användare kan, utan hjälp, peka ut ursprung för varje sida i resultatet. | MF-01 | Miniatyrer märkta per dokument | Bekräftad |
| BH-003 | Behov | "Användarens förväntningar på slutresultatet (genom förhandsvisning) ska sedan mötas av den sammanslagna filen."; "jätteviktigt att det hela tiden finns en förhandsvisning om hur dokumentet kommer se ut (en sida i taget går bra) med vattenstämplar och textetiketter" (2026-11-12) | Användaren behöver att systemet hela tiden visar hur resultatet kommer att se ut, inklusive vattenstämplar och textetiketter, och att den sparade filen ser ut precis som förhandsvisningen. En sida i taget räcker. | Måste | Under hela arbetet syns en förhandsvisning som uppdateras när användaren ändrar något. Den nedladdade filen jämförs sida för sida med förhandsvisningen: samma sidor, ordning, stämplar och texter på samma ställen. | MF-02 | Förhandsvisning av en sida i taget med bläddring | Bekräftad |
| BH-004 | Behov | "märka upp med en vattenstämpel (bild) … som sedan appliceras på alla eller valda sidor"; "jag tycker det räcker med en vattenstämpel för användbarheten" (2026-11-12) | Användaren behöver att systemet kan lägga en egen bild som vattenstämpel på alla eller valda sidor. En vattenstämpel per fil räcker. | Måste | Användaren väljer en egen bild, väljer "alla sidor" respektive några enskilda sidor, och stämpeln finns på exakt de sidorna i både förhandsvisningen och den sparade filen (se även BH-007, BH-008, BH-009, BH-015). | MF-02 | | Bekräftad |
| BH-007 | Behov | "vattenstämplar måste kunna innehålla transparenta områden (t.ex. genom png)" (2026-11-12) | Användaren behöver att genomskinliga delar av vattenstämpelns bild förblir genomskinliga på sidan, så att innehållet under syns. | Måste | En bild med genomskinlig bakgrund läggs på en textsida; texten syns i de genomskinliga delarna, både i förhandsvisningen och i den sparade filen. | MF-02 | PNG med alfakanal | Bekräftad |
| BH-008 | Behov | "samt att man kan sätta opacitet" (2026-11-12) | Användaren behöver kunna välja hur genomskinlig hela vattenstämpeln ska vara. | Måste | Användaren ställer in en lägre opacitet och ser i förhandsvisningen och i den sparade filen att stämpeln blir svagare och sidans innehåll går att läsa igenom den. | MF-02 | Reglage för opacitet | Bekräftad |
| BH-005 | Behov | "och/eller en valfri text som sedan appliceras på alla eller valda sidor"; "Rätt tolkat och det räcker med en textetikett på en rad." (2026-11-12) | Användaren behöver att systemet kan lägga en valfri text på alla eller valda sidor. En textetikett per fil, på en rad, räcker. | Måste | Användaren skriver en egen text med å, ä och ö, väljer "alla sidor" respektive några enskilda sidor, och texten finns på exakt de sidorna, rättstavad, i både förhandsvisningen och den sparade filen (se även BH-009, BH-012). | MF-02 | | Bekräftad |
| BH-006 | Behov | "vi vill … helst vanlig text som kan sökas och kopieras ifrån"; "Precis." (2026-11-12) | Användaren behöver att text i originalsidorna går att söka i och kopiera även i den sammanslagna filen. | Måste | Sök efter ett ord från originalet i den sammanslagna filen i en vanlig PDF-läsare och kopiera ett stycke. | MF-02 | Sidor kopieras, inte rastreras | Bekräftad |
| BH-009 | Behov | "Position för dessa måste kunna styras av användaren så att de inte täcker viktiga delar" (2026-11-12) | Användaren behöver kunna bestämma var vattenstämpel och textetikett hamnar på sidan. | Måste | Användaren flyttar en stämpel och en text till en tom yta på en riktig sida, och de hamnar på samma ställe i den sparade filen. | MF-02 | Dra i förhandsvisningen | Bekräftad |
| BH-010 | Behov | "eller för den delen hamnar för nära dokumentets gränser oavsiktligt" (2026-11-12) | Användaren behöver att systemet hindrar eller tydligt varnar för att en stämpel eller text oavsiktligt hamnar för nära eller utanför sidans kant. | Måste | Användaren försöker placera en text nära kanten och märker i förhandsvisningen att den hålls innanför eller att det tydligt syns att den är för nära. Ingen stämpel eller text klipps av i den sparade filen. | MF-02 | Säkerhetsmarginal som visas i förhandsvisningen | Bekräftad |
| BH-019 | Behov | "Det är önskvärt att det finns fördefinierade placeringar alla fyra hörn samt centrerat vid sidhuvud och sidfot med valbar distans från sidkanten." (2026-11-12) | Användaren vill kunna välja en färdig placering för vattenstämpel och textetikett: något av de fyra hörnen, centrerat i sidhuvudet eller centrerat i sidfoten, och själv välja avståndet till sidkanten. | Bör | Användaren väljer varje färdig placering i tur och ordning och ändrar avståndet till kanten, och stämpeln och texten hamnar där i både förhandsvisningen och den sparade filen. Valen går att göra med tangentbord (BG-004). | MF-01, MF-02 | Sex placeringsknappar och ett fält för avstånd i mm | Bekräftad |
| BH-011 | Behov | "Den slutliga filen kan användas på många sätt, t.ex. i ett digitalt arkiv … mailas etcetera."; "det är snarast så att det är en pdf skapad av appen som kommer signeras" (2026-11-12) | Användaren behöver att resultatet är en vanlig PDF som kan arkiveras, mejlas och signeras digitalt efteråt. | Måste | Den färdiga filen öppnas i vanliga PDF-läsare, tas emot av arkivet och kan signeras digitalt i organisationens signeringsverktyg. | MF-02 | | Bekräftad |
| BH-012 | Behov | "Textstorlek, färg och eventuellt bakgrundsfärg (för ökad synlighet) måste kunna väljas." (2026-11-12) | Användaren behöver kunna välja textetikettens storlek och färg, och en bakgrundsfärg bakom texten så att den syns bättre. | Måste | Användaren ändrar storlek, färg och bakgrundsfärg och ser resultatet i förhandsvisningen och i den sparade filen. Texten går att läsa på både ljusa och mörka delar av en sida. | MF-02 | | Bekräftad |
| BH-013 | Behov | "I den mån det är möjligt även typsnitt." (2026-11-12) | Användaren vill kunna välja typsnitt för textetiketten. | Bör | Användaren väljer mellan några typsnitt och ser valet i den sparade filen. Å, ä och ö visas korrekt. | MF-02 | Ett litet urval fria typsnitt (t.ex. Carlito) som följer med appen och kan bäddas in i PDF/A-2 (BH-017) | Bekräftad |
| BH-014 | Behov | "Det är dock bra om sidor kan roteras mellan landskap och porträtt." (2026-11-12) | Användaren vill kunna vrida en sida mellan liggande och stående. | Bör | En liggande inskannad sida vrids till stående och är rättvänd i den sparade filen. | MF-02 | | Bekräftad |
| BH-015 | Behov | "Ja storlek på vattenstämpel (obs bild!) ska kunna ändras av användaren på ett intuitivt sätt." (2026-11-12) | Användaren behöver kunna ändra storleken på vattenstämpelns bild på ett sätt som känns självklart. | Måste | En kollega som inte sett appen förut gör stämpeln större och mindre utan hjälp, och storleken i den sparade filen är densamma som i förhandsvisningen. Bilden behåller sina proportioner om inte användaren vill annat. | MF-01, MF-02 | Dra i hörnet i förhandsvisningen | Bekräftad |
| BH-017 | Behov | "Utgå från de krav som härstammar från Arkivlagen (1990:782) samt Riksarkivets föreskrifter … (RA-FS 2009:2)" (2026-11-12) | Användaren behöver att den färdiga filen kan bevaras i det digitala arkivet enligt arkivreglerna. | Måste | Den färdiga filen godkänns vid en kontroll mot PDF/A-2 (t.ex. med en PDF/A-validerare) och tas emot av organisationens digitala arkiv. | MF-02 | Spara som PDF/A-2 | Bekräftad (PDF/A-2 beslutad 2026-11-12; arkivets mottagande oklart, ägaren: "utgå från det") |
| BH-018 | Behov | "Dold information behöver kontrolleras. Det vill säga att sådan data uppmärksammas användaren innan filen sätts samman."; "Användaren måste både kunna se sådan data samt kunna ändra den, i alla fall om det är text." (2026-11-12) | Användaren behöver att appen, innan resultatet sätts samman, visar dold information i de inlästa filerna och låter hen ändra den när det är text: metadata som titel, författare, ämne och nyckelord samt text i kommentarer. Övrig dold information (bifogade filer, formulärfält, inbäddade skript) visas och kan tas bort; skript och bilagor som PDF/A-2 inte tillåter tas bort och användaren får veta det (ägaren 2026-11-12: "Ja"). | Måste | Med en testfil som innehåller metadata, en kommentar, en bilaga och ett skript visar appen allt detta innan filen sparas. Användaren ändrar författare och titel, och den sparade filen har de nya värdena. Det som tagits bort finns inte kvar i filen. | MF-02 | Panel "Dold information" före sparande | Bekräftad |
| FV-001 | Förväntning | "kollegor utan särskild datorvana"; "första gången lyckas"; "Vi kan sätta 5 minuter för att slå samman tre sidor från en pdf med 2 sidor från en annan med en textetikett på en förvald position (centrerat sidhuvud)" (2026-11-12) | Användaren förväntar sig att förstå appen direkt, utan instruktioner eller utbildning. | Måste | En kollega som inte sett appen förut, utan hjälp eller instruktioner, sätter på högst 5 minuter samman tre sidor ur en PDF med två sidor ur en annan och lägger en textetikett centrerat i sidhuvudet, och resultatet blir rätt. | MF-01 | | Bekräftad |

### IN-03 Ägaren (förvaltare)
| ID | Slag | Egna ord / källa | Tolkning ("… behöver att systemet …") | Prio | Valideringskriterium | MF | Lösningsidé | Status |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| BH-016 | Behov | "Appen ska kunna nås på en gemensam sharepoint-sida där den helt enkelt läggs upp."; rangordning: "enkel deployering" (2026-11-12) | Förvaltaren behöver kunna publicera och byta version av appen genom att bara lägga upp den på SharePoint, utan server, installation eller byggsteg. | Måste | Ägaren lägger själv upp en ny version på SharePoint, och en kollega kan använda den direkt utan att installera något. | MF-01 | En enda HTML-fil | Bekräftad |

### IN-07 Organisationen
| ID | Slag | Egna ord / källa | Tolkning ("… behöver att systemet …") | Prio | Valideringskriterium | MF | Lösningsidé | Status |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| FV-002 | Förväntning | "Det kan handla om att användargränssnittet har vissa färger och typsnitt."; "Du kan använda det som finns i GP-MS så länge."; "det är bara appen"; prio "Bör"; "Jag vill dessutom att GP-MS ska förorda att mörka bakgrunder används." (2026-11-12) | Organisationen förväntar sig att appens gränssnitt (inte de sidor användaren skapar) följer den grafiska profilen GP MS (Grafisk profil materielsystem, version 2026-11-12): mörkt tema som standard, profilens färger och kontrastregler, och typsnittet Calibri med Carlito som inbäddad reserv. | Bör | Ägaren jämför appen med GP MS: mörk grund (ui-bakgrund skiffer, ui-yta petrol, ui-text sten-ljus, ui-primar gron, ui-fokus gul), typsnittsstacken Calibri, Carlito, "Segoe UI", Arial, och att inga typsnitt hämtas från en extern tjänst (BG-001, BH-016). | MF-01 | Carlito (SIL OFL 1.1) bäddas in; Calibri används om den är installerad | Bekräftad |

| BG-004 | Begränsning | Lagen (2018:1937) om tillgänglighet till digital offentlig service, via EN 301 549 och WCAG 2.1 nivå AA (OM-08). Ägaren: "Ja utgå från det." (2026-11-12) | Organisationen behöver att appen uppfyller tillgänglighetskraven: allt går att göra med tangentbord, dra och släpp har ett alternativ, information visas inte bara med färg, och appen fungerar med operativsystemets skärmläsare genom beskrivande namn, roller och statusmeddelanden. | Måste | Kontroll mot WCAG 2.1 AA. Hela DS-01 och DS-02 går att genomföra med bara tangentbord och med en skärmläsare (t.ex. NVDA eller Windows Skärmläsaren). | MF-01 | | Bekräftad |

## 2. Behov på utvecklingen (inte systemkrav)
| ID | Egna ord | Vad det betyder för metoden |
| :-- | :-- | :-- |
| UB-02 | "jag vill ha särskild redovisning, en verifieringsrapport, avseende de krav som rör informationssäkerhet" (2026-11-12) | Kraven som rör informationssäkerhet märks i SRS:en. Före release tas en separat verifieringsrapport fram som visar hur vart och ett av dem har verifierats (t.ex. att inget filinnehåll skickas ut, BG-001). Ägaren beslutar utifrån rapporten. |
| UB-01 | "Det är jag, som tillsammans med dig, håller den uppdaterad och utvecklar den om nya behov kommer fram under användning." | Ägaren styr via behov och krav. Nya behov läggs först till här, med valideringskriterium, och tas sedan vidare med ändringsförslag. Appen måste kunna byggas om och publiceras på SharePoint av ägaren utan särskild teknisk kunskap. |

## 3. Driftbild
Bekräftade av ägaren 2026-11-12.

### DS-01 Beslut med inskannad namnteckning
En handläggare har ett beslut som originalfil. Beslutet skrivs ut, skrivs under och skannas in. Handläggaren öppnar appen från SharePoint och lägger in originalfilen och den inskannade filen. Hen drar in alla originalsidor utom beslutssidan, lägger den inskannade sidan på dess plats och ser i förhandsvisningen vilken sida som kommer varifrån. Den inskannade sidan ligger ner, så hen vrider den. Filen sparas på datorn och läggs i det digitala arkivet. Visar: BH-001, BH-002, BH-003, BH-006, BH-014, BH-011, OM-01, OM-06.

### DS-02 Märka en mottagen PDF
En kollega har fått en PDF som ska märkas, till exempel som utkast eller med organisationens logotyp. Hen lägger in filen, väljer en PNG-logotyp med genomskinlig bakgrund, sänker opaciteten och flyttar stämpeln till ett tomt hörn. Sedan lägger hen till texten "UTKAST" i rött med vit bakgrund på alla sidor utom den första. Förhandsvisningen visar en sida i taget och kollegan bläddrar igenom sidorna innan filen sparas och mejlas. Visar: BH-004, BH-005, BH-007, BH-008, BH-009, BH-010, BH-012, BG-003, BH-011.

### DS-03 Förvaltning: något har ändrats i omgivningen
Efter en uppdatering av webbläsaren eller av SharePoint slutar något att fungera, eller så kommer en kollega med ett nytt behov. Ägaren beskriver problemet eller behovet för Claude, en ny version tas fram och provas med samma testfiler som förut, och ägaren lägger upp den på SharePoint i stället för den gamla. Visar: UB-01, OM-02, OM-03.

### DS-04 Fel: något stämmer inte
En kollega lägger in en fil som inte går att läsa, till exempel en lösenordsskyddad eller trasig PDF. Appen säger tydligt vilken fil det gäller och vad som är fel, och de andra filerna påverkas inte. En annan gång har kollegan dragit en textetikett så att den går utanför sidans kant, och förhandsvisningen visar det innan filen sparas. Visar: BH-010, BH-003, FV-001, OM-01.

## 4. Konflikter och avvägningar
| Mellan | Konflikt | Avgörande (datum) |
| :-- | :-- | :-- |
| BH-001 / OM-01 | Om en sida tas ur en digitalt signerad PDF eller filen ändras (stämpel, text) slutar den digitala signaturen att gälla. En inskannad, handskriven signatur påverkas inte. | Avgjort 2026-11-12: appen behöver inte hantera redan digitalt signerade filer. Digital signering sker efteråt på filen som appen skapat (BH-011). Signaturfallet i appen gäller inskannade namnteckningar. |
| BG-001 / OM-03 | Appen ska ligga på SharePoint, men SharePoint kan vara inställt så att det inte kör webbappar. | Avgjort 2026-11-12: HTML-filer körs på SharePoint. |
| BH-017 / BH-007, BH-008 / OM-07 | RA-FS 2009:2 anger PDF/A-1, som inte tillåter genomskinlighet. Genomskinliga stämplar och valbar opacitet går då inte att spara som PDF/A-1 utan att sidan görs om till en bild, och då försvinner sökbar text (BH-006). PDF/A-2 tillåter genomskinlighet. | Avgjort 2026-11-12: appen siktar på PDF/A-2. Ägaren stämmer av med arkivet att PDF/A-2 tas emot. |
| BH-017 / BG-009 / OM-01 | Appen kan inte garantera att godtyckliga inlästa PDF:er uppfyller PDF/A-2, till exempel om de saknar inbäddade typsnitt. Att rätta det skulle kräva att sidan ändras, vilket BG-009 inte tillåter. | `[TO VERIFY]` hanteras i arkitekturen. Förslag: BG-009 går före; appen varnar när en sida hindrar PDF/A-2, i stället för att göra om sidan. |

## 5. Spårbarhet: behov → krav → validering
| Behov | Prio | Krav (SRS) | Valideringstest | Resultat |
| :-- | :-- | :-- | :-- | :-- |

### Krav som hanterar omgivningen
| Krav | Omgivning |
| :-- | :-- |

### Krav som ska tas bort
| Krav | Vad det gör | Varför (beslut, datum) |
| :-- | :-- | :-- |

### Behov utan krav
### Krav utan behov
