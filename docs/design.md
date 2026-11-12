# Designsystem: PDF-bagaren

> Sanningskälla för allt gränssnitt, tillsammans med [tokens.json](tokens.json).
> Framtaget av ux-foundations · Källa: GP MS (designfil) · Senast uppdaterad: 2026-11-12
> Gäller appens gränssnitt. Textetiketter och vattenstämplar i resultatet styrs av användaren, inte av GP MS.

## 1. Känsla och uttryck

Lugnt, sakligt och tryggt. Mörk skiffergrund med paneler i petrol, ljus text och en enda grön knapp som visar vägen framåt. Gult används bara för fokus och för det som kräver uppmärksamhet. Gränssnittet ska kännas som ett arbetsbord där dokumenten är huvudsaken: få kontroller synliga åt gången, tydliga steg (1 Filer, 2 Resultat, 3 Märkning, Spara) och inga dekorationer. Förtroendet byggs genom att appen alltid säger vad den gör och att inget lämnar datorn.

## 2. Tokens

Alla värden kommer från tokens.json. Mörkt tema är standard; ljust tema sätts med `data-theme="ljus"` på `<html>` (FR-ALM-009).

### Färger (roller)

| Roll | CSS-variabel | Mörkt | Ljust | Användning |
| :-- | :-- | :-- | :-- | :-- |
| Bakgrund | `--ui-bakgrund` | #484b43 skiffer | #eceae6 sten-ljus | Sidbakgrund, sidhuvud |
| Yta | `--ui-yta` | #003d4c petrol | #d4d5ce sten | Kolumner, paneler, dialoger, släppyta |
| Text | `--ui-text` | #eceae6 | #484b43 | All text |
| Dämpad text | `--ui-text-dampad` | #d4d5ce | #484b43 | Hjälptext, sidantal, filstorlek |
| Kant | `--ui-kant` | #d4d5ce | #74776f | Fält, sekundära knappar, miniatyrram |
| Avdelare | `--ui-avdelare` | #74776f | #d4d5ce | Dekorativa linjer, bär aldrig betydelse |
| Primär | `--ui-primar` | #007167 gron | #007167 | "Baka ihop och spara" och dialogernas huvudknapp |
| Text på primär | `--ui-primar-text` | #ffffff | #ffffff | |
| Fokus | `--ui-fokus` | #ffdd00 gul | #003d4c petrol | Fokusring |
| Markering | `--ui-markering` | #ffdd00 | #df5411 orange | Varningsikon, "ny"-märke; alltid med text |
| Text på markering | `--ui-markering-text` | #484b43 | #ffffff | När markering är en yta (mörkt 6,6:1; ljust bara fet text ≥19 px) |
| Fel | `--ui-fel` | #df5411 orange | #df5411 | Ikon och ram i felmeddelanden, bara grafik |
| Felyta | `--ui-fel-yta` | #003d4c | #eceae6 | Bakgrund i felmeddelanden |
| Vald | `--ui-valt` | #007167 | #007167 | Märket "Vald" på miniatyrer, aktiv flik (med vit text) |
| Sidyta | `--ui-sidyta` | #74776f | #74776f | Bakgrund runt förhandsvisad sida |
| Marginal a/b | `--ui-marginal-a`, `--ui-marginal-b` | #003d4c / #ffdd00 | samma | Säkerhetsmarginalen, streckad i två färger |

```css
:root {
  --ui-bakgrund: #484b43; --ui-yta: #003d4c; --ui-text: #eceae6; --ui-text-dampad: #d4d5ce;
  --ui-kant: #d4d5ce; --ui-avdelare: #74776f; --ui-primar: #007167; --ui-primar-text: #ffffff;
  --ui-fokus: #ffdd00; --ui-markering: #ffdd00; --ui-markering-text: #484b43;
  --ui-fel: #df5411; --ui-fel-yta: #003d4c; --ui-valt: #007167; --ui-sidyta: #74776f;
  --ui-marginal-a: #003d4c; --ui-marginal-b: #ffdd00;
  color-scheme: dark;
}
:root[data-theme="ljus"] {
  --ui-bakgrund: #eceae6; --ui-yta: #d4d5ce; --ui-text: #484b43; --ui-text-dampad: #484b43;
  --ui-kant: #74776f; --ui-avdelare: #d4d5ce; --ui-fokus: #003d4c; --ui-markering: #df5411;
  --ui-markering-text: #ffffff; --ui-fel-yta: #eceae6;
  color-scheme: light;
}
```

