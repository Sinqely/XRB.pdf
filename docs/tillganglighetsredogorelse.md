# Tillgänglighetsredogörelse

Version 1.0.0-rc.1 · Krav: FR-DOK-008, NFR-ACC-001, NFR-ACC-002

PDF-bagaren ska kunna användas av så många som möjligt. Den här redogörelsen beskriver hur appen uppfyller lagen (2018:1937) om tillgänglighet till digital offentlig service, kända brister och hur du kan rapportera problem.

## Hur tillgänglig är appen?

Appen är delvis förenlig med WCAG 2.1 nivå AA (EN 301 549). Det som inte är förenligt eller inte är prövat står nedan.

## Det här fungerar

- Allt går att göra med tangentbord. Sidor flyttas med Alt och piltangenterna, vattenstämpel och etikett med piltangenterna. Alla kortkommandon visas med ?.
- Dra och släpp har alltid ett alternativ med knappar.
- Ändringar läses upp i en statusyta för skärmläsare.
- Varningar och val bärs av text, inte bara av färg. Kontrasten uppfyller nivå AA i både mörkt och ljust tema.
- Appen följer inställningen för minskade rörelser.

## Kända brister

- Appen har inte prövats med skärmläsarna NVDA i Edge och VoiceOver i Safari. Det görs före version 1.0.
- Förhandsvisningen av sidorna är bilder. Skärmläsare får sidans nummer och fil, men inte texten på sidan. Använd originalfilen för att läsa innehållet.
- Den sparade PDF-filen får inte bättre tillgänglighet än originalfilerna, eftersom sidornas innehåll aldrig ändras.

## Så har vi testat

Automatisk kontroll med axe mot WCAG 2.1 A och AA i alla dialoger och lägen, i båda teman och i två webbläsarmotorer, vid varje ändring. Alla flöden körs också med bara tangentbord i automatiska prov.

## Rapportera brister

Kontakta den som förvaltar appen i din organisation och beskriv vad som inte fungerar. Om du inte är nöjd med svaret kan du anmäla det till Myndigheten för digital förvaltning (DIGG), som är tillsynsmyndighet.

Redogörelsen uppdaterades 2026-11-12.
