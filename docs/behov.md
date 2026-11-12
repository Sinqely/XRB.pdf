# Behov: PDF-bagaren (XRB.pdf)

> Version: 0.1 · Status: Draft · Senast ändrad: 2026-11-12
> Underlag: intervju med ägaren 2026-11-12. Systemkontext: docs/systemkontext.md.

## Ändringslogg
| Version | Datum | Ändring | Orsak (grind eller CHG) |
| :-- | :-- | :-- | :-- |
| 0.1 | 2026-11-12 | Första utkast ur intervju 1. | Behovsfångst steg 4 påbörjat |
| 0.2 | 2026-11-12 | La till BH-007 (genomskinliga områden) och BH-008 (opacitet) för vattenstämpel. | Ägarens tillägg |
| 0.3 | 2026-11-12 | BH-003 skärpt (ständig förhandsvisning med stämplar och text). La till BH-009 (styrd placering) och BH-010 (inte för nära kanten). | Ägarens tillägg |

Rangordning av de viktigaste behoven: `[TO VERIFY]` väntar på ägaren.

## 1. Behov, förväntningar och begränsningar per intressent

### IN-01 GenesisAI (ägare)
| ID | Slag | Egna ord / källa | Tolkning ("… behöver att systemet …") | Prio | Valideringskriterium | MF | Lösningsidé | Status |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| BG-001 | Begränsning | "Det är viktigt att data (pdf-filerna) aldrig skickas till externa källor." | Ägaren vill att inga PDF-filer eller delar av dem lämnar användarens dator. | Måste | Ägaren kan konstatera att appen fungerar med nätverket avstängt efter att den laddats, och att inget filinnehåll skickas iväg (granskas t.ex. i webbläsarens nätverkslogg). | MF-01 | Allt körs i webbläsaren | Bekräftad |
| BG-002 | Begränsning | "Det får aldrig bli så mycket funktioner som gör att de basala behoven inte möts." | Ägaren vill att appen bara har de funktioner som behövs för grundbehoven. | Måste | Ägarens helhetsbedömning; varje ny funktion prövas mot BH-001–BH-005. | MF-01 | | Bekräftad |

