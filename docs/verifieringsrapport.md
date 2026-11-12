# Verifieringsrapport för informationssäkerhet

Version 1.0.0-rc.1 · Krav: NFR-SEC-005, FR-DOK-007

Rapporten visar hur varje krav på informationssäkerhet och integritet har verifierats för den här versionen, och resultatet. De automatiska proven körs i GitHub Actions vid varje ändring, i Chromium (motorn i Edge) och WebKit (motorn i Safari), mot den byggda filen.

## Sammanfattning

Alla automatiska prov är godkända. Två manuella prov återstår och ska göras av Ägaren innan version 1.0 publiceras: nätverksloggen i Edge från SharePoint och provet med nätverket avstängt där.

## Krav för krav

| Krav | Vad kravet säger | Hur det verifieras | Resultat |
| :-- | :-- | :-- | :-- |
| NFR-SEC-001 | Inget filinnehåll, ingen bild och ingen metadata skickas över nätverket. | Automatiskt prov som loggar alla nätverksanrop medan DS-01 (beslut med namnteckning) och DS-02 (märka en PDF) genomförs och filen sparas. Appen har ingen kod som skickar data. | Godkänt: noll anrop. |
| NFR-SEC-002 | Inga nätverksanrop efter att appen laddats; en teknisk spärr hindrar anslutningar. | Innehållssäkerhetsregeln (CSP) står först i filen och spärrar alla anslutningar (`connect-src 'none'` med flera). Bygget kontrollerar regeln och att filen inte hänvisar till externa adresser. Automatiska prov: inga anrop under arbetet, och appen fungerar med nätverket avstängt. Manuellt: nätverksfliken i Edge från SharePoint. | Automatiskt: godkänt. Manuellt: återstår. |
| NFR-SEC-003 | Skript och aktiva element i inlästa PDF-filer körs aldrig. | pdf.js används bara för att visa sidor, utan skriptmotor (`pdf.sandbox` byggs aldrig in, kontrolleras av ESLint), och innehållssäkerhetsregeln tillåter inte `eval`. Testfilen dold.pdf innehåller ett öppningsskript, dokumentskript och fältskript; provet läser in och visar den utan att något skript körs. Skripten tas bort ur den sparade filen. | Godkänt. |
| NFR-SEC-004 | Inget inbakat bibliotek har kända sårbarheter med allvarlighet hög eller kritisk. | `npm audit` mot npm:s sårbarhetsdatabas för de bibliotek som bakas in, vid varje körning. | Godkänt: inga höga eller kritiska. |
| NFR-PRIV-001 | Appen samlar inte in statistik, användningsdata eller felrapporter. | Granskning av koden: det finns ingen sådan kod, och spärren i NFR-SEC-002 hindrar att något skickas. Licenskontrollen visar alla inbakade bibliotek. | Godkänt. |
| NFR-PRIV-002 | Ingen behandling av personuppgifter sker utanför datorn. | Följer av NFR-SEC-001 och NFR-SEC-002: allt arbete sker i webbläsaren och inget skickas. | Godkänt. |
| FR-ALM-008 | Inget dokument, ingen sida, bild eller metadata sparas i webbläsarens beständiga lagring. | ESLint stoppar användning av `localStorage`, `sessionStorage`, IndexedDB och cache utom i temainställningen. Automatiskt prov: efter arbete med filer finns bara temavalet i lagringen. | Godkänt. |

## Övrigt som påverkar säkerheten

- Alla bibliotek och typsnitt har tillåtande licenser (MIT, BSD, ISC, Apache-2.0, 0BSD, Zlib, OFL-1.1). Kontrolleras vid varje körning.
- Den sparade filen är okrypterad, och dold information granskas före sparandet. Skript, programdata och allt från sidor som inte valts tas alltid bort.
- Sidornas innehåll kopieras oförändrat; inget skrivs om eller tolkas på nytt.
