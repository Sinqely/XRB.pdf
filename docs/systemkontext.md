# Systemkontext: PDF-bagaren (XRB.pdf)

> Version: 0.1 · Status: Draft · Senast ändrad: 2026-11-12

## Ändringslogg
| Version | Datum | Ändring | Orsak (grind eller CHG) |
| :-- | :-- | :-- | :-- |
| 0.1 | 2026-11-12 | Första utkast ur ägarens beskrivning, före intervju. | Behovsfångst startad |
| 0.2 | 2026-11-12 | Syfte, avgränsning och mått på framgång från intervju 1. Förslag till intressenter och omgivning. | Behovsfångst steg 1–3 |
| 0.3 | 2026-11-12 | Förvaltare och publicering (SharePoint) bekräftade, mottagare och digitalt arkiv tillagda, signaturfrågan avgjord. | Intervju 3 |
| 0.4 | 2026-11-12 | SharePoint kör HTML bekräftat. Arkivregler (Arkivlagen, RA-FS 2009:2) tillagda i omgivningen. | Intervju 4 |
| 0.5 | 2026-11-12 | La till IN-07 Organisationen (grafisk profil) och OM-08 tillgänglighetskrav. | Ägarens tillägg |
| 0.7 | 2026-11-12 | Omgivningstabellen återställd (OM-01–OM-08 hade fallit bort vid en tidigare redigering); status för RA-FS 2009:2 kontrollerad. | Förberedelse G0 |
| 0.6 | 2026-11-12 | Ägaren benämns neutralt "Ägaren". | Ägarens önskemål |

> `[TO VERIFY]` = härlett, inte bekräftat.

## 1. Syfte och avgränsning
Problem eller möjlighet, med användarens ord: "en enkel tjänst som fristående webb-applikation som kan kombinera valfria sidor ur flera pdf samt tillföra vattenstämplar och textetiketter på alla valda sidor." "Det ska vara användarvänligt och bara de mest grundläggande funktionerna i fokus." Projektbeskrivning: "baka ihop flera pdf-filer utan att data behöver skickas till externa tjänster."

Användare och situation (intervju 2026-11-12): "kollegor utan särskild datorvana som behöver kunna slå samman flera pdf-filer till en." Exempel: ett påskrivet beslut skannas in, men man vill bara använda den skannade sidan med beslut och signatur och i övrigt "original"-dokumentet, eftersom man helst vill ha vanlig text som kan sökas och kopieras. Ett annat exempel: en mottagen PDF ska märkas upp med en vattenstämpel (bild) och/eller valfri text på alla eller valda sidor.

Systemet ska inte vara: "Det får aldrig bli så mycket funktioner som gör att de basala behoven inte möts." "Det är viktigt att data (pdf-filerna) aldrig skickas till externa källor." (Se BG-001, BG-002.)

## 2. Mått på framgång
| ID | Mått | Hur det bedöms |
| :-- | :-- | :-- |
| MF-01 | "En användare som prövar webb-applikationen första gången lyckas baka ihop två pdf och kan se och förstå vilka sidor som kommer med från respektive dokument." | En kollega som inte sett appen förut får två egna PDF:er och lyckas utan hjälp skapa en sammanslagen fil, och kan innan nedladdning peka ut vilka sidor som kommer från vilket dokument. |
| MF-02 | "Användarens förväntningar på slutresultatet (genom förhandsvisning) ska sedan mötas av den sammanslagna filen." | Den nedladdade filen öppnad i vanlig PDF-läsare har samma sidor, ordning, vattenstämplar och texter som förhandsvisningen visade. |

## 3. Systemet i fokus (SoI)
Ingår: en webbapplikation som körs helt i användarens webbläsare. Den läser in flera PDF-filer från användarens dator, visar sidorna, låter användaren välja (och ev. ordna) sidor, lägger vattenstämpel (bild) och/eller text på alla eller valda sidor, förhandsvisar resultatet och sparar det som en ny PDF på användarens dator.
Ligger utanför (fast): webbläsaren och arbetsdatorn, källfilerna och hur de skapats (t.ex. skanner), PDF-formatet, SharePoint-sidan där appen publiceras, och vart den färdiga filen tar vägen efteråt (e-post, diarium, arkiv). Ingen server tar emot eller behandlar dokument.

