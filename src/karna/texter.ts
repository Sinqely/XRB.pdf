// Alla texter i gränssnittet, på svenska (FR-ALM-006, FR-ALM-007; docs/design.md §6).
const sidor = (n: number) => (n === 1 ? '1 sida' : `${n} sidor`)

export const texter = {
  appnamn: 'PDF-bagaren',
  bakaIhop: 'Baka ihop och spara',
  bakaIhopIngaFiler: 'Läs in minst en PDF-fil först.',
  bakaIhopIngaSidor: 'Välj minst en sida först.',
  kolumnFiler: 'Filer',
  kolumnResultat: 'Resultat',
  kolumnMarkning: 'Märkning',
  valjFiler: 'Välj filer',
  slappForsta: 'Dra in PDF-filer här',
  slappFler: 'Dra in fler PDF-filer här',
  slappEllerKlicka: 'eller välj filer',
  slappNu: 'Släpp för att läsa in',
  ingress: 'Allt sker i din webbläsare. Inga filer skickas någonstans.',
  markningSenare: 'Vattenstämpel och textetikett kommer i en senare version.',
  resultatTomt: 'Inga sidor ännu. Klicka på en miniatyr för att lägga till den.',
  resultatEtikett: 'Resultatets sidor',
  temaLjust: 'Ljust tema',
  temaMorkt: 'Mörkt tema',
  sidor,
  storlek: (byte: number) =>
    byte < 100_000 ? 'under 0,1 MB' : `${(byte / 1_000_000).toFixed(1).replace('.', ',')} MB`,
  sidaKort: (n: number) => `Sida ${n}`,
  ritar: 'Ritar …',
  sidanKundeInteVisas: 'Sidan kunde inte visas',
  vald: 'Vald',
  laggTillAlla: 'Lägg till alla sidor',
  taBortUrResultatet: 'Ta bort ur resultatet',
  allaRedanValda: 'Alla sidor finns redan i resultatet.',
  ingaValda: 'Inga sidor ur dokumentet finns i resultatet.',
  taBortFil: (namn: string) => `Ta bort ${namn}`,
  flyttaVanster: (n: number, namn: string) => `Flytta sida ${n} ur ${namn} till vänster`,
  flyttaHoger: (n: number, namn: string) => `Flytta sida ${n} ur ${namn} till höger`,
  taBortSida: (n: number, namn: string) => `Ta bort sida ${n} ur ${namn} från resultatet`,
  redanForst: 'Sidan är redan först.',
  redanSist: 'Sidan är redan sist.',
  resultatEtikettKort: (plats: number, namn: string, n: number) => `${plats} · ${namn} s. ${n}`,
  lasesIn: (namn: string) => `Läser in ${namn} …`,
  inlast: (namn: string, n: number) => `${namn} inläst, ${sidor(n)}.`,
  felIntePdf: (namn: string) => `${namn} är ingen PDF-fil och kan inte läsas in. Bara PDF-filer kan läsas in; spara filen som PDF och försök igen.`,
  felForStor: (namn: string) => `${namn} är större än 100 MB och kan inte läsas in. Dela upp filen eller minska den och försök igen.`,
  felLosenord: (namn: string) => `${namn} är lösenordsskyddad och kan inte läsas in. Spara en kopia utan lösenord och försök igen.`,
  felSkadad: (namn: string) => `${namn} är skadad eller går inte att läsa och har inte lästs in. Öppna den i en PDF-läsare och spara en ny kopia, och försök igen.`,
  felForMangaSidor: (namn: string, redan: number) => `${namn} har inte lästs in, eftersom arbetsytan då skulle få fler än 500 sidor. Arbetsytan har redan ${sidor(redan)}. Ta bort en fil först eller välj en mindre fil.`,
  avvisad: (namn: string) => `${namn} avvisades.`,
  stang: 'Stäng meddelandet',
  dokumentBorttaget: (namn: string, n: number) =>
    n === 0 ? `${namn} borttagen.` : `${namn} borttagen. ${sidor(n)} togs bort ur resultatet.`,
  sidaTillagd: (n: number, namn: string, plats: number) => `Sida ${n} ur ${namn} tillagd på plats ${plats}.`,
  sidaBorttagen: (n: number, namn: string) => `Sida ${n} ur ${namn} borttagen ur resultatet.`,
  sidaFlyttad: (n: number, namn: string, plats: number) => `Sida ${n} ur ${namn} flyttad till plats ${plats}.`,
  allaTillagda: (antal: number, namn: string, totalt: number) =>
    `${sidor(antal)} ur ${namn} tillagda. Resultatet har ${sidor(totalt)}.`,
  allaBorttagna: (namn: string) => `Alla sidor ur ${namn} borttagna ur resultatet.`,
  // Spara-dialogen (SCR-APP-005)
  sparaRubrik: 'Baka ihop och spara',
  sparaSammanfattning: (sidantal: number, filer: number) =>
    `Resultatet har ${sidor(sidantal)} ur ${filer === 1 ? '1 fil' : `${filer} filer`}.`,
  filnamn: 'Filnamn',
  filnamnHjalp: 'Filen sparas där webbläsaren sparar nedladdningar. Ändelsen .pdf läggs till om den saknas.',
  avbryt: 'Avbryt',
  spara: 'Spara',
  sparar: 'Skapar filen …',
  sparad: (namn: string) => `Sparad som ${namn}.`,
  format: 'Format',
  formatPdfa: 'Arkivformat PDF/A (rekommenderas)',
  formatPdfaHjalp: 'För arkivering och långsiktig läsbarhet. Appen kontrollerar sidorna först.',
  formatPdf: 'Vanlig PDF',
  formatPdfHjalp: 'Välj om filen inte ska arkiveras eller om arkivformatet inte går.',
  kontrollerar: 'Kontrollerar sidorna …',
  hinderRubrik: 'Filen kan inte sparas i arkivformat',
  hinderText: (n: number) =>
    n === 1
      ? 'En sida hindrar att filen blir PDF/A. Appen ändrar aldrig sidornas innehåll, så sidan kan inte rättas här.'
      : `${n} sidor hindrar att filen blir PDF/A. Appen ändrar aldrig sidornas innehåll, så sidorna kan inte rättas här.`,
  hinderVal: 'Du kan ta bort sidorna och spara resten i arkivformat, eller spara alla sidor som vanlig PDF.',
  hinderSida: (plats: number, namn: string, sida: number) => `Sida ${plats} i resultatet (${namn}, sida ${sida})`,
  hinder: {
    typsnitt: (d: string) => `Typsnittet ${d || 'utan namn'} är inte inbäddat i sidan.`,
    cmyk: () => 'Sidan har tryckfärger (CMYK) utan färgprofil.',
    lzw: () => 'Sidan använder LZW-komprimering, som inte är tillåten i arkivformatet.',
    interpolering: () => 'En bild på sidan är märkt för utjämning (interpolering).',
    'kommentar-utseende': () => 'En kommentar eller ett formulärfält på sidan saknar utseende eller syns inte vid utskrift.',
    media: () => 'Sidan innehåller ljud, video, 3D eller en annan inbäddad fil.',
    overforingsfunktion: () => 'Sidan använder överföringsfunktioner för färg.',
    postscript: () => 'Sidan innehåller inbäddad PostScript.',
  },
  hinderTaBort: (n: number) => (n === 1 ? 'Ta bort sidan' : `Ta bort de ${n} sidorna`),
  hinderTaBortAlla: 'Alla sidor har hinder, så det finns inget kvar att spara i arkivformat.',
  hinderVanlig: 'Spara som vanlig PDF',
  hinderBorttagna: (n: number) => (n === 1 ? 'En sida togs bort ur resultatet.' : `${n} sidor togs bort ur resultatet.`),
  sparFel: 'Filen kunde inte skapas. Arbetsytan är oförändrad. Försök igen, eller ta bort den senast inlästa filen.',
  miniatyr: (sida: number, av: number, dok: string) => `Sida ${sida} av ${av} ur ${dok}`,
  miniatyrVald: (sida: number, av: number, dok: string) => `Vald, sida ${sida} av ${av} ur ${dok}`,
  resultatsida: (sida: number, av: number, dok: string, plats: number, totalt: number) =>
    `Sida ${sida} av ${av} ur ${dok}, plats ${plats} av ${totalt}`,
  // Förhandsvisning (FEAT-003)
  forhandsvisning: 'Förhandsvisning',
  sidaNavM: (n: number, m: number) => `Sida ${n} av ${m}`,
  urDokument: (namn: string, sida: number) => `ur ${namn}, sida ${sida}`,
  foregaendeSida: 'Föregående sida',
  nastaSida: 'Nästa sida',
  zoomaIn: 'Zooma in',
  zoomaUt: 'Zooma ut',
  anpassa: 'Anpassa',
  steg1Rubrik: '1 Läs in filer.',
  steg1Text: 'Dra in PDF-filer till kolumnen Filer, eller välj dem med knappen.',
  steg2Rubrik: '2 Välj och ordna sidor.',
  steg2Text: 'Klicka på de sidor du vill ha. De hamnar i resultatraden, där du kan flytta dem.',
  steg3Rubrik: '3 Märk och spara.',
  steg3Text: 'Lägg till vattenstämpel eller textetikett om du vill, och välj "Baka ihop och spara".',
  // Ångra, gör om, börja om (FEAT-005)
  angra: 'Ångra',
  gorOm: 'Gör om',
  borjaOm: 'Börja om',
  angrade: (m: string) => `Ångrade: ${m}`,
  angradeUtan: 'Ångrade den senaste ändringen.',
  gjordesOm: (m: string) => `Gjorde om: ${m}`,
  gjordesOmUtan: 'Gjorde om ändringen.',
  borjaOmRubrik: 'Börja om?',
  borjaOmText: 'Alla inlästa filer, valda sidor och inställningar tas bort från arbetsytan. Filerna på din dator påverkas inte.',
  borjaOmJa: 'Töm arbetsytan',
  borjadeOm: 'Arbetsytan är tömd.',

  // FEAT-006 Vattenstämpel och gemensamt för märkningen (SCR-APP-002, SCR-APP-003)
  markningInaktiv: 'Lägg först till sidor i resultatet. Sedan kan du märka dem med vattenstämpel eller textetikett.',
  flikStampel: 'Vattenstämpel',
  flikEtikett: 'Textetikett',
  objektNamn: { stampel: 'Vattenstämpeln', etikett: 'Textetiketten' },
  valjBild: 'Välj bild',
  bytBild: 'Byt bild',
  bildHjalp: 'PNG eller JPEG, högst 20 MB. Genomskinliga delar i PNG förblir genomskinliga. Du kan också dra in bilden hit.',
  slappBild: 'Släpp bilden här',
  taBortStampel: 'Ta bort stämpeln',
  stampelTillagd: (namn: string) => `${namn} tillagd som vattenstämpel på alla sidor.`,
  stampelBytt: (namn: string) => `Stämpelns bild bytt till ${namn}.`,
  stampelBorttagen: 'Vattenstämpeln borttagen från alla sidor.',
  bildFelTyp: (namn: string) => `${namn} kan inte användas som vattenstämpel. Bara bilder i formaten PNG och JPEG går att använda.`,
  bildForStor: (namn: string) => `${namn} är större än 20 MB och kan inte användas som vattenstämpel. Välj en mindre bild.`,
  bildSkadad: (namn: string) => `${namn} är skadad eller går inte att läsa och kan inte användas som vattenstämpel.`,
  bildEnAtGangen: 'Släpp en bild i taget. Bara den första används.',
  opacitet: 'Opacitet (%)',
  opacitetSatt: (v: number) => `Opacitet ${v} %.`,
  stampelBredd: 'Bredd (mm)',
  storlekHjalp: 'Höjden följer bildens proportioner. Du kan också dra i ett hörn i förhandsvisningen.',
  mindre: 'Mindre',
  storre: 'Större',
  storlekSatt: (mm: number) => `Bredd ${String(mm).replace('.', ',')} mm.`,
  placering: 'Placering',
  ankare: {
    'ovre-vanster': 'Övre vänstra hörnet',
    sidhuvud: 'Centrerat i sidhuvudet',
    'ovre-hoger': 'Övre högra hörnet',
    'nedre-vanster': 'Nedre vänstra hörnet',
    sidfot: 'Centrerat i sidfoten',
    'nedre-hoger': 'Nedre högra hörnet',
  },
  egenPlacering: 'Egen placering. Välj en färdig placering för att börja om från den.',
  avstandKant: 'Avstånd till kant (mm)',
  avstandHjalp: '0–50 mm från kanten eller hörnet som placeringen utgår från.',
  placeringForval: (o: 'stampel' | 'etikett', var_: string) => `${o === 'stampel' ? 'Vattenstämpeln' : 'Textetiketten'} placerad: ${var_.toLowerCase()}.`,
  placeringEgen: (o: 'stampel' | 'etikett') => `${o === 'stampel' ? 'Vattenstämpeln' : 'Textetiketten'} flyttad.`,
  flyttaHjalp: 'Flytta med piltangenterna, 1 mm per tryck eller 10 mm med Skift.',
  sidorRubrik: 'Sidor',
  allaSidor: 'Alla sidor i resultatet',
  allaSidorHjalp: 'Annars väljer du sidor med kryssrutorna i resultatraden.',
  allaSidorPa: (o: 'stampel' | 'etikett') => `${o === 'stampel' ? 'Vattenstämpeln' : 'Textetiketten'} ligger på alla sidor.`,
  allaSidorAv: (o: 'stampel' | 'etikett', plats: number) =>
    plats > 0
      ? `${o === 'stampel' ? 'Vattenstämpeln' : 'Textetiketten'} ligger nu bara på sida ${plats}. Välj fler sidor i resultatraden.`
      : `${o === 'stampel' ? 'Vattenstämpeln' : 'Textetiketten'} ligger inte på någon sida. Välj sidor i resultatraden.`,
  paSida: (o: 'stampel' | 'etikett', plats: number) => `${o === 'stampel' ? 'Vattenstämpel' : 'Textetikett'} på sida ${plats}.`,
  avSida: (o: 'stampel' | 'etikett', plats: number) => `${o === 'stampel' ? 'Vattenstämpeln' : 'Textetiketten'} borttagen från sida ${plats}.`,
  sidorMed: (sidor: number[]) => (sidor.length === 0 ? 'Ligger inte på någon sida.' : `Ligger på ${sidlista(sidor)}.`),
  kryssStampel: 'Stämpel',
  kryssEtikett: 'Etikett',
  kryssNamn: (o: 'stampel' | 'etikett', plats: number) => `${o === 'stampel' ? 'Vattenstämpel' : 'Textetikett'} på sida ${plats}`,
  naraKant: (o: 'stampel' | 'etikett', sidor: number[]) =>
    `${o === 'stampel' ? 'Vattenstämpeln' : 'Textetiketten'} ligger närmare kanten än säkerhetsmarginalen på 5 mm på ${sidlista(sidor)}. Den kan skäras bort vid utskrift.`,
  marginalForklaring: 'Den streckade linjen är säkerhetsmarginalen. Den syns bara här, inte i filen.',
  overlaggStampel: (namn: string) => `Vattenstämpel ${namn}`,
  storleksHandtag: 'Ändra storlek',

  // FEAT-007 Textetikett (SCR-APP-003)
  etikettText: 'Text',
  etikettTextHjalp: 'En rad, högst 200 tecken.',
  teckenRaknare: (n: number) => `${n} av 200`,
  teckenGrans: 'Gränsen på 200 tecken är nådd.',
  etikettTillagd: 'Textetikett tillagd på alla sidor.',
  etikettAndrad: 'Textetiketten ändrad.',
  etikettBorttagen: 'Textetiketten borttagen från alla sidor.',
  etikettTom: 'Fältet är tomt, så ingen etikett läggs på sidorna.',
  taBortEtikett: 'Ta bort etiketten',
  textstorlek: 'Textstorlek (pt)',
  textstorlekHjalp: '6–72 pt.',
  textfarg: 'Textfärg',
  bakgrundsfarg: 'Bakgrund',
  ingenBakgrund: 'Ingen',
  egenFarg: 'Egen färg',
  fargnamn: { svart: 'Svart', vit: 'Vit', gra: 'Grå', rod: 'Röd', bla: 'Blå', gron: 'Grön', gul: 'Gul', orange: 'Orange' },
  typsnitt: 'Typsnitt',
  typsnittNamn: { sans: 'Carlito (utan seriffer)', serif: 'Tinos (med seriffer)', mono: 'Cousine (fast teckenbredd)' },
  stil: 'Stil',
  fet: 'Fet',
  kursiv: 'Kursiv',
  saknadeTecken: (tecken: string[]) =>
    `Typsnittet saknar ${tecken.length === 1 ? 'tecknet' : 'tecknen'} ${tecken.map((t) => `"${t}"`).join(', ')}. ${tecken.length === 1 ? 'Det' : 'De'} kan inte visas i filen. Välj ett annat typsnitt eller ta bort ${tecken.length === 1 ? 'tecknet' : 'tecknen'}.`,
  overlaggEtikett: (text: string) => `Textetikett "${text}"`,
  overlapp: (sidor: number[]) => `Vattenstämpeln och textetiketten överlappar varandra på ${sidlista(sidor)}.`,
  // Dold information SCR-APP-004 (FEAT-008)
  doldVerktyg: 'Dold information',
  doldVerktygIngaSidor: 'Välj minst en sida först.',
  doldRubrik: 'Dold information',
  doldIngress: 'Det här följer med i den sparade filen. Kontrollera det och ändra eller ta bort det som inte ska med.',
  doldUppgifter: 'Uppgifter om resultatet',
  doldUppgifterForifyllda: (namn: string) => `Förifyllt från ${namn}. Töm ett fält om uppgiften inte ska med.`,
  doldUppgifterEgna: 'Töm ett fält om uppgiften inte ska med.',
  uppgiftNamn: { titel: 'Titel', forfattare: 'Författare', amne: 'Ämne', nyckelord: 'Nyckelord' },
  uppgiftAndrad: (namn: string) => `${namn} ändrad.`,
  doldLaser: 'Läser dokumenten …',
  doldLasfel: (namn: string) => `Det gick inte att läsa den dolda informationen i ${namn}. Filen går kanske inte att spara; prova att spara den på nytt från programmet där den skapades.`,
  doldIngen: 'Ingen dold information hittades.',
  doldFortsatt: 'Fortsätt till sparandet',
  klar: 'Klar',
  doldProgram: 'Skapad med',
  doldSkapad: 'Skapad',
  doldAndrad: 'Ändrad',
  doldSaknas: 'Saknas',
  datum: (iso: string) => (iso ? new Date(iso).toLocaleString('sv-SE', { dateStyle: 'long', timeStyle: 'short' }) : ''),
  doldKommentarer: (n: number) => (n === 1 ? '1 kommentar' : `${n} kommentarer`),
  doldKommentarRubrik: (platser: readonly number[], forfattare: string) => `På ${sidlista(platser)} i resultatet${forfattare ? `, av ${forfattare}` : ''}`,
  doldTaBortKommentar: 'Ta bort kommentaren',
  kommentarAndrad: 'Kommentaren ändrad.',
  doldBilagor: (n: number) => (n === 1 ? '1 bifogad fil' : `${n} bifogade filer`),
  doldBilagorPdfa: 'Bifogade filer tas alltid bort när du sparar i arkivformat PDF/A, eftersom PDF/A-2 bara tillåter bifogade filer som själva är arkivfiler och det inte går att kontrollera.',
  doldTaBortBilaga: (namn: string) => `Ta bort ${namn}`,
  doldBilagaDetalj: (storlek: number | null, platser: readonly number[]) =>
    [storlek === null ? 'Okänd storlek' : storlek < 1000 ? `${storlek} byte` : storlek < 1_000_000 ? `${Math.round(storlek / 1000)} kB` : `${(storlek / 1_000_000).toFixed(1).replace('.', ',')} MB`, platser.length ? `bifogad på ${sidlista(platser)} i resultatet` : 'bifogad i dokumentet'].join(', ') + '.',
  doldFalt: (n: number) => (n === 1 ? '1 formulärfält' : `${n} formulärfält`),
  doldFaltHjalp: 'Tar du bort ett fält försvinner också det som står i det.',
  doldTaBortFalt: (namn: string) => `Ta bort fältet ${namn}`,
  doldFaltDetalj: (varde: string, platser: readonly number[]) => `${varde ? `Innehåll: "${varde}"` : 'Tomt'}, på ${sidlista(platser)} i resultatet.`,
  doldVal: (vad: 'kommentar' | 'bilaga' | 'falt', bort: boolean) =>
    `${vad === 'kommentar' ? 'Kommentaren' : vad === 'bilaga' ? 'Den bifogade filen' : 'Formulärfältet'} ${bort ? 'tas bort' : 'behålls'} när filen sparas.`,
  doldAlltidBort: 'Det här tas alltid bort, eftersom det kan köra kod eller skicka uppgifter när filen öppnas:',
  doldSkript: (kod: 'oppna' | 'dokumentskript' | 'dokumenthandelse' | 'sida' | 'kommentar' | 'falt' | 'starta' | 'skicka' | 'programdata', platser: readonly number[]) => {
    const var_ = platser.length ? ` på ${sidlista(platser)} i resultatet` : ''
    switch (kod) {
      case 'oppna':
        return 'Ett skript som körs när dokumentet öppnas.'
      case 'dokumentskript':
        return 'Skript i dokumentet.'
      case 'dokumenthandelse':
        return 'Åtgärder när dokumentet stängs, skrivs ut eller sparas.'
      case 'sida':
        return `Åtgärder när sidan öppnas eller stängs${var_}.`
      case 'kommentar':
        return `Skript i en länk eller kommentar${var_}.`
      case 'falt':
        return `Skript i formulärfält${var_}.`
      case 'starta':
        return `En åtgärd som startar ett annat program${var_}.`
      case 'skicka':
        return `En åtgärd som skickar eller hämtar formulärdata${var_}.`
      case 'programdata':
        return `Privata uppgifter från programmet som skapade sidan${var_}.`
    }
  },
  // Hjälp SCR-APP-008 och kortkommandon SCR-APP-013 (FEAT-010)
  hjalp: 'Hjälp',
  hjalpRubrik: 'Hjälp',
  hjalpOm: (steg: string) => `Hjälp om ${steg}`,
  hjalpStegNamn: { lasaIn: 'att läsa in filer', valja: 'att välja och ordna sidor', marka: 'vattenstämpel och textetikett' },
  hjalpIngress: 'PDF-bagaren sätter ihop sidor ur flera PDF-filer och lägger på vattenstämpel och textetikett. Allt sker i din webbläsare; inga filer skickas någonstans.',
  hjalpAvsnitt: [
    {
      id: 'lasaIn',
      rubrik: '1 Läs in filer',
      text: [
        'Dra in en eller flera PDF-filer till kolumnen Filer, eller välj dem med knappen "Välj filer".',
        'Varje fil visas med namn, antal sidor och storlek och en miniatyr av varje sida. Filer med lösenord och skadade filer går inte att läsa in; du får ett meddelande om varför.',
      ],
    },
    {
      id: 'valja',
      rubrik: '2 Välj och ordna sidor',
      text: [
        'Klicka på en miniatyr för att lägga till sidan sist i resultatet, och klicka igen för att ta bort den. "Lägg till alla sidor" tar med hela filen.',
        'Ordna sidorna i resultatraden genom att dra dem, med pilknapparna eller med Alt och piltangenterna. Förhandsvisningen visar den valda sidan stort.',
      ],
    },
    {
      id: 'marka',
      rubrik: '3 Vattenstämpel och textetikett',
      text: [
        'Under Märkning väljer du en bild som vattenstämpel (PNG eller JPEG) och skriver en textetikett. Välj storlek, färg och en av sex placeringar, eller dra objektet i förhandsvisningen.',
        'Som förval hamnar de på alla sidor. Kryssrutorna under varje sida i resultatraden styr vilka sidor som får dem.',
      ],
    },
    {
      id: 'spara',
      rubrik: '4 Baka ihop och spara',
      text: [
        'Välj "Baka ihop och spara". Först visas den dolda informationen, till exempel titel, författare och kommentarer, så att du kan ändra eller ta bort det som inte ska med.',
        'Spara sedan i arkivformat PDF/A (rekommenderas) eller som vanlig PDF. Sidorna ändras aldrig; de kopieras som de är.',
      ],
    },
  ],
  hjalpFall: [
    {
      id: 'ds01',
      rubrik: 'Beslut med inskannad namnteckning',
      steg: [
        'Dra in beslutet och den inskannade filen med namnteckningen.',
        'Välj "Lägg till alla sidor" på beslutet.',
        'Ta bort sidan som ska bytas ut: välj krysset på sidan i resultatraden, eller markera den och tryck Delete.',
        'Klicka på den inskannade sidan, så hamnar den sist i resultatet.',
        'Flytta den till rätt plats med pilknapparna eller Alt och piltangenterna.',
        'Vrid sidan om den ligger fel.',
        'Bläddra igenom förhandsvisningen och kontrollera sidorna.',
        'Välj "Baka ihop och spara", granska den dolda informationen och spara i arkivformat.',
      ],
    },
    {
      id: 'ds02',
      rubrik: 'Märka en PDF',
      steg: [
        'Dra in PDF-filen och välj "Lägg till alla sidor".',
        'Under Märkning, Vattenstämpel: välj bilden och ställ in opacitet, storlek och placering.',
        'Under Textetikett: skriv texten och välj storlek, färg, typsnitt och placering.',
        'Kontrollera i förhandsvisningen. Dra stämpeln eller etiketten om de ska ligga någon annanstans.',
        'Välj "Baka ihop och spara".',
      ],
    },
  ],
  kortkommandon: 'Kortkommandon',
  visaKortkommandon: 'Visa alla kortkommandon',
  kortkommandoGrupper: [
    {
      rubrik: 'Allmänt',
      rader: [
        ['Ctrl+Z (Cmd+Z på Mac)', 'Ångra'],
        ['Ctrl+Y eller Cmd+Skift+Z', 'Gör om'],
        ['?', 'Visa kortkommandon'],
        ['Esc', 'Stäng dialogen'],
        ['Tab och Skift+Tab', 'Gå till nästa eller föregående kontroll'],
      ],
    },
    {
      rubrik: 'Sidor',
      rader: [
        ['Enter eller blanksteg på en miniatyr', 'Lägg till eller ta bort sidan'],
        ['Alt+vänster- eller högerpil', 'Flytta sidan i resultatet'],
        ['Delete eller Backsteg', 'Ta bort sidan ur resultatet'],
      ],
    },
    {
      rubrik: 'Förhandsvisning',
      rader: [
        ['Vänster- och högerpil, Page Up och Page Down', 'Föregående och nästa sida'],
        ['Home och End', 'Första och sista sidan'],
      ],
    },
    {
      rubrik: 'Vattenstämpel och textetikett',
      rader: [
        ['Piltangenterna', 'Flytta 1 mm'],
        ['Skift+piltangenterna', 'Flytta 10 mm'],
        ['Piltangenterna i placering och färg', 'Välj placering eller färg'],
        ['Enter i ett sifferfält', 'Använd värdet'],
      ],
    },
  ],
  kortkommandoTangent: 'Tangent',
  kortkommandoGor: 'Gör',
  // Om PDF-bagaren SCR-APP-009..011 (FEAT-011)
  om: 'Om PDF-bagaren',
  omRubrik: 'Om PDF-bagaren',
  omVersion: (version: string, datum: string) => `version ${version}${datum ? `, ${new Date(`${datum}T12:00:00`).toLocaleDateString('sv-SE', { dateStyle: 'long' })}` : ' (inte släppt)'}`,
  omInget: 'Inga filer eller uppgifter lämnar din dator. Allt sker i webbläsaren, och appen kan inte ansluta till internet.',
  omVisaRapport: 'Visa verifieringsrapporten',
  omVisaTillganglighet: 'Visa tillgänglighetsredogörelsen',
  omRapport: 'Verifieringsrapport',
  omTillganglighet: 'Tillgänglighetsredogörelse',
  omTillbaka: 'Tillbaka',
  omLicenser: 'Licenser',
  omLicenserIngress: 'Appen bygger på fri programvara och fria typsnitt. Välj ett namn för att läsa licensen.',
  omNamn: 'Namn',
  omVersionKolumn: 'Version',
  omLicens: 'Licens',
  omTyp: 'Typ',
  omLicensFor: (namn: string) => `Licens för ${namn}`,
  omTypNamn: { bibliotek: 'Bibliotek', typsnitt: 'Typsnitt', ikoner: 'Ikoner' },
} as const

/** "sida 2", "sidorna 2 och 5", "sidorna 1, 3 och 4". */
export function sidlista(sidor: readonly number[]): string {
  if (sidor.length === 1) return `sida ${sidor[0]}`
  return `sidorna ${sidor.slice(0, -1).join(', ')} och ${sidor[sidor.length - 1]}`
}
