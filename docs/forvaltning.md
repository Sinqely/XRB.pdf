# Förvaltningsinstruktion: publicera PDF-bagaren på SharePoint

> Gäller från version 0.1.0 · Krav: NFR-MAINT-002, UC-010 · Utkast, kompletteras inför version 1.0

Ägaren följer stegen nedan för att lägga upp en ny version. Inget av stegen kräver att man skriver kod.

## 1. Hämta den färdiga filen

1. Öppna repot på GitHub och välj fliken **Actions**.
2. Välj den senaste körningen av **CI** på den gren eller version som ska publiceras. Den ska ha en grön bock.
3. Längst ner under **Artifacts**, ladda ner **pdf-bagaren-html**. Packa upp zip-filen; den innehåller `index.html`.
4. Byt namn på filen till `pdf-bagaren.html`.

## 2. Prova i test-mappen

1. Ladda upp `pdf-bagaren.html` till test-mappen på SharePoint.
2. Öppna filen från SharePoint i Edge. Den ska visas som en sida, inte laddas ner.
3. Tryck F12, välj fliken **Nätverk** (Network) och ladda om sidan.
4. Läs in en testfil och välj **Baka ihop och spara**. Kontrollera att den sparade filen öppnas och har rätt sidor.
5. Kontrollera i nätverksfliken att inga nya rader dyker upp efter att sidan laddats (förutom rader som börjar med `blob:` eller `data:`).
6. Stäng av nätverket (till exempel flygplansläge), läs in en fil igen och spara. Det ska fungera.
7. Notera hur lång tid sidan tog att bli klar (mål: högst 3 sekunder, NFR-PERF-004).
8. Gör samma prov i Safari på Mac om möjligt.

Om något inte fungerar: beskriv vad som hände för Claude, gärna med en skärmbild av nätverksfliken eller konsolen.

## 3. Publicera

1. Ladda upp `pdf-bagaren.html` till den gemensamma SharePoint-sidan och ersätt den gamla filen.
2. Öppna den publicerade filen och kontrollera versionsnumret på om-sidan (från version 1.0).
3. Notera publiceringen i [CHANGELOG.md](../CHANGELOG.md) om det inte redan är gjort.
