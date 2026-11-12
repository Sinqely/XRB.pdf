// Export (ADR-004): kopierar sidobjekten oförändrade till en ny fil med pdf-lib, lägger på överlägg
// och gör filen till PDF/A-2b när det är valt (ADR-005). Sidornas innehållsflöden skrivs aldrig om
// (BG-009, FR-SPA-007, regel R8). Ren funktion utan DOM: körs i bygg-arbetstråden och i enhetstester.
import { degrees, PDFDocument } from '@cantoo/pdf-lib'
import { forkontroll, komplettera, sattDokumentinfo, sattFilId, type Hinder } from './pdfa'
import fontkit from '@pdf-lib/fontkit'
import { ritaEtikett, ritaStampel, type Etikettbygge, type Stampelbygge } from './overlagg'
import { TEXTFUNKTIONER, type Glyfkalla } from '../karna/etikett'

export interface Byggsida {
  readonly dokumentId: string
  readonly sidindex: number
  /** Extra vridning medurs (FR-SID-010). */
  readonly vridning?: number
  /** Vattenstämpeln ligger på sidan (FR-STA-008). */
  readonly stampel?: boolean
  /** Textetiketten ligger på sidan (FR-TXT-010). */
  readonly etikett?: boolean
}

export interface Etikettbegaran extends Etikettbygge {
  /** Typsnittsfilen (TTF) för valt typsnitt och snitt; huvudtråden skickar samma fil som förhandsvisningen använder. */
  readonly typsnitt: Uint8Array
}

export interface Stampelbegaran extends Stampelbygge {
  readonly bild: Uint8Array
  readonly typ: 'png' | 'jpeg'
}

export interface Byggbegaran {
  /** Källfilernas bytes, nyckel = dokument-id. */
  readonly dokument: Readonly<Record<string, Uint8Array>>
  /** Resultatets sidor i ordning. */
  readonly sidor: readonly Byggsida[]
  /** Standard 'pdf'. Appen skickar 'pdfa' när användaren inte valt vanlig PDF (FR-SPA-004). */
  readonly format?: 'pdfa' | 'pdf'
  /** Vattenstämpeln, om den finns (FEAT-006). */
  readonly stampel?: Stampelbegaran | null
  /** Textetiketten, om den finns och har text (FEAT-007). */
  readonly etikett?: Etikettbegaran | null
  readonly uppgifter?: { readonly titel: string; readonly forfattare: string; readonly amne: string; readonly nyckelord: string }
  /** Tidpunkt för filen (ms sedan 1970); anges av huvudtråden så att testerna blir förutsägbara. */
  readonly datum?: number
}

export const PROGRAM = 'PDF-bagaren'

/** Kopierar resultatets sidor till ett nytt dokument. */
export async function kopiera(begaran: Byggbegaran): Promise<PDFDocument> {
  const ut = await PDFDocument.create({ updateMetadata: false })
  const oppnade = new Map<string, PDFDocument>()
  for (const { dokumentId, sidindex, vridning = 0 } of begaran.sidor) {
    let kalla = oppnade.get(dokumentId)
    if (!kalla) {
      const bytes = begaran.dokument[dokumentId]
      if (!bytes) throw new Error(`kalla: dokumentet ${dokumentId} saknas`)
      try {
        kalla = await PDFDocument.load(bytes, { updateMetadata: false })
      } catch (e) {
        throw new Error(`kalla: dokumentet ${dokumentId} kunde inte öppnas`, { cause: e })
      }
      oppnade.set(dokumentId, kalla)
    }
    const [sida] = await ut.copyPages(kalla, [sidindex])
    // Vridning sätts i sidans /Rotate; innehållet rörs inte.
    if (vridning) sida.setRotation(degrees((sida.getRotation().angle + vridning) % 360))
    ut.addPage(sida)
  }
  return ut
}

/** Kopierar sidorna och lägger på stämpel och etikett ovanpå (FR-SPA-008). */
export async function sammanstall(begaran: Byggbegaran): Promise<PDFDocument> {
  const ut = await kopiera(begaran)
  const st = begaran.stampel
  if (st && begaran.sidor.some((s) => s.stampel)) {
    const bild = st.typ === 'png' ? await ut.embedPng(st.bild) : await ut.embedJpg(st.bild)
    begaran.sidor.forEach((s, i) => {
      if (s.stampel) ritaStampel(ut.getPage(i), bild, st)
    })
  }
  const et = begaran.etikett
  if (et && et.text.trim() && begaran.sidor.some((s) => s.etikett)) {
    ut.registerFontkit(fontkit)
    // Hela typsnittet bäddas in (fontkit kan inte göra delmängder av de här filerna); kerning och ligaturer av som i förhandsvisningen.
    const font = await ut.embedFont(et.typsnitt, { subset: false, features: TEXTFUNKTIONER })
    const glyfer = fontkit.create(et.typsnitt) as unknown as Glyfkalla
    begaran.sidor.forEach((s, i) => {
      if (s.etikett) ritaEtikett(ut.getPage(i), font, glyfer, et)
    })
  }
  return ut
}

/** Förkontroll för PDF/A-2b (FR-SPA-005): listar sidor som hindrar arkivformatet. */
export async function kontrollera(begaran: Byggbegaran): Promise<Hinder[]> {
  return forkontroll(await sammanstall(begaran))
}

export async function bakaIhop(begaran: Byggbegaran): Promise<Uint8Array> {
  const ut = await sammanstall(begaran)
  const datum = new Date(begaran.datum ?? Date.now())
  datum.setMilliseconds(0)
  const u = { titel: '', forfattare: '', amne: '', nyckelord: '', ...begaran.uppgifter, datum, program: PROGRAM }
  sattDokumentinfo(ut, u)
  if (begaran.format === 'pdfa') {
    const hinder = forkontroll(ut)
    if (hinder.length) throw new Error(`pdfa: ${hinder.length} hinder`)
    komplettera(ut, u)
  }
  sattFilId(ut, new TextEncoder().encode(`${datum.toISOString()}|${begaran.sidor.length}|${Object.keys(begaran.dokument).join(',')}`))
  // Okrypterad fil utan begränsningar (FR-SPA-009); inga objektströmmar för bästa läsbarhet i andra verktyg.
  return ut.save({ useObjectStreams: false, updateFieldAppearances: false })
}