### IN-02 Kollegor utan särskild datorvana (användare)
| ID | Slag | Egna ord / källa | Tolkning ("… behöver att systemet …") | Prio | Valideringskriterium | MF | Lösningsidé | Status |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| BH-001 | Behov | "slå samman flera pdf-filer till en"; "bara använda den skannade sidan … resten vill man ha original-dokumentet för" | Användaren behöver att systemet kan plocka valfria sidor ur flera PDF:er och sätta ihop dem till en fil. | Måste | Med ett riktigt originaldokument och ett skannat beslut skapas en fil där beslutssidan ersätter motsvarande sida. | MF-01 | | Förslag [TO VERIFY] |
| BH-002 | Behov | "kan se och förstå vilka sidor som kommer med från respektive dokument" | Användaren behöver att systemet tydligt visar vilka sidor som är valda och vilket dokument varje sida kommer ifrån. | Måste | En ny användare kan, utan hjälp, peka ut ursprung för varje sida i resultatet. | MF-01 | Miniatyrer märkta per dokument | Förslag [TO VERIFY] |
| BH-003 | Behov | "Användarens förväntningar på slutresultatet (genom förhandsvisning) ska sedan mötas av den sammanslagna filen."; "jätteviktigt att det hela tiden finns en förhandsvisning om hur dokumentet kommer se ut (en sida i taget går bra) med vattenstämplar och textetiketter" (2026-11-12) | Användaren behöver att systemet hela tiden visar hur resultatet kommer att se ut, inklusive vattenstämplar och textetiketter, och att den sparade filen ser ut precis som förhandsvisningen. En sida i taget räcker. | Måste | Under hela arbetet syns en förhandsvisning som uppdateras när användaren ändrar något. Den nedladdade filen jämförs sida för sida med förhandsvisningen: samma sidor, ordning, stämplar och texter på samma ställen. | MF-02 | Förhandsvisning av en sida i taget med bläddring | Bekräftad |
| BH-004 | Behov | "märka upp med en vattenstämpel (bild) … som sedan appliceras på alla eller valda sidor" | Användaren behöver att systemet kan lägga en egen bild som vattenstämpel på alla eller valda sidor. | Måste `[TO VERIFY]` | `[TO VERIFY]` väntar på detaljer | MF-02 | | Förslag [TO VERIFY] |
| BH-007 | Behov | "vattenstämplar måste kunna innehålla transparenta områden (t.ex. genom png)" (2026-11-12) | Användaren behöver att genomskinliga delar av vattenstämpelns bild förblir genomskinliga på sidan, så att innehållet under syns. | Måste | En bild med genomskinlig bakgrund läggs på en textsida; texten syns i de genomskinliga delarna, både i förhandsvisningen och i den sparade filen. | MF-02 | PNG med alfakanal | Bekräftad |
| BH-008 | Behov | "samt att man kan sätta opacitet" (2026-11-12) | Användaren behöver kunna välja hur genomskinlig hela vattenstämpeln ska vara. | Måste | Användaren ställer in en lägre opacitet och ser i förhandsvisningen och i den sparade filen att stämpeln blir svagare och sidans innehåll går att läsa igenom den. | MF-02 | Reglage för opacitet | Bekräftad |
| BH-005 | Behov | "och/eller en valfri text som sedan appliceras på alla eller valda sidor" | Användaren behöver att systemet kan lägga en valfri text på alla eller valda sidor. | Måste `[TO VERIFY]` | `[TO VERIFY]` väntar på detaljer | MF-02 | | Förslag [TO VERIFY] |
| BH-006 | Behov | "vi vill … helst vanlig text som kan sökas och kopieras ifrån" | Användaren behöver att text i originalsidorna går att söka i och kopiera även i den sammanslagna filen. | Måste `[TO VERIFY]` | Sök efter ett ord från originalet i den sammanslagna filen i en vanlig PDF-läsare och kopiera ett stycke. | MF-02 | Sidor kopieras, inte rastreras | Förslag [TO VERIFY] |
| BH-009 | Behov | "Position för dessa måste kunna styras av användaren så att de inte täcker viktiga delar" (2026-11-12) | Användaren behöver kunna bestämma var vattenstämpel och textetikett hamnar på sidan. | Måste | Användaren flyttar en stämpel och en text till en tom yta på en riktig sida, och de hamnar på samma ställe i den sparade filen. | MF-02 | Dra i förhandsvisningen | Bekräftad |
| BH-010 | Behov | "eller för den delen hamnar för nära dokumentets gränser oavsiktligt" (2026-11-12) | Användaren behöver att systemet hindrar eller tydligt varnar för att en stämpel eller text oavsiktligt hamnar för nära eller utanför sidans kant. | Måste | Användaren försöker placera en text nära kanten och märker i förhandsvisningen att den hålls innanför eller att det tydligt syns att den är för nära. Ingen stämpel eller text klipps av i den sparade filen. | MF-02 | Säkerhetsmarginal som visas i förhandsvisningen | Bekräftad |
| FV-001 | Förväntning | "kollegor utan särskild datorvana"; "första gången lyckas" | Användaren förväntar sig att förstå appen direkt, utan instruktioner eller utbildning. | Måste | Ägarens helhetsbedömning efter test med en kollega (MF-01). | MF-01 | | Förslag [TO VERIFY] |

## 2. Behov på utvecklingen (inte systemkrav)
| ID | Egna ord | Vad det betyder för metoden |
| :-- | :-- | :-- |

## 3. Driftbild
Väntar på steg 5.

## 4. Konflikter och avvägningar
| Mellan | Konflikt | Avgörande (datum) |
| :-- | :-- | :-- |
| BH-001 / OM-01 | Om en sida tas ur en digitalt signerad PDF eller filen ändras (stämpel, text) slutar den digitala signaturen att gälla. En inskannad, handskriven signatur påverkas inte. | `[TO VERIFY]` |

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
