# Skärmdesign: FEAT-001 – Baka ihop sidor ur flera filer

> Funktion ur: docs/implementation-plan.md · Hör ihop med: technical-design.md
> Skärmar: SCR-APP-001 (kolumnerna 1 Filer och 2 Resultat), SCR-APP-005 (delvis) · Läge: per funktion · Status: Draft · Datum: 2026-11-12

Ingen ankarskärm har tagits fram och manifestet var tomt, så detta är designsystemets första riktiga prov. Skärmarna har därför granskats mot design.md med ankarnoggrannhet: allt utom en liten sak gick att bygga av befintliga komponenter (se Eskaleringar).

## SCR-APP-001 — Arbetsyta

- **Strategi och källa:** kodnära spec (det här avsnittet är designen). Inget designverktyg är kopplat.
- **Sammansättning:** layouten i design.md §3. Sidhuvud 56 px (`size.sidhuvud`) med appnamn, Tema och `knapp-primar` "Baka ihop och spara". Kolumn 1 Filer 300 px (`size.kolumn-filer`, rullar för sig). Mittkolumnen: rubrik "2 Resultat · N sidor", `resultatrad` 152 px (`size.resultatrad`), under den förhandsvisningsytan. Kolumn 3 Märkning 340 px, synlig men med texten att märkning kommer senare. Statusyta 32 px längst ner. Ångra, Gör om, Börja om, Dold information, Hjälp och Om visas inte förrän deras funktioner byggs (FEAT-005, FEAT-008, FEAT-010, FEAT-011); att visa döda knappar vore förvirrande.
- **Innehåll och data** (technical-design.md §3, §4):
  - Dokumentkort ← `Arbetsyta.dokument[]`: rubrik `namn`; metadata `texter.sidor(sidantal)` + " · " + storlek i MB med en decimal och decimalkomma ("1,2 MB", under 0,1 MB visas "under 0,1 MB") ← `storlekByte`.
  - Miniatyrer ← dokumentregistret (blob-adress per sida eller "ritas"); vald = sidan finns i `Arbetsyta.resultat`.
  - Resultatrad ← `Arbetsyta.resultat[]` i ordning; etikett "P · <dokumentnamn> s. N" (P = plats från 1, N = `sidindex + 1`).
  - Rubrikens antal ← `resultat.length` (FR-SID-011).
  - Statusyta ← `Andring.meddelande` och sparutfallet.
- **Överensstämmelse:** godkänd. Bara tokens och komponenter ur design.md; en kompletterande detalj (släppmarkering i resultatraden) föreslås som tillägg, se Eskaleringar.

### default

**Kolumn 1 Filer**, uppifrån:
1. `slappyta`, i kompakt form när det finns dokument (höjd 96 px: ingress-latt "Dra in fler PDF-filer här" och `knapp-sekundar` "Välj filer"). Hela ytan är en knapp som öppnar filväljaren. Släpp fungerar i hela fönstret; när en fil dras över fönstret får släppytan sitt drag-över-läge (heldragen kant 3 px `--ui-fokus`, texten "Släpp för att läsa in").
2. Ett `dokumentkort` per dokument, i inläsningsordning, avstånd 16 px (`space.4`):
   - Rad 1: dokumentnamnet (mellanrubrik, bryts vid behov, aldrig avkortat utan `title`) och `ikonknapp` "Ta bort fil" (Lucide `trash-2`, `aria-label` "Ta bort Beslut.pdf").
   - Rad 2: metadata "3 sidor · 1,2 MB" i dämpad text, stil `liten`.
   - Rad 3: `knapp-sekundar` "Lägg till alla sidor" och "Ta bort ur resultatet", i rad med 8 px mellanrum; bryts till två rader om de inte får plats. "Lägg till alla sidor" är inaktiv med förklaringen "Alla sidor finns redan i resultatet." när så är fallet; "Ta bort ur resultatet" är inaktiv med "Inga sidor ur dokumentet finns i resultatet." när inga finns.
   - Under: miniatyrrutnät, 2 per rad (88 px + 16 px mellanrum + 88 px; ryms i 300 px med 24 px inre marginal).
3. `miniatyr`: `<button aria-pressed>` med bilden (88 px bred, höjd efter sidans proportion), ram 2 px `--ui-kant`, radie 2 px, och under bilden "Sida 3" i stil `liten`. Tillgängligt namn "Sida 3 av 7 ur Beslut.pdf" och, när vald, ", vald" (FR-DOK-010). Vald: märket "Vald" i övre högra hörnet (bakgrund `--ui-valt`, vit liten fet text, radie 4 px) och ram 2 px `--ui-text`. Klick, Enter eller Mellanslag växlar (B3). Hover: ram `--ui-text`.

