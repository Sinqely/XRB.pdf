# Behov: PDF-bagaren (XRB.pdf)

> Version: 0.1 · Status: Draft · Senast ändrad: 2026-11-12
> Underlag: intervju med ägaren 2026-11-12. Systemkontext: docs/systemkontext.md.

## Ändringslogg
| Version | Datum | Ändring | Orsak (grind eller CHG) |
| :-- | :-- | :-- | :-- |
| 0.1 | 2026-11-12 | Första utkast ur intervju 1. | Behovsfångst steg 4 påbörjat |
| 0.2 | 2026-11-12 | La till BH-007 (genomskinliga områden) och BH-008 (opacitet) för vattenstämpel. | Ägarens tillägg |
| 0.8 | 2026-11-12 | FV-002 bekräftad (Bör, GP MS, bara appen). BG-004 tillgänglighet föreslagen. | Ägarens svar |
| 0.7 | 2026-11-12 | La till IN-07 Organisationen och FV-002 (grafisk profil). | Ägarens tillägg |
| 0.6 | 2026-11-12 | Konflikten om arkivformat avgjord: PDF/A-2. BH-017 bekräftad. | Ägarens beslut |
| 0.5 | 2026-11-12 | Rangordning. La till BH-015 (stämpelstorlek), BH-016 (enkel publicering), BH-017 (arkivbeständighet) och konflikten om PDF/A och genomskinlighet. | Intervju 4 |
| 0.4 | 2026-11-12 | BH-001 utökad (fler än två filer, valfri ordning). La till BH-011–BH-014, BG-003, UB-01, utkast till driftbild, signaturkonflikten avgjord. | Intervju 3 |
| 0.3 | 2026-11-12 | BH-003 skärpt (ständig förhandsvisning med stämplar och text). La till BH-009 (styrd placering) och BH-010 (inte för nära kanten). | Ägarens tillägg |

Rangordning av de viktigaste behoven (ägaren 2026-11-12: "Användbarhet, ingen data skickas externt, enkel deployering."): 1. Användbarhet (FV-001, BH-002, BH-003). 2. BG-001 ingen data skickas externt. 3. BH-016 enkel publicering.

## 1. Behov, förväntningar och begränsningar per intressent

### IN-01 GenesisAI (ägare)
| ID | Slag | Egna ord / källa | Tolkning ("… behöver att systemet …") | Prio | Valideringskriterium | MF | Lösningsidé | Status |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| BG-001 | Begränsning | "Det är viktigt att data (pdf-filerna) aldrig skickas till externa källor." | Ägaren vill att inga PDF-filer eller delar av dem lämnar användarens dator. | Måste | Ägaren kan konstatera att appen fungerar med nätverket avstängt efter att den laddats, och att inget filinnehåll skickas iväg (granskas t.ex. i webbläsarens nätverkslogg). | MF-01 | Allt körs i webbläsaren | Bekräftad |
| BG-002 | Begränsning | "Det får aldrig bli så mycket funktioner som gör att de basala behoven inte möts." | Ägaren vill att appen bara har de funktioner som behövs för grundbehoven. | Måste | Ägarens helhetsbedömning; varje ny funktion prövas mot BH-001–BH-005. | MF-01 | | Bekräftad |
| BG-003 | Begränsning | "Textetiketter och stämplar ska hamna på samma sida hela tiden för att undvika för komplicerade funktioner (i alla fall i en första version)." (2026-11-12) | Ägaren har bestämt att en stämpel eller text får samma placering på alla sidor där den läggs, så att man inte behöver placera den sida för sida, åtminstone i första versionen. Tolkningen "samma ställe" `[TO VERIFY]`. | Måste | Stämpel och text placeras en gång och hamnar på samma ställe på alla valda sidor i den sparade filen. | MF-01 | | Förslag [TO VERIFY] |

