# Versionshistorik

Alla versioner av PDF-bagaren (NFR-MAINT-003).

## 1.0.0-rc.1 – 2026-11-12

Alla funktioner i byggplanen (FEAT-002..011), för samlad granskning före version 1.0.

- **Förhandsvisning** (FEAT-003): en sida i taget med bläddring, tangenter och zoom.
- **Felbesked** (FEAT-002): inte PDF, för stor, lösenord, skadad fil och sidgräns.
- **Ångra, gör om och börja om** (FEAT-005), och en fråga innan fliken stängs med osparat arbete.
- **Arkivformat PDF/A-2b** (FEAT-009) är förvalt. Sidor som hindrar arkivformatet listas med orsak; du kan ta bort dem, avbryta eller spara som vanlig PDF.
- **Vattenstämpel** (FEAT-006): PNG eller JPEG, opacitet, storlek, sex placeringar eller dra själv, val av sidor.
- **Textetikett** (FEAT-007): text upp till 200 tecken, storlek, färg, bakgrund, tre typsnitt, fet och kursiv.
- **Dold information** (FEAT-008): visas före sparandet. Ändra titel, författare, ämne och nyckelord, ändra eller ta bort kommentarer, bifogade filer och formulärfält. Skript tas alltid bort, och inget från sidor som inte valts följer med i filen.
- **Hjälp och kortkommandon** (FEAT-010): hjälpknapp vid varje steg, steg för steg för de två vardagsfallen, kortkommandon med ?.
- **Om PDF-bagaren** (FEAT-011): version, licenser, verifieringsrapport och tillgänglighetsredogörelse.
- **Vrida, visa stort och lägga till igen** (FEAT-004): R och Skift+R vrider sidan.
- Rättat: sifferfält återställdes ibland medan man skrev. Miniatyrerna ritas snabbare.
- Typsnitten i etiketten är Carlito, Tinos och Cousine (Tinos och Cousine i stället för Liberation Serif och Liberation Mono, som bygger på dem).

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
