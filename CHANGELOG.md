# Versionshistorik

Alla versioner av PDF-bagaren (NFR-MAINT-003).

## 0.2.0 – 2026-11-12

FEAT-001 Baka ihop sidor ur flera filer.

- Läs in flera PDF-filer med filväljaren eller genom att dra in dem i fönstret.
- Varje fil visas med namn, antal sidor, storlek och alla sidor som miniatyrer.
- Klicka på en miniatyr (eller tryck Enter/Mellanslag) för att lägga till eller ta bort sidan. "Lägg till alla sidor" och "Ta bort ur resultatet" finns per fil.
- Resultatraden visar sidorna i ordning. Flytta med dra och släpp, pilknapparna eller Alt+piltangent; ta bort med knapp eller Delete. Varje ändring läses upp av skärmläsare.
- "Baka ihop och spara" öppnar en dialog där du väljer filnamn. Sidorna kopieras orörda.
- Nya filer läggs inte längre automatiskt i resultatet.
- Ännu inte med: granskning av dold information före sparandet (kommer med FEAT-008), förhandsvisning (FEAT-003).

## 0.1.1 – 2026-11-12

- Rättat: appen fastnade på "Läser in" i Edge och Chrome när filen öppnades direkt från disken. Arbetstrådarna bakas nu in i klassiskt format.
- Nytt test som öppnar den byggda filen från disken, läser in två PDF:er och sparar resultatet.

## 0.1.0 – 2026-11-12 (gångbart skelett, inte för användning)
- En HTML-fil med innehållspolicy som spärrar alla nätverksanrop.
- Skal enligt GP MS med mörkt och ljust tema.
- Läsa in PDF-filer, se namn, sidantal och första miniatyren.
- "Baka ihop och spara" sparar alla inlästa sidor i en ny PDF.