### IN-02 Kollegor utan särskild datorvana (användare)
| ID | Slag | Egna ord / källa | Tolkning ("… behöver att systemet …") | Prio | Valideringskriterium | MF | Lösningsidé | Status |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| BH-001 | Behov | "slå samman flera pdf-filer till en"; "bara använda den skannade sidan … resten vill man ha original-dokumentet för"; "Sidor måste kunna väljas fritt från endera fil (och fler än två) genom enkla medel (drag and drop). Alla sidor behöver naturligtvis inte vara med" (2026-11-12) | Användaren behöver att systemet på ett enkelt sätt låter hen plocka valfria sidor ur två eller fler PDF:er, i valfri ordning, och sätta ihop dem till en fil. Sidor som inte väljs kommer inte med. | Måste | Med ett riktigt originaldokument, ett skannat beslut och en tredje fil skapas en fil där beslutssidan ersätter motsvarande originalsida, några sidor är bortvalda och ordningen är den användaren valt. | MF-01 | Dra och släpp | Bekräftad |
| BH-002 | Behov | "kan se och förstå vilka sidor som kommer med från respektive dokument" | Användaren behöver att systemet tydligt visar vilka sidor som är valda och vilket dokument varje sida kommer ifrån. | Måste | En ny användare kan, utan hjälp, peka ut ursprung för varje sida i resultatet. | MF-01 | Miniatyrer märkta per dokument | Förslag [TO VERIFY] |
| BH-003 | Behov | "Användarens förväntningar på slutresultatet (genom förhandsvisning) ska sedan mötas av den sammanslagna filen."; "jätteviktigt att det hela tiden finns en förhandsvisning om hur dokumentet kommer se ut (en sida i taget går bra) med vattenstämplar och textetiketter" (2026-11-12) | Användaren behöver att systemet hela tiden visar hur resultatet kommer att se ut, inklusive vattenstämplar och textetiketter, och att den sparade filen ser ut precis som förhandsvisningen. En sida i taget räcker. | Måste | Under hela arbetet syns en förhandsvisning som uppdateras när användaren ändrar något. Den nedladdade filen jämförs sida för sida med förhandsvisningen: samma sidor, ordning, stämplar och texter på samma ställen. | MF-02 | Förhandsvisning av en sida i taget med bläddring | Bekräftad |
| BH-004 | Behov | "märka upp med en vattenstämpel (bild) … som sedan appliceras på alla eller valda sidor" | Användaren behöver att systemet kan lägga en egen bild som vattenstämpel på alla eller valda sidor. | Måste `[TO VERIFY]` | `[TO VERIFY]` väntar på detaljer | MF-02 | | Förslag [TO VERIFY] |
| BH-007 | Behov | "vattenstämplar måste kunna innehålla transparenta områden (t.ex. genom png)" (2026-11-12) | Användaren behöver att genomskinliga delar av vattenstämpelns bild förblir genomskinliga på sidan, så att innehållet under syns. | Måste | En bild med genomskinlig bakgrund läggs på en textsida; texten syns i de genomskinliga delarna, både i förhandsvisningen och i den sparade filen. | MF-02 | PNG med alfakanal | Bekräftad |
| BH-008 | Behov | "samt att man kan sätta opacitet" (2026-11-12) | Användaren behöver kunna välja hur genomskinlig hela vattenstämpeln ska vara. | Måste | Användaren ställer in en lägre opacitet och ser i förhandsvisningen och i den sparade filen att stämpeln blir svagare och sidans innehåll går att läsa igenom den. | MF-02 | Reglage för opacitet | Bekräftad |
| BH-005 | Behov | "och/eller en valfri text som sedan appliceras på alla eller valda sidor" | Användaren behöver att systemet kan lägga en valfri text på alla eller valda sidor. | Måste `[TO VERIFY]` | `[TO VERIFY]` väntar på detaljer | MF-02 | | Förslag [TO VERIFY] |
| BH-006 | Behov | "vi vill … helst vanlig text som kan sökas och kopieras ifrån" | Användaren behöver att text i originalsidorna går att söka i och kopiera även i den sammanslagna filen. | Måste `[TO VERIFY]` | Sök efter ett ord från originalet i den sammanslagna filen i en vanlig PDF-läsare och kopiera ett stycke. | MF-02 | Sidor kopieras, inte rastreras | Förslag [TO VERIFY] |
| BH-009 | Behov | "Position för dessa måste kunna styras av användaren så att de inte täcker viktiga delar" (2026-11-12) | Användaren behöver kunna bestämma var vattenstämpel och textetikett hamnar på sidan. | Måste | Användaren flyttar en stämpel och en text till en tom yta på en riktig sida, och de hamnar på samma ställe i den sparade filen. | MF-02 | Dra i förhandsvisningen | Bekräftad |
| BH-010 | Behov | "eller för den delen hamnar för nära dokumentets gränser oavsiktligt" (2026-11-12) | Användaren behöver att systemet hindrar eller tydligt varnar för att en stämpel eller text oavsiktligt hamnar för nära eller utanför sidans kant. | Måste | Användaren försöker placera en text nära kanten och märker i förhandsvisningen att den hålls innanför eller att det tydligt syns att den är för nära. Ingen stämpel eller text klipps av i den sparade filen. | MF-02 | Säkerhetsmarginal som visas i förhandsvisningen | Bekräftad |
| BH-011 | Behov | "Den slutliga filen kan användas på många sätt, t.ex. i ett digitalt arkiv … mailas etcetera."; "det är snarast så att det är en pdf skapad av appen som kommer signeras" (2026-11-12) | Användaren behöver att resultatet är en vanlig PDF som kan arkiveras, mejlas och signeras digitalt efteråt. | Måste | Den färdiga filen öppnas i vanliga PDF-läsare, tas emot av arkivet och kan signeras digitalt i organisationens signeringsverktyg. | MF-02 | | Bekräftad |
| BH-012 | Behov | "Textstorlek, färg och eventuellt bakgrundsfärg (för ökad synlighet) måste kunna väljas." (2026-11-12) | Användaren behöver kunna välja textetikettens storlek och färg, och en bakgrundsfärg bakom texten så att den syns bättre. | Måste | Användaren ändrar storlek, färg och bakgrundsfärg och ser resultatet i förhandsvisningen och i den sparade filen. Texten går att läsa på både ljusa och mörka delar av en sida. | MF-02 | | Bekräftad |
| BH-013 | Behov | "I den mån det är möjligt även typsnitt." (2026-11-12) | Användaren vill kunna välja typsnitt för textetiketten. | Bör | Användaren väljer mellan några typsnitt och ser valet i den sparade filen. Å, ä och ö visas korrekt. | MF-02 | Ett litet urval typsnitt | Bekräftad |
| BH-014 | Behov | "Det är dock bra om sidor kan roteras mellan landskap och porträtt." (2026-11-12) | Användaren vill kunna vrida en sida mellan liggande och stående. | Bör | En liggande inskannad sida vrids till stående och är rättvänd i den sparade filen. | MF-02 | | Bekräftad |
| BH-015 | Behov | "Ja storlek på vattenstämpel (obs bild!) ska kunna ändras av användaren på ett intuitivt sätt." (2026-11-12) | Användaren behöver kunna ändra storleken på vattenstämpelns bild på ett sätt som känns självklart. | Måste | En kollega som inte sett appen förut gör stämpeln större och mindre utan hjälp, och storleken i den sparade filen är densamma som i förhandsvisningen. Bilden behåller sina proportioner om inte användaren vill annat. | MF-01, MF-02 | Dra i hörnet i förhandsvisningen | Bekräftad |
| BH-017 | Behov | "Utgå från de krav som härstammar från Arkivlagen (1990:782) samt Riksarkivets föreskrifter … (RA-FS 2009:2)" (2026-11-12) | Användaren behöver att den färdiga filen kan bevaras i det digitala arkivet enligt arkivreglerna. | Måste | Den färdiga filen godkänns vid en kontroll mot PDF/A-2 (t.ex. med en PDF/A-validerare) och tas emot av organisationens digitala arkiv. | MF-02 | Spara som PDF/A-2 | Bekräftad (PDF/A-2 beslutad 2026-11-12; arkivets mottagande `[TO VERIFY]`) |
| FV-001 | Förväntning | "kollegor utan särskild datorvana"; "första gången lyckas" | Användaren förväntar sig att förstå appen direkt, utan instruktioner eller utbildning. | Måste | Ägarens helhetsbedömning efter test med en kollega (MF-01). | MF-01 | | Förslag [TO VERIFY] |

