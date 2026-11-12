# Systemkontext: PDF-bagaren (XRB.pdf)

> Version: 0.1 · Status: Draft · Senast ändrad: 2026-11-12

## Ändringslogg
| Version | Datum | Ändring | Orsak (grind eller CHG) |
| :-- | :-- | :-- | :-- |
| 0.1 | 2026-11-12 | Första utkast ur ägarens beskrivning, före intervju. | Behovsfångst startad |
| 0.2 | 2026-11-12 | Syfte, avgränsning och mått på framgång från intervju 1. Förslag till intressenter och omgivning. | Behovsfångst steg 1–3 |
| 0.3 | 2026-11-12 | Förvaltare och publicering (SharePoint) bekräftade, mottagare och digitalt arkiv tillagda, signaturfrågan avgjord. | Intervju 3 |

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
Ingår `[TO VERIFY]`: en webbapplikation som körs helt i användarens webbläsare. Den läser in flera PDF-filer från användarens dator, visar sidorna, låter användaren välja (och ev. ordna) sidor, lägger vattenstämpel (bild) och/eller text på alla eller valda sidor, förhandsvisar resultatet och sparar det som en ny PDF på användarens dator.
Ligger utanför (fast) `[TO VERIFY]`: webbläsaren och arbetsdatorn, källfilerna och hur de skapats (t.ex. skanner), PDF-formatet, SharePoint-sidan där appen publiceras, och vart den färdiga filen tar vägen efteråt (e-post, diarium, arkiv). Ingen server tar emot eller behandlar dokument.

## 4. Intressentregister
| ID | Intressent | Kategori | Roll gentemot systemet | Intresse | Inflytande (och hur) | Påverkas av systemet | Talesperson / källa | Status |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| IN-01 | GenesisAI (ägare) | Ägare eller beställare | Beslutar, prioriterar, godkänner | Ett enkelt verktyg som kollegor faktiskt kan använda | Hög: beslutar och godkänner vid grindar | – | Användaren själv | Bekräftad |
| IN-02 | Kollegor utan särskild datorvana | Användare | Använder appen för att sätta ihop och märka PDF:er | Få rätt dokument snabbt utan att behöva lära sig ett verktyg | Medel: om de inte klarar det har appen misslyckats (MF-01) | Sparar tid, slipper skicka filer till externa tjänster | GenesisAI som företrädare | Bekräftad |
| IN-03 | GenesisAI (förvaltare), tillsammans med Claude | Förvaltare | Lägger upp appen på SharePoint, uppdaterar och vidareutvecklar den när nya behov dyker upp | Att det går att ändra appen enkelt och säkert | Hög: beslutar om ändringar | Behöver kunna byta version utan krångel | Användaren själv: "Det är jag, som tillsammans med dig, håller den uppdaterad och utvecklar den om nya behov kommer fram under användning." | Bekräftad |
| IN-04 | Mottagare av den färdiga filen (digitalt arkiv, e-postmottagare, den som signerar) | Berörda utan att använda | Får, arkiverar, läser eller signerar resultatet | En vanlig, fungerande PDF som kan arkiveras, mejlas och signeras | Låg till medel: ett arkiv kan ställa krav på format `[TO VERIFY]` | Får ett sammansatt dokument | GenesisAI: "Den slutliga filen kan användas på många sätt, t.ex. i ett digitalt arkiv … mailas etcetera." | Bekräftad |
| IN-05 | Organisationens IT/informationssäkerhet | Ägare av möjliggörande system / regelägare | Kan behöva godkänna att appen används på arbetsdatorer | Att känsliga handlingar inte läcker | `[TO VERIFY]` kan stoppa | | `[TO VERIFY]` | Förslag [TO VERIFY] |
| IN-06 | Personer som nämns i dokumenten | Den som kan skadas | Ingen | Att deras uppgifter inte sprids | Låg, men tungt vägande | Skadas om filer läcker | Företräds genom BG-001 | Förslag [TO VERIFY] |

## 5. Omgivning att föra vidare till arkitekturen
| ID | Omgivning | Typ | Vad den påverkar | Vad som ligger fast | Stabilitet | Upplevs av | Källa (datum) |
x Prövade men bortvalda
| Kandidat | Varför bortvald |
| :-- | :-- |