**Kolumn 2 Resultat:**
1. Rubrik (kolumnrubrik) "2 Resultat · 4 sidor".
2. `resultatrad`: `<ol>` med `aria-label` "Resultatets sidor", horisontell, rullar vågrätt om sidorna inte får plats (rullningslisten syns). Varje `<li>` är 104 px brett med 8 px mellanrum:
   - Etikett överst "1 · Beslut.pdf s. 2" i `liten`, avkortad med ellips och fullständig text som `title`.
   - Sidans bild, höjd högst 80 px, bredd efter proportion (samma blob-bild som miniatyren).
   - Ikonknappar under bilden: Flytta vänster (`chevron-left`), Flytta höger (`chevron-right`), Ta bort (`x`), 32 × 32 px med 4 px mellanrum. `aria-label` "Flytta sida 1 ur Beslut.pdf till vänster" och så vidare. Flytta vänster är inaktiv på första platsen och Flytta höger på sista, med förklaringen "Sidan är redan först/sist."
   - Elementet självt är fokuserbart (`tabindex="0"`) med namnet "Sida 2 av 3 ur Beslut.pdf, plats 1 av 4". Alt+Vänster/Höger (även Alt+Upp/Ner) flyttar, Delete och Backsteg tar bort. Fokus följer den flyttade sidan; efter borttagning flyttas fokus till sidan som tog dess plats, eller till föregående, eller till rubriken om raden blev tom.
   - Dra och släpp: elementet är `draggable`. Under dragning visas en lodrät släppmarkering 3 px `--ui-fokus` mellan sidorna där sidan hamnar; den dragna sidan får `opacity .5`. Släpp utanför raden avbryter.
   - Vrid och kryssrutorna Stämpel och Etikett ur design.md hör till FEAT-004, FEAT-006 och FEAT-007 och visas inte nu.
3. Förhandsvisningsytan under raden (`--ui-sidyta` behövs inte än): texten "Förhandsvisningen kommer i nästa version." i dämpad text. Byggs i FEAT-003.

**Sidhuvudet:** "Baka ihop och spara" öppnar spara-dialogen (SCR-APP-005).

**Statusytan:** varje meddelande ur technical-design.md §3.1 skrivs dit.

### startläge
Inga dokument. Kolumn 1 är en stor `slappyta` som fyller kolumnens höjd: ingress-latt "Dra in PDF-filer här", `knapp-sekundar` "Välj filer", och under den "Allt sker i din webbläsare. Inga filer skickas någonstans." i dämpad text. Resultatraden visar design.md:s tomtext. "Baka ihop och spara" är inaktiv (se tomt resultat). Startlägets tre steg i förhandsvisningen kommer med FEAT-010.

### läser in
Per fil som läses in visas ett kort med filnamnet och `vantindikator` "Läser in Beslut.pdf …" i stället för metadata och knappar, och kolumnen har `aria-busy="true"` tills alla valda filer är klara. Statusytan säger samma sak. Miniatyrer som ännu inte ritats visas som *ritas*-plattor (`--ui-avdelare`, "Ritar …") i sidans proportion när den är känd, annars 88 × 124 px.

### med filer utan resultat
Som default, men resultatraden visar design.md:s tomtext: "Inga sidor ännu. Klicka på en miniatyr för att lägga till den." Knappen "Baka ihop och spara" är inaktiv.

### med resultat
Default.

### tomt resultat (knappen inaktiv)
"Baka ihop och spara" har `aria-disabled="true"`, `opacity .5` och `aria-describedby` till en synlig text under knappen i sidhuvudet: "Välj minst en sida först." (FR-SPA-010). Klick gör ingenting. Texten ersätter skelettets "Läs in minst en PDF-fil först." när det finns filer men inga valda sidor; utan filer gäller skelettets text.

### fel i område
En fil som inte går att läsa in ger ett `meddelande` (fel) överst i kolumn 1 med `role="alert"`, fet första mening med filnamnet och sedan vad man kan göra (`texter.kundeInteLasas`). Flera fel visas som flera meddelanden, vart och ett med stängknapp. Övriga dokument påverkas inte.

### ritfel för en sida
Miniatyren visar en platta `--ui-avdelare` med texten "Sidan kunde inte visas". Den kan ändå väljas och sparas; sidan kopieras orörd.

- **Bredd:** design.md §3 gäller (från 1 280 px; smalare fönster rullar vågrätt). Ingen särskild anpassning.
- **Beslut:**
  - *Dolda verktyg i sidhuvudet.* Drivare: knappar som inte gör något strider mot FV-001 (begripligt för ovana). Avvisat: visa dem inaktiva med "kommer senare".
  - *Resultatradens bilder 80 px höga.* Drivare: 152 px rad = etikett 20 + bild 80 + knappar 32 + mellanrum 20. Avvisat: miniatyrens 88 px bredd, som ger för höga sidor för raden.