### IN-03 GenesisAI (förvaltare)
| ID | Slag | Egna ord / källa | Tolkning ("… behöver att systemet …") | Prio | Valideringskriterium | MF | Lösningsidé | Status |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| BH-016 | Behov | "Appen ska kunna nås på en gemensam sharepoint-sida där den helt enkelt läggs upp."; rangordning: "enkel deployering" (2026-11-12) | Förvaltaren behöver kunna publicera och byta version av appen genom att bara lägga upp den på SharePoint, utan server, installation eller byggsteg. | Måste | Ägaren lägger själv upp en ny version på SharePoint, och en kollega kan använda den direkt utan att installera något. | MF-01 | En enda HTML-fil | Bekräftad |

### IN-07 Organisationen
| ID | Slag | Egna ord / källa | Tolkning ("… behöver att systemet …") | Prio | Valideringskriterium | MF | Lösningsidé | Status |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| FV-002 | Förväntning | "Det kan handla om att användargränssnittet har vissa färger och typsnitt."; "Du kan använda det som finns i GP-MS så länge."; "det är bara appen"; prio "Bör" (2026-11-12) | Organisationen förväntar sig att appens gränssnitt (inte de sidor användaren skapar) följer den grafiska profilen GP MS (Grafisk profil materielsystem): dess åtta färger och regler för kontrast och viktning. Typsnitt saknas i GP MS och tas fram av ägaren `[TO VERIFY]`. | Bör | Ägaren jämför appen med GP MS: färger och viktning stämmer, och typsnitten följer med appen och hämtas inte från en extern server (BG-001, BH-016). | MF-01 | Sidbakgrund sten-ljus, text skiffer, primär knapp gron, fokus petrol (enligt GP MS) | Bekräftad |