**Kontrast** (WCAG 2.1, uträknat): text på bakgrund 7,4:1 (båda teman), text på yta 9,9:1 mörkt / 6,0:1 ljust, dämpad text på yta 8,0:1 mörkt, kant mot bakgrund 6,0:1 mörkt / 3,8:1 ljust, kant mot yta 8,0:1 mörkt / 3,1:1 ljust, vit på primär 5,9:1, fokus mot bakgrund 6,6:1 mörkt / 9,9:1 ljust, fokus mot yta 8,8:1 mörkt / 8,0:1 ljust, felikon (orange) på felyta 3,1:1 mörkt / 3,2:1 ljust (grafik, kräver 3:1). Primär knapp mot yta är bara 2,0:1, därför bärs knappen av sin text och har alltid en text, aldrig bara ikon.

### Typografi

Stack för hela gränssnittet: `Calibri, Carlito, "Segoe UI", Arial, sans-serif`. Carlito är inbakad i fyra snitt (WOFF2, OFL 1.1). Calibri bäddas aldrig in.

| Stil | Storlek / radhöjd | Vikt | Användning |
| :-- | :-- | :-- | :-- |
| `rubrik` | 32 / 38 px | 700 | Hjälp och om-sida. Arbetsytan har ingen stor rubrik. |
| `mellanrubrik` | 22 / 28 px | 700 | Dialogrubriker |
| `kolumnrubrik` | 18 / 24 px | 700 | "1 Filer", "2 Resultat", "3 Märkning", panelrubriker |
| `ingress` | 18 / 26 px | 700 kursiv | Startytans budskap |
| `ingress-latt` | 18 / 26 px | 400 kursiv | Instruktion i släppytan |
| `brodtext` | 16 / 24 px | 400 | All text, knappar, fältetiketter |
| `liten` | 14 / 20 px | 400 | Miniatyrernas namn och sidnummer, metadata. Lägsta storlek. |

Etikettypsnitten (Carlito, Liberation Serif, Liberation Mono) används bara i etikettpanelens typsnittsval och i förhandsvisningen, aldrig i gränssnittstext.

### Avstånd, radier, storlekar

- **Avstånd:** 4, 8, 12, 16, 24, 32, 48 px (`--space-1` … `--space-12`). Inom en kontroll 8–12 px, mellan kontroller i en panel 16 px, mellan paneler och kolumner 16 px, dialogens inre marginal 24 px.
- **Radier:** 2 px miniatyrer, 4 px kontroller och märken, 8 px kolumner, dialoger och meddelanden.
- **Storlekar:** kontrollhöjd 40 px, minsta klickyta 32 × 32 px, ikon 20 px (streck 2 px), kantbredd 2 px, fokusring 3 px med 2 px avstånd.
- **Skuggor:** inga, utom dialoger: `0 8px 32px rgba(0,0,0,.4)` och en halvgenomskinlig bakgrund `rgba(0,0,0,.6)`.
- **Rörelse:** 150 ms ease-out för hover och flikbyte; 0 ms vid `prefers-reduced-motion: reduce`.

## 3. Layout

Ett enda fönster, byggt för datorskärm från 1 280 × 720 px (NFR-COMP-003). Ingen mobil- eller surfplattelayout.