## SCR-APP-005 — Spara (dialog)

- **Strategi och källa:** kodnära spec (det här avsnittet är designen).
- **Sammansättning:** `dialog` 560 px. Mellanrubrik "Baka ihop och spara". Text: "Resultatet har 4 sidor ur 2 filer." `textfalt` "Filnamn" med hjälptexten "Filen sparas där webbläsaren sparar nedladdningar. Ändelsen .pdf läggs till om den saknas." Knapprad nertill höger: `knapp-sekundar` "Avbryt", `knapp-primar` "Spara".
- **Innehåll och data:** filnamnsfältet ← `foreslaFilnamn(yta)`; vid Spara: `stadaFilnamn` → `sparaResultat` (technical-design.md §3.4). Antal sidor och filer ← `resultat.length` och antalet olika `dokumentId`.
- **Överensstämmelse:** godkänd.

### redo
Dialogen öppnas med fokus i filnamnsfältet och namnet markerat utom ".pdf". Enter i fältet = Spara. Esc och Avbryt stänger utan att något händer, och fokus går tillbaka till "Baka ihop och spara".

### sparar
Fältet och båda knapparna är `aria-disabled`, dialogens innehåll har `aria-busy="true"`, och en `vantindikator` "Skapar filen …" visas ovanför knappraden (FR-SPA-011). Esc gör ingenting medan filen skapas. Statusytan säger "Skapar filen …".

### sparad
Dialogen stängs, webbläsaren tar emot filen, statusytan säger "Sparad som beslut-ihopbakad.pdf." och fokus går tillbaka till "Baka ihop och spara". Arbetsytan är oförändrad (FR-SPA-013). Nästa gång dialogen öppnas föreslås samma namn.

### fel
Dialogen stannar öppen. Ett `meddelande` (fel, `role="alert"`) visas överst i dialogen med `texter.sparFel`. Fältet och knapparna blir aktiva igen så att användaren kan försöka igen eller avbryta. Arbetsytan är oförändrad (FR-SPA-012).

### filnamn ändrat till ogiltigt
Det finns inget ogiltigt läge: otillåtna tecken tas bort och tomt namn ersätts med förslaget när användaren sparar. Det sparade namnet står i statusytan, så användaren ser vad det blev.

- **Beslut:**
  - *Felet visas i dialogen, inte på arbetsytan.* Drivare: användaren är kvar i sparflödet och kan försöka igen direkt (UC-007 4b). Avvisat: stänga dialogen och visa felet i sidhuvudet.
  - *Läget "kontrollerar" och valet av format* ur skärmförteckningen hör till FEAT-009 (PDF/A-förkontroll) och finns inte än.

## Gemensamma beslut

- **Ikoner:** Lucide (`trash-2`, `chevron-left`, `chevron-right`, `x`) som inbakade SVG med `currentColor`, 20 px, `aria-hidden="true"`; namnet sitter på knappen. Lucide har ISC-licens, som finns på vitlistan. Ikonerna kopieras in som SVG-filer i `src/resurser/ikoner/` med licensfil, inget nytt npm-beroende.
- **Meddelanden:** alla texter i `src/karna/texter.ts`. Nya texter: "Dra in fler PDF-filer här", "Släpp för att läsa in", "Lägg till alla sidor", "Ta bort ur resultatet", "Ta bort <fil>", "Välj minst en sida först.", "Alla sidor finns redan i resultatet.", "Inga sidor ur dokumentet finns i resultatet.", "Sidan kunde inte visas", "Förhandsvisningen kommer i nästa version.", dialogtexterna ovan och meddelandena i technical-design.md §3.1.
- **Tangentbord i hela flödet:** Tab-ordning sidhuvud → släppyta → per dokument (Ta bort fil, Lägg till alla, Ta bort ur resultatet, miniatyrerna i ordning) → resultatraden (sidorna, och inom varje sida dess knappar) → statusyta.

## Eskaleringar och öppna punkter

- **Förslag till tillägg i design.md (inte blockerande):** `resultatrad` beskriver inte hur platsen markeras under dra och släpp. Förslag: "Under dragning visas en lodrät släppmarkering 3 px `--ui-fokus` mellan sidorna; den dragna sidan får `opacity .5`." Samma färg och tjocklek som släppytans drag-över-läge, alltså inga nya värden. Förs in i design.md när ux-foundations ändras nästa gång; skärmen ovan använder redan formuleringen.
- **Verktyg i sidhuvudet** (Ångra, Gör om, Börja om, Dold information, Hjälp, Om) kommer med sina funktioner.
- **Startlägets tre steg** och förhandsvisningen kommer med FEAT-010 och FEAT-003.
