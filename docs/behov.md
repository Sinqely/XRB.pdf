# Behov: PDF-bagaren (XRB.pdf)

> Version: 0.1 · Status: Draft · Senast ändrad: 2026-11-12
> Underlag: intervju med ägaren 2026-11-12. Systemkontext: docs/systemkontext.md.

## Ändringslogg
| Version | Datum | Ändring | Orsak (grind eller CHG) |
| :-- | :-- | :-- | :-- |
| 0.1 | 2026-11-12 | Första utkast ur intervju 1. | Behovsfångst steg 4 påbörjat |

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
| BH-003 | Behov | "Användarens förväntningar på slutresultatet (genom förhandsvisning) ska sedan mötas av den sammanslagna filen." | Användaren behöver att systemet visar resultatet innan det sparas, och att den sparade filen ser ut precis som förhandsvisningen. | Måste | Nedladdad fil jämförs sida för sida med förhandsvisningen: samma sidor, ordning, stämplar och texter. | MF-02 | | Förslag [TO VERIFY] |
| BH-004 | Behov | "märka upp med en vattenstämpel (bild) … som sedan appliceras på alla eller valda sidor" | Användaren behöver att systemet kan lägga en egen bild som vattenstämpel på alla eller valda sidor. | Måste `[TO VERIFY]` | `[TO VERIFY]` väntar på detaljer | MF-02 | | Förslag [TO VERIFY] |
| BH-005 | Behov | "och/eller en valfri text som sedan appliceras på alla eller valda sidor" | Användaren behöver att systemet kan lägga en valfri text på alla eller valda sidor. | Måste `[TO VERIFY]` | `[TO VERIFY]` väntar på detaljer | MF-02 | | Förslag [TO VERIFY] |
| BH-006 | Behov | "vi vill … helst vanlig text som kan sökas och kopieras ifrån" | Användaren behöver att text i originalsidorna går att söka i och kopiera även i den sammanslagna filen. | Måste `[TO VERIFY]` | Sök efter ett ord från originalet i den sammanslagna filen i en vanlig PDF-läsare och kopiera ett stycke. | MF-02 | Sidor kopieras, inte rastreras | Förslag [TO VERIFY] |
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