```
┌ Sidhuvud 56 px ─────────────────────────────────────────────────────────────┐
│ PDF-bagaren  Ångra  Gör om  Börja om   Dold information  Hjälp  Om  Tema  [Baka ihop och spara] │
├───────────────┬───────────────────────────────────────────┬─────────────────┤
│ 1 Filer       │ 2 Resultat  (resultatrad, 152 px)          │ 3 Märkning      │
│ 300 px        ├───────────────────────────────────────────┤ 340 px          │
│ släppyta      │ Förhandsvisning (resten av höjden)        │ flikar:         │
│ dokument med  │ ‹ Sida 3 av 7 ›  ur Beslut.pdf, sida 2    │ Vattenstämpel   │
│ miniatyrer    │                                           │ Textetikett     │
└───────────────┴───────────────────────────────────────────┴─────────────────┘
│ Statusyta (aria-live, en rad, 32 px)                                          │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Kolumnerna 1 och 3 rullar var för sig. Mittkolumnen fyller resten. Vid fönsterbredd under 1 280 px får sidan rulla horisontellt hellre än att kolumner försvinner.
- Ordning i DOM och tabbordning: sidhuvud, Filer, Resultat, Förhandsvisning, Märkning, statusyta. Varje område är ett `<section>` med rubrik och landmärke (`<header>`, `<main>`, `aria-label`).
- Startläge (inga filer): Filer-kolumnen är en stor släppyta och förhandsvisningen visar de tre stegen (FR-ALM-005, FR-DOK-002, FR-FHV-010). Märkning är synlig men inaktiv med förklaring.

## 4. Komponenter

Gemensamma tillståndsregler för alla interaktiva komponenter:

- **Fokus:** `outline: 3px solid var(--ui-fokus); outline-offset: 2px`, alltid synlig vid tangentbordsfokus (`:focus-visible`).
- **Hover:** aldrig enda signalen; ändrar kant eller bakgrund enligt komponenten.
- **Inaktiv:** `opacity: .5`, `cursor: not-allowed`, `aria-disabled="true"` och en synlig eller uppläst förklaring varför (FR-SPA-010).
- **Upptagen:** väntindikator med text ("Läser in Beslut.pdf …"), `aria-busy="true"` på området.

**`knapp-primar`** — bakgrund `--ui-primar`, text `--ui-primar-text` 16 px fet, höjd 40 px, padding 0 16 px, radie 4 px, ingen kant. Hover: inre ring `box-shadow: inset 0 0 0 2px var(--ui-primar-text)`. Aktiv: inre ring 3 px. En per vy.

**`knapp-sekundar`** — transparent bakgrund, kant 2 px `--ui-kant`, text `--ui-text`, höjd 40 px, radie 4 px. Hover: bakgrund `--ui-yta` (på bakgrund) eller `--ui-bakgrund` (på yta). Används för Avbryt, Lägg till alla sidor, Välj bild.

**`knapp-text`** — som sekundär men utan kant; understruken text vid hover. Sidhuvudets Ångra, Gör om, Hjälp, Om.

**`ikonknapp`** — 32 × 32 px, ikon 20 px, kant 2 px `--ui-kant`, radie 4 px; alltid `aria-label` och verktygstips med samma text. Används för Flytta vänster/höger, Vrid, Ta bort, Föregående/Nästa sida.

**`farlig-atgard`** — som sekundär, med text som säger vad som försvinner ("Töm arbetsytan"). Kräver bekräftelsedialog (FR-ALM-003). Ingen röd färg; GP MS saknar röd, och betydelsen bärs av text.

**`slappyta`** — yta `--ui-yta`, streckad kant 2 px `--ui-kant`, radie 8 px, ingress-latt "Dra in PDF-filer här" och `knapp-sekundar` "Välj filer". Under drag över: heldragen kant 3 px `--ui-fokus` och texten "Släpp för att läsa in". Hela ytan är också en knapp som öppnar filväljaren.

**`dokumentkort`** — i Filer-kolumnen: rubrik med filnamn (och löpnummer vid dubblett, "Beslut.pdf (2)"), metadata "7 sidor · 1,2 MB" i dämpad text, knappar "Lägg till alla sidor", "Ta bort ur resultatet", ikonknapp "Ta bort fil". Under: miniatyrrutnät, 2 per rad.

**`miniatyr`** — bredd 88 px, sidans bild med ram 2 px `--ui-kant`, radie 2 px, under bilden "Sida 3" i stil `liten`. Tillstånd: *ej vald*; *vald* = märke "Vald" (bakgrund `--ui-valt`, vit text, liten fet) i övre hörnet och ram 2 px `--ui-text`; *ritas* = grå platta `--ui-avdelare` med texten "Ritar …". Klick eller Enter/Mellanslag lägger till sidan sist i resultatet; namnet "Sida 3 av 7 ur Beslut.pdf, vald" (FR-DOK-010).

**`resultatrad`** — horisontell lista (`role="listbox"` med `aria-orientation="horizontal"` eller `<ol>` med knappar) av resultatsidor i ordning, med etikett över varje: "1 · Beslut.pdf s. 2". Varje sida har ikonknappar Flytta vänster, Flytta höger, Vrid, Ta bort, och kryssrutor "Stämpel" och "Etikett" (FR-STA-008, FR-TXT-010). Den aktiva sidan (den som förhandsvisas) har ram 3 px `--ui-text`. Dra och släpp flyttar; tangentbord: Alt+Vänster/Höger flyttar, Delete tar bort. Antal sidor visas i rubriken: "2 Resultat · 7 sidor" (FR-SID-011).

**`forhandsvisning`** — sidan centrerad på `--ui-sidyta` med 24 px marginal; överlägget ritar säkerhetsmarginalen 5 mm streckad (4 px streck i `--ui-marginal-a`, 4 px i `--ui-marginal-b`), stämpel och etikett som de blir i filen. Valt objekt får en dubbel ram (2 px `--ui-marginal-b` utanför 2 px `--ui-marginal-a`) och kan flyttas med mus eller pilar (1 mm, Skift 10 mm). Under sidan: "Sida 3 av 7 · ur Beslut.pdf, sida 2" och Föregående/Nästa (FR-FHV-003, FR-FHV-007, FR-FHV-009). Skala: Anpassa / 100 % (FR-FHV-008).

**`flikar`** — Märkning-kolumnens två flikar Vattenstämpel och Textetikett (`role="tablist"`). Aktiv flik: bakgrund `--ui-valt`, vit fet text; inaktiv: text `--ui-text` och kant nertill 2 px `--ui-avdelare`. Piltangenter byter flik.

**`placeringsvaljare`** — sex knappar i ett rutnät 3 × 2 som en miniatyrsida (Övre vänster, Sidhuvud mitten, Övre höger, Nedre vänster, Sidfot mitten, Nedre höger), `role="radiogroup"`; vald har bakgrund `--ui-valt` och `aria-checked`. Under: fält "Avstånd till kant (mm)" 0–50 med steg 1. Visar "Egen placering" när objektet flyttats fritt (FR-PLC-002..007).

**`skjutreglage`** — för opacitet och storlek: `<input type="range">` med synligt värde och ett bredvidliggande nummerfält ("Opacitet 70 %"), spår 4 px `--ui-kant`, tumme 20 px `--ui-text` med ring vid fokus.

**`textfalt`** — höjd 40 px, bakgrund `--ui-bakgrund` (på yta), kant 2 px `--ui-kant`, radie 4 px, text `--ui-text`. Etikett ovanför, hjälptext under i dämpad text. Fel: kant 2 px `--ui-fel`, felikon och feltext under fältet, `aria-invalid="true"` och `aria-describedby`. Etikettfältet visar teckenräknare "37 av 200" (FR-TXT-002).

**`fargval`** — åtta förvalda färgrutor (tokens.json `color.etikett.*`) som radiogrupp, var och en med namn ("Svart", "Röd"), plus "Egen färg" (`<input type="color">`) och för bakgrund "Ingen". Vald ruta: ram 3 px `--ui-text` och bock.

**`dialog`** — `<dialog>` modal, bredd 560 px (stor: 880 px), yta `--ui-yta`, radie 8 px, inre marginal 24 px, mellanrubrik, innehåll, knapprad nertill höger (sekundär före primär). Esc stänger; fokus flyttas in vid öppning och tillbaka vid stängning.

**`meddelande`** — inline i området det gäller: bakgrund `--ui-fel-yta` (fel) eller `--ui-yta` (info/varning), kant 2 px `--ui-fel` (fel) eller `--ui-markering` (varning), radie 8 px, ikon 20 px först, fet första mening ("Beslut.pdf kunde inte läsas in."), sedan vad man kan göra. Stängknapp. Fel ligger kvar tills de stängs; info försvinner inte av sig själv.

**`statusyta`** — en rad längst ner, `role="status"` / `aria-live="polite"`, text i `liten`. Upprepar korta utfall ("Beslut.pdf inläst, 7 sidor", "Sida flyttad till plats 2"). Fel skickas också med `aria-live="assertive"`.

**`vantindikator`** — 20 px roterande ring i `--ui-text` (stillastående vid reducerad rörelse) med text. Används vid inläsning (FR-FIL-011) och sparande (FR-SPA-011).

**Tomt, upptaget och fel för områden:** Filer tom = släppyta; Resultat tom = "Inga sidor ännu. Klicka på en miniatyr för att lägga till den."; Förhandsvisning tom = de tre stegen; upptaget = väntindikator i området; fel = `meddelande` överst i området.

## 5. Tillgänglighetsregler

Mål: WCAG 2.1 AA enligt EN 301 549 [NFR-ACC-001]; hela DS-01 och DS-02 med tangentbord och med NVDA i Edge och VoiceOver i Safari [NFR-ACC-002].

- Kontrast enligt tabellen i §2; nya färgpar kräver minst 4,5:1 för text och 3:1 för kanter, ikoner och fokus.
- Fokus alltid synlig (3 px `--ui-fokus`), aldrig `outline: none` utan ersättning.
- Allt som går med mus går med tangentbord: dra och släpp har knappar och kortkommandon (FR-SID-008, FR-PLC-003).
- Varje kontroll har ett synligt namn och ett tillgängligt namn; sidor heter "Sida N av M ur <dokument>" (FR-DOK-010).
- Utfall meddelas i statusytan (FR-FIL-013, FR-SID-014).
- Information bärs aldrig bara av färg: vald sida har märket "Vald", fel har ikon och text.
- Minsta textstorlek 14 px; zoom till 200 % utan att innehåll försvinner (sidan får då rulla).
- Språket `lang="sv"` på dokumentet.
- `prefers-reduced-motion` stänger av animationer.

## 6. Röst och texter

Du-tilltal, klartext, korta meningar. Knappar säger vad som händer ("Lägg till alla sidor", "Baka ihop och spara"). Meddelanden säger vad som hände, vilken fil det gäller och vad man kan göra (FR-ALM-006). Inga ursäkter, inga tekniska ord utan förklaring.

| Gör | Gör inte |
| :-- | :-- |
| "Beslut.pdf är lösenordsskyddad och kan inte läsas in. Spara en kopia utan lösenord och försök igen." | "Fel: krypterat dokument (kod 3)." |
| "Sidan 4 kan inte sparas i arkivformatet (PDF/A) eftersom ett typsnitt saknas i filen. Du kan ta bort sidan eller spara som vanlig PDF." | "PDF/A-2b-validering misslyckades: font not embedded." |
| "Sparad som Beslut-ihopbakad.pdf." | "Klart!" |

Ordlista i gränssnittet: *fil* (det som läses in), *sida*, *resultat* (den nya filen), *vattenstämpel*, *textetikett*, *arkivformat (PDF/A)*, *dold information*.

## 7. Gör och gör inte

- **Gör** använd tokens för varje färg, avstånd och radie, aldrig råa värden.
- **Gör** välj avstånd bara ur skalan 4–48 px.
- **Gör** ha högst en primär knapp per vy.
- **Gör** skriv alla texter på svenska.
- **Gör inte** lägg orange text eller tunna orange linjer direkt på skiffer (2,3:1).
- **Gör inte** använd grön som enda skiljetecken mot petrol eller skiffer.
- **Gör inte** hitta på nya färger, varianter eller ikoner utanför Lucide.
- **Gör inte** ladda något utifrån: typsnitt, ikoner och bilder är inbakade.

## 8. Snabbreferens för agenter

- Sidbakgrund `--ui-bakgrund`, kolumner och dialoger `--ui-yta`, text `--ui-text`.
- Huvudhandling → `knapp-primar` ("Baka ihop och spara"); övrigt → `knapp-sekundar`; sidhuvudets verktyg → `knapp-text`.
- Fokus → 3 px `--ui-fokus`, 2 px avstånd.
- Fel → `meddelande` med `--ui-fel` och text som namnger filen.
- Text 16/24, metadata 14/20, kolumnrubrik 18/24 fet.
- Avstånd 16 px mellan kontroller, 24 px i dialoger; radie 4 px kontroller, 8 px ytor.
- Ikoner: Lucide, 20 px, streck 2 px, alltid med text eller `aria-label`.
- Layout: sidhuvud 56 px, Filer 300 px | Resultat + Förhandsvisning | Märkning 340 px, statusyta 32 px.

## 9. Ursprung och kända luckor

**Ursprung.** Färger, teman, kontrastberäkningar och typsnitt kommer ur GP MS (claude.ai-artefakten "Grafisk profil materielsystem", version 2026-11-12), som Ägaren valde som designkälla 2026-11-12. GP MS anger inte avstånd, radier, ikoner, rörelse eller komponenter; de har lagts till här för appen och är markerade som tillägg i tokens.json. Tillägg som behövdes för att klara WCAG: felmeddelanden står på `--ui-fel-yta` eftersom orange inte når 3:1 mot skiffer, och den ljusa temats markering (orange) används bara som grafik. Tokens `ui-avdelare`, `ui-fel`, `ui-fel-yta`, `ui-valt`, `ui-sidyta` och `ui-marginal-a/b` är nya roller som pekar på GP MS-färger; inga nya färger har lagts till i gränssnittet. Etikettens förvalda färger (`color.etikett.*`) är inte GP MS, eftersom profilen inte gäller etiketter; röd (#c00000) är ett tillägg.

```json
{ "design_provenance": {
    "mode": "design-file",
    "fidelity": "mapped",
    "source": null,
    "generated": "2026-11-12"
} }
```

**Kända luckor.**
- Ikonuppsättning: Lucide (ISC-licens) är vald här, inte i GP MS. Ingen logotyp finns; appens namn skrivs med text.
- Hover- och aktivtillstånd för primär knapp använder en inre ring i stället för en egen färg, eftersom GP MS saknar nyanser.
- Kontrasten för ljust tema i felmeddelanden (orange 3,2:1) klarar gränsen för grafik med liten marginal.
- Skärmbilder och exakta mått för varje skärm tas fram per funktion i ui-design.