| BG-004 | Begränsning | Lagen (2018:1937) om tillgänglighet till digital offentlig service, via EN 301 549 och WCAG 2.1 nivå AA (OM-08) | Organisationen kan behöva att appen uppfyller tillgänglighetskraven, bland annat att allt går att göra med tangentbord, att dra och släpp har ett alternativ, att information inte bara visas med färg och att appen fungerar med skärmläsare. | `[TO VERIFY]` | Kontroll mot WCAG 2.1 AA, t.ex. att hela DS-01 och DS-02 går att genomföra med bara tangentbord. | MF-01 | | Förslag [TO VERIFY] |

## 2. Behov på utvecklingen (inte systemkrav)
| ID | Egna ord | Vad det betyder för metoden |
| :-- | :-- | :-- |
| UB-01 | "Det är jag, som tillsammans med dig, håller den uppdaterad och utvecklar den om nya behov kommer fram under användning." | Ägaren styr via behov och krav. Nya behov läggs först till här, med valideringskriterium, och tas sedan vidare med ändringsförslag. Appen måste kunna byggas om och publiceras på SharePoint av ägaren utan särskild teknisk kunskap. |

## 3. Driftbild
Utkast `[TO VERIFY]`, skrivet ur intervjuerna.

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
| BH-017 / OM-01 | Appen kan inte garantera att godtyckliga inlästa PDF:er uppfyller PDF/A, till exempel om de saknar inbäddade typsnitt. | `[TO VERIFY]` hanteras i arkitekturen |

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