## 4. Intressentregister
| ID | Intressent | Kategori | Roll gentemot systemet | Intresse | Inflytande (och hur) | Påverkas av systemet | Talesperson / källa | Status |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| IN-01 | Ägaren | Ägare eller beställare | Beslutar, prioriterar, godkänner | Ett enkelt verktyg som kollegor faktiskt kan använda | Hög: beslutar och godkänner vid grindar | – | Användaren själv | Bekräftad |
| IN-02 | Kollegor utan särskild datorvana | Användare | Använder appen för att sätta ihop och märka PDF:er | Få rätt dokument snabbt utan att behöva lära sig ett verktyg | Medel: om de inte klarar det har appen misslyckats (MF-01) | Sparar tid, slipper skicka filer till externa tjänster | Ägaren som företrädare | Bekräftad |
| IN-03 | Ägaren (förvaltare), tillsammans med Claude | Förvaltare | Lägger upp appen på SharePoint, uppdaterar och vidareutvecklar den när nya behov dyker upp | Att det går att ändra appen enkelt och säkert | Hög: beslutar om ändringar | Behöver kunna byta version utan krångel | Användaren själv: "Det är jag, som tillsammans med dig, håller den uppdaterad och utvecklar den om nya behov kommer fram under användning." | Bekräftad |
| IN-04 | Mottagare av den färdiga filen (digitalt arkiv, e-postmottagare, den som signerar) | Berörda utan att använda | Får, arkiverar, läser eller signerar resultatet | En vanlig, fungerande PDF som kan arkiveras, mejlas och signeras | Låg till medel: ett arkiv kan ställa krav på format `[TO VERIFY]` | Får ett sammansatt dokument | Ägaren: "Den slutliga filen kan användas på många sätt, t.ex. i ett digitalt arkiv … mailas etcetera." | Bekräftad |
| IN-05 | Organisationens IT/informationssäkerhet | Ägare av möjliggörande system / regelägare | Kan behöva godkänna att appen används på arbetsdatorer | Att känsliga handlingar inte läcker | `[TO VERIFY]` kan stoppa | | `[TO VERIFY]` | Förslag [TO VERIFY] |
| IN-06 | Personer som nämns i dokumenten | Den som kan skadas | Ingen | Att deras uppgifter inte sprids | Låg, men tungt vägande | Skadas om filer läcker | Företräds genom BG-001 | Förslag [TO VERIFY] |
| IN-07 | Organisationen som sådan (genom t.ex. kommunikationsavdelningen och den grafiska profilen) | Ägare eller beställare / berörd | Appen används i organisationens namn av dess medarbetare | Att appen ser ut som en del av organisationen och följer den grafiska profilen | Medel: sätter villkor för utseende `[TO VERIFY]` | Varumärket påverkas av hur appen ser ut | Ägaren som företrädare; grafisk profil GP MS (claude.ai-artefakt "Grafisk profil materielsystem", läst 2026-11-12), typsnitt saknas | Bekräftad |

## 5. Omgivning att föra vidare till arkitekturen
| ID | Omgivning | Typ | Vad den påverkar | Vad som ligger fast | Stabilitet | Upplevs av | Källa (datum) |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| OM-01 | PDF-filer som indata: textbaserade original och inskannade sidor (bild) | Externt system / format | Inläsning, visning, att text förblir sökbar | Hur filerna skapats; ev. lösenordsskydd, saknade inbäddade typsnitt och digitala signaturer | Stabilt format, varierande innehåll | IN-02 (BH-006) | Intervju 2026-11-12 |
| OM-02 | Webbläsare på kollegornas arbetsdatorer | Driftmiljö | Vad appen kan göra lokalt, filhantering | `[TO VERIFY]` vilka webbläsare och om de styrs av IT | Uppdateras löpande | | `[TO VERIFY]` |
| OM-03 | Gemensam SharePoint-sida där appen "helt enkelt läggs upp" | Möjliggörande system / driftmiljö | Hur kollegorna når appen och hur nya versioner publiceras | Organisationens SharePoint och dess inställningar. Bekräftat 2026-11-12: HTML-filer körs på organisationens SharePoint. | Styrs av IT | IN-01, IN-03 (BH-016) | Intervju 2026-11-12 |
| OM-04 | PDF-bibliotek för webbläsaren (läsa, visa och skriva PDF) | Möjliggörande system | Hur sammanslagning, stämplar, förhandsvisning och PDF/A-2 byggs | Väljs i arkitekturen; måste kunna följa med appen utan extern hämtning | | | – |
| OM-05 | Dataskydd och sekretess för handlingar (t.ex. GDPR, ev. offentlighets- och sekretesslagen) | Regler och domänkunskap | Att inga dokument lämnar datorn | Lagkraven | Stabilt | IN-01 (BG-001), IN-06 | `[TO VERIFY]` |
| OM-06 | Digitalt arkiv och verktyg för digital signering som tar emot den färdiga filen | Externt system | Vilket PDF-format resultatet behöver ha | Arkivets och signeringsverktygets krav. Att arkivet tar emot PDF/A-2 `[TO VERIFY]` | | IN-04 (BH-011, BH-017) | Intervju 2026-11-12 |
| OM-07 | Arkivlagen (1990:782) och Riksarkivets föreskrifter om tekniska krav för elektroniska handlingar, RA-FS 2009:2 | Regler och domänkunskap | Vilket filformat den färdiga filen bör ha när den ska bevaras | RA-FS 2009:2 anger PDF/A-1 (ISO 19005-1) för kontorsdokument och skannade handlingar (4 och 7 §§). PDF/A-1 tillåter inte genomskinlighet. Riksarkivet remitterade i mars 2026 ett förslag att upphäva RA-FS 2009:2 och i stället styra med funktionskrav, vägledning och en lista med format som tas emot. Riksarkivets webbplats (läst 2026-11-12) säger att beslut planeras "efter sommaren 2026"; något beslut har inte gått att hitta, så tills vidare gäller RA-FS 2009:2. Ägaren har valt PDF/A-2 (2026-11-12). Föreskrifterna gäller statliga myndigheter; kommuner och regioner följer sina egna arkivregler. | Under förändring | IN-01, IN-04 (BH-017) | lagen.nu/ra-fs/2009:2; Riksarkivet PM till RA-FS 2009:2, mars 2026; riksarkivet.se/inlagg/riksarkivet-avser-att-upphava-ra-fs-20092 (lästa 2026-11-12) |
| OM-08 | Lagen (2018:1937) om tillgänglighet till digital offentlig service (EN 301 549, WCAG 2.1 AA) | Regler och domänkunskap | Att appen går att använda för alla kollegor, t.ex. med tangentbord, skärmläsare och tillräckliga färgkontraster | Lagens krav. Ägaren har bestämt att organisationen omfattas (2026-11-12). | Stabilt | IN-02, IN-07 (BG-004) | Ägaren 2026-11-12 |

## 6. Prövade men bortvalda
| Kandidat | Varför bortvald |
| :-- | :-- |
