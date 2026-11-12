// Dold information (FEAT-008; architecture.md, byggblocket Dold information): läser metadata, kommentarer,
// bifogade filer, formulärfält och skript i ett dokument, och tillämpar användarens val på resultatet.
// Allt görs i PDF-objekten utanför sidornas innehållsflöden (BG-009, R8). Körs i bygg-arbetstråden och i tester.
import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFHexString,
  PDFName,
  PDFNumber,
  PDFObjectCopier,
  PDFRawStream,
  PDFRef,
  PDFStream,
  PDFString,
  type PDFObject,
  type PDFPage,
} from '@cantoo/pdf-lib'
import type { Rensning } from '../karna/typer'
import type { Bilagepost, Dokumentinfo, Granskning, Kommentarpost, Skriptkod, Skriptpost } from '../karna/dold'

export type { Granskning, Rensning }

const N = PDFName.of

/** Åtgärder som får finnas kvar; allt annat är aktivt innehåll och tas bort (FR-DOL-012). */
const TILLATNA_ATGARDER = new Set(['GoTo', 'GoToR', 'URI', 'Named'])
/** Kommentarer som inte är kommentarer i användarens mening. */
const INTE_KOMMENTAR = new Set(['Link', 'Widget', 'Popup', 'FileAttachment'])

function slaUpp(doc: PDFDocument, o: PDFObject | undefined): PDFObject | undefined {
  return o instanceof PDFRef ? doc.context.lookup(o) : o
}
function dict(doc: PDFDocument, o: PDFObject | undefined): PDFDict | undefined {
  const v = slaUpp(doc, o)
  if (v instanceof PDFDict) return v
  if (v instanceof PDFStream) return v.dict
  return undefined
}
function arr(doc: PDFDocument, o: PDFObject | undefined): PDFObject[] {
  const v = slaUpp(doc, o)
  return v instanceof PDFArray ? v.asArray() : []
}
const namn = (doc: PDFDocument, o: PDFObject | undefined) => {
  const v = slaUpp(doc, o)
  return v instanceof PDFName ? v.decodeText() : ''
}
function text(doc: PDFDocument, o: PDFObject | undefined): string {
  const v = slaUpp(doc, o)
  if (v instanceof PDFString || v instanceof PDFHexString) return v.decodeText()
  if (v instanceof PDFName) return v.decodeText()
  if (v instanceof PDFNumber) return String(v.asNumber())
  if (v instanceof PDFArray) return v.asArray().map((x) => text(doc, x)).filter(Boolean).join(', ')
  return ''
}
function datum(doc: PDFDocument, o: PDFObject | undefined): string {
  const v = slaUpp(doc, o)
  if (!(v instanceof PDFString || v instanceof PDFHexString)) return ''
  try {
    const d = v.decodeDate()
    return Number.isNaN(d.getTime()) ? '' : d.toISOString()
  } catch {
    return ''
  }
}

/** Åtgärdens typ och alla typer i dess Next-kedja. */
function atgardstyper(doc: PDFDocument, o: PDFObject | undefined, sett = new Set<PDFObject>()): string[] {
  const d = dict(doc, o)
  if (!d || sett.has(d)) return []
  sett.add(d)
  const nasta = slaUpp(doc, d.get(N('Next')))
  const fler = nasta instanceof PDFArray ? nasta.asArray().flatMap((x) => atgardstyper(doc, x, sett)) : atgardstyper(doc, nasta, sett)
  return [namn(doc, d.get(N('S'))), ...fler]
}
const arAktiv = (typer: string[]) => typer.some((t) => t && !TILLATNA_ATGARDER.has(t))
const skriptkod = (typer: string[], standard: Skriptkod): Skriptkod => (typer.includes('Launch') ? 'starta' : typer.some((t) => t === 'SubmitForm' || t === 'ImportData') ? 'skicka' : standard)

/** Namnträdets löv, i ordning (ISO 32000-1, 7.9.6). */
function namntrad(doc: PDFDocument, rot: PDFObject | undefined, sett = new Set<PDFObject>()): [string, PDFObject][] {
  const d = dict(doc, rot)
  if (!d || sett.has(d)) return []
  sett.add(d)
  const ut: [string, PDFObject][] = []
  const n = arr(doc, d.get(N('Names')))
  for (let i = 0; i + 1 < n.length; i += 2) ut.push([text(doc, n[i]), n[i + 1]!])
  for (const k of arr(doc, d.get(N('Kids')))) ut.push(...namntrad(doc, k, sett))
  return ut
}

function filspec(doc: PDFDocument, fs: PDFObject | undefined): { namn: string; storlek: number | null } {
  const d = dict(doc, fs)
  if (!d) return { namn: text(doc, fs), storlek: null }
  const nm = text(doc, d.get(N('UF'))) || text(doc, d.get(N('F'))) || '?'
  const ef = dict(doc, d.get(N('EF')))
  const strom = slaUpp(doc, ef?.get(N('UF')) ?? ef?.get(N('F')))
  let storlek: number | null = null
  if (strom instanceof PDFStream) {
    const s = slaUpp(doc, dict(doc, strom.dict.get(N('Params')))?.get(N('Size')))
    if (s instanceof PDFNumber) storlek = s.asNumber()
    else if (strom instanceof PDFRawStream && !strom.dict.has(N('Filter'))) storlek = strom.getContentsSize()
  }
  return { namn: nm, storlek }
}

/** Fältets fullständiga namn (T-värdena från roten, ISO 32000-1, 12.7.3.2). */
function faltnamn(doc: PDFDocument, d: PDFDict): string {
  const delar: string[] = []
  const sett = new Set<PDFDict>()
  for (let n: PDFDict | undefined = d; n && !sett.has(n); n = dict(doc, n.get(N('Parent')))) {
    sett.add(n)
    const t = text(doc, n.get(N('T')))
    if (t) delar.unshift(t)
  }
  return delar.join('.')
}
function faltvarde(doc: PDFDocument, d: PDFDict): string {
  const sett = new Set<PDFDict>()
  for (let n: PDFDict | undefined = d; n && !sett.has(n); n = dict(doc, n.get(N('Parent')))) {
    sett.add(n)
    if (n.has(N('V'))) return text(doc, n.get(N('V')))
  }
  return ''
}

/** Läser det som kan vara dolt i dokumentet (FR-DOL-002, -005, -008, -011, -012). */
export async function granska(bytes: Uint8Array): Promise<Granskning> {
  const doc = await PDFDocument.load(bytes, { updateMetadata: false })
  const info = dict(doc, doc.context.trailerInfo.Info as PDFObject | undefined)
  const varde = (k: string) => text(doc, info?.get(N(k)))
  const dokinfo: Dokumentinfo = {
    titel: varde('Title'),
    forfattare: varde('Author'),
    amne: varde('Subject'),
    nyckelord: varde('Keywords'),
    program: varde('Creator') || varde('Producer'),
    skapad: datum(doc, info?.get(N('CreationDate'))),
    andrad: datum(doc, info?.get(N('ModDate'))),
  }
  const kommentarer: Kommentarpost[] = []
  const bilagor: Bilagepost[] = []
  const falt = new Map<string, { sidor: number[]; varde: string }>()
  const skript: Skriptpost[] = []
  const lagg = (kod: Skriptkod, sidindex: number | null) => {
    if (!skript.some((s) => s.kod === kod && s.sidindex === sidindex)) skript.push({ kod, sidindex })
  }

  const kat = doc.catalog
  const oppna = atgardstyper(doc, kat.get(N('OpenAction')))
  if (arAktiv(oppna)) lagg(skriptkod(oppna, 'oppna'), null)
  if (kat.has(N('AA'))) lagg('dokumenthandelse', null)
  const namnen = dict(doc, kat.get(N('Names')))
  if (namntrad(doc, namnen?.get(N('JavaScript'))).length) lagg('dokumentskript', null)
  namntrad(doc, namnen?.get(N('EmbeddedFiles'))).forEach(([nm, fs], i) => {
    const f = filspec(doc, fs)
    bilagor.push({ nyckel: `b:${i}`, namn: f.namn || nm, storlek: f.storlek, sidindex: null })
  })

  doc.getPages().forEach((sida, s) => {
    const node = sida.node
    if (node.has(N('AA'))) lagg('sida', s)
    if (node.has(N('PieceInfo'))) lagg('programdata', s)
    arr(doc, node.get(N('Annots'))).forEach((a, i) => {
      const ad = dict(doc, a)
      if (!ad) return
      const typ = namn(doc, ad.get(N('Subtype')))
      const nyckel = `k:${s}:${i}`
      const atg = atgardstyper(doc, ad.get(N('A')))
      const aktiv = ad.has(N('AA')) || arAktiv(atg)
      if (typ === 'Widget') {
        if (aktiv) lagg(skriptkod(atg, 'falt'), s)
        // Skript på fältnivå (formatering, beräkning) sitter ofta på föräldern.
        const sett = new Set<PDFDict>()
        for (let n = dict(doc, ad.get(N('Parent'))); n && !sett.has(n); n = dict(doc, n.get(N('Parent')))) {
          sett.add(n)
          if (n.has(N('AA')) || arAktiv(atgardstyper(doc, n.get(N('A'))))) lagg('falt', s)
        }
        const nm = faltnamn(doc, ad)
        if (!nm) return
        const f = falt.get(nm) ?? { sidor: [], varde: faltvarde(doc, ad) }
        if (!f.sidor.includes(s)) f.sidor.push(s)
        falt.set(nm, f)
        return
      }
      if (aktiv) lagg(skriptkod(atg, 'kommentar'), s)
      if (typ === 'FileAttachment') {
        const f = filspec(doc, ad.get(N('FS')))
        bilagor.push({ nyckel, namn: f.namn, storlek: f.storlek, sidindex: s })
        return
      }
      if (INTE_KOMMENTAR.has(typ)) return
      kommentarer.push({ nyckel, sidindex: s, typ, text: text(doc, ad.get(N('Contents'))), forfattare: text(doc, ad.get(N('T'))) })
    })
  })
  return {
    info: dokinfo,
    kommentarer,
    bilagor,
    falt: [...falt.entries()].map(([nm, f]) => ({ namn: nm, sidor: f.sidor, varde: f.varde })),
    skript,
  }
}

/** Metadata ur källdokumentet för förifyllning (FR-DOL-003). */
export function kallmetadata(doc: PDFDocument): { titel: string; forfattare: string; amne: string; nyckelord: string } {
  const info = dict(doc, doc.context.trailerInfo.Info as PDFObject | undefined)
  const v = (k: string) => text(doc, info?.get(N(k)))
  return { titel: v('Title'), forfattare: v('Author'), amne: v('Subject'), nyckelord: v('Keywords') }
}

/** En kopierad sida och var den kom ifrån. */
export interface Sidkalla {
  readonly sida: PDFPage
  readonly dokumentId: string
  readonly sidindex: number
}

/**
 * Tillämpar valen på resultatets sidor och tar bort allt som hör till sidor utanför resultatet (FR-DOL-013):
 * kommentarer och fält ändras eller tas bort, länkar till sidor som inte är med tas bort, skript och
 * programdata tas alltid bort (FR-DOL-012) och, i arkivformat, alla bifogade filer (FR-DOL-010).
 * Innehållsflödena rörs inte.
 */
export function rensa(ut: PDFDocument, sidor: readonly Sidkalla[], kallor: ReadonlyMap<string, PDFDocument>, val: Readonly<Record<string, Rensning>>, format: 'pdf' | 'pdfa') {
  const ctx = ut.context
  // Första förekomsten av varje källsida i resultatet, för länkar mellan sidorna.
  const plats = new Map<string, PDFRef>()
  for (const s of sidor) if (!plats.has(`${s.dokumentId}:${s.sidindex}`)) plats.set(`${s.dokumentId}:${s.sidindex}`, s.sida.ref)
  const kallsidor = new Map<string, Map<PDFRef, number>>()
  const kallsida = (id: string, ref: PDFRef) => {
    const kalla = kallor.get(id)
    if (!kalla) return -1
    let m = kallsidor.get(id)
    if (!m) {
      m = new Map(kalla.getPages().map((p, i) => [p.ref, i]))
      kallsidor.set(id, m)
    }
    return m.get(ref) ?? -1
  }
  /** Länken pekar om till sidans plats i resultatet; false om målet inte är med (FR-DOL-013). */
  const flyttaLank = (ad: PDFDict, id: string, sidindex: number, i: number): boolean => {
    const kalla = kallor.get(id)
    if (!kalla) return false
    const kallannot = dict(kalla, arr(kalla, kalla.getPage(sidindex).node.get(N('Annots')))[i])
    const mal = kallannot && lankmal(kalla, kallannot)
    if (mal === null || mal === undefined) {
      // Länk utan sidmål (webbadress, namngivet mål): målet i ut pekar inte på någon sida.
      return true
    }
    const ny = plats.get(`${id}:${kallsida(id, mal)}`)
    if (!ny) return false
    const flytta = (d: PDFObject | undefined) => {
      const v = slaUpp(ut, d)
      if (!(v instanceof PDFArray)) return undefined
      const kopia = v.asArray().slice()
      kopia[0] = ny
      return ctx.obj(kopia)
    }
    const dest = flytta(ad.get(N('Dest')))
    if (dest) ad.set(N('Dest'), dest)
    const a = dict(ut, ad.get(N('A')))
    const d = a && flytta(a.get(N('D')))
    if (a && d) a.set(N('D'), d)
    return true
  }
  const rotfalt = new Map<string, Set<PDFRef>>()
  const kvarWidgetar = new Set<PDFObject>()

  for (const { sida, dokumentId, sidindex } of sidor) {
    const node = sida.node
    const v = val[dokumentId] ?? {}
    const taBort = new Set(v.taBort ?? [])
    const taBortFalt = new Set(v.taBortFalt ?? [])
    node.delete(N('AA'))
    node.delete(N('PieceInfo'))
    // Artikeltrådar pekar på andra sidor.
    node.delete(N('B'))
    const annots = arr(ut, node.get(N('Annots')))
    if (!annots.length) continue
    const behall: PDFObject[] = []
    const borttagna = new Set<PDFObject>()
    annots.forEach((a, i) => {
      const ad = dict(ut, a)
      if (!ad) return
      const typ = namn(ut, ad.get(N('Subtype')))
      const nyckel = `k:${sidindex}:${i}`
      const bort = () => borttagna.add(a)
      if (typ === 'Widget') {
        if (taBortFalt.has(faltnamn(ut, ad))) return bort()
      } else if (typ === 'Link') {
        if (!flyttaLank(ad, dokumentId, sidindex, i)) return bort()
      } else if (typ === 'FileAttachment') {
        if (format === 'pdfa' || taBort.has(nyckel)) return bort()
      } else if (typ !== 'Popup' && taBort.has(nyckel)) return bort()
      behall.push(a)
    })
    // Popupfönster följer sin kommentar.
    const slutlig = behall.filter((a) => {
      const ad = dict(ut, a)!
      if (namn(ut, ad.get(N('Subtype'))) !== 'Popup') return true
      const f = ad.get(N('Parent'))
      return !f || !borttagna.has(f)
    })
    const kvar = new Set(slutlig)
    for (const a of slutlig) {
      const ad = dict(ut, a)!
      const typ = namn(ut, ad.get(N('Subtype')))
      // Kopian pekar på sin egen sida, inte på originalet (som annars följer med i filen).
      if (ad.has(N('P'))) ad.set(N('P'), sida.ref)
      ad.delete(N('AA'))
      if (arAktiv(atgardstyper(ut, ad.get(N('A'))))) ad.delete(N('A'))
      const irt = ad.get(N('IRT'))
      if (irt && !kvar.has(irt)) ad.delete(N('IRT'))
      const pop = ad.get(N('Popup'))
      if (pop && !kvar.has(pop)) ad.delete(N('Popup'))
      const nyText = (val[dokumentId]?.kommentartext ?? {})[`k:${sidindex}:${annots.indexOf(a)}`]
      if (nyText !== undefined && !INTE_KOMMENTAR.has(typ)) {
        ad.set(N('Contents'), PDFHexString.fromText(nyText))
        // Formaterad text skulle annars visas i stället för den nya.
        ad.delete(N('RC'))
      }
      if (typ === 'Widget') {
        kvarWidgetar.add(a)
        let rot: PDFObject = a
        const sett = new Set<PDFObject>()
        for (let n = ad.get(N('Parent')); n && !sett.has(n); n = dict(ut, n)?.get(N('Parent'))) {
          sett.add(n)
          dict(ut, n)?.delete(N('AA'))
          if (arAktiv(atgardstyper(ut, dict(ut, n)?.get(N('A'))))) dict(ut, n)?.delete(N('A'))
          rot = n
        }
        if (rot instanceof PDFRef) {
          const m = rotfalt.get(dokumentId) ?? new Set<PDFRef>()
          m.add(rot)
          rotfalt.set(dokumentId, m)
        }
      }
    }
    if (slutlig.length) node.set(N('Annots'), ctx.obj(slutlig))
    else node.delete(N('Annots'))
  }

  // Fältträdet: bara de grenar som leder till widgetar på resultatets sidor (FR-DOL-013).
  const leder = (o: PDFObject, sett = new Set<PDFObject>()): boolean => {
    if (kvarWidgetar.has(o)) return true
    const d = dict(ut, o)
    if (!d || sett.has(o)) return false
    sett.add(o)
    const kids = arr(ut, d.get(N('Kids')))
    if (!kids.length) return false
    const behall = kids.filter((k) => leder(k, sett))
    d.set(N('Kids'), ctx.obj(behall))
    return behall.length > 0
  }
  const falt: PDFRef[] = []
  for (const roter of rotfalt.values()) for (const r of roter) if (leder(r)) falt.push(r)
  if (falt.length) {
    const form = ctx.obj({ Fields: falt }) as PDFDict
    // Standardutseende och resurser från första källan med formulär, så att fälten går att fylla i.
    for (const [id] of rotfalt) {
      const kalla = kallor.get(id)
      const af = kalla && dict(kalla, kalla.catalog.get(N('AcroForm')))
      if (!af) continue
      const kopia = PDFObjectCopier.for(kalla.context, ctx)
      const dr = af.get(N('DR'))
      if (dr) form.set(N('DR'), kopia.copy(dr))
      const da = af.get(N('DA'))
      if (da) form.set(N('DA'), kopia.copy(da))
      break
    }
    ut.catalog.set(N('AcroForm'), ctx.register(form))
  }

  // Bilagor på dokumentnivå följer med i vanlig PDF om de inte tas bort (FR-DOL-009); aldrig i PDF/A (FR-DOL-010).
  if (format === 'pdf') {
    const lov: PDFObject[] = []
    const anvanda = new Set<string>()
    for (const id of new Set(sidor.map((s) => s.dokumentId))) {
      const kalla = kallor.get(id)
      if (!kalla) continue
      const taBort = new Set(val[id]?.taBort ?? [])
      const kopia = PDFObjectCopier.for(kalla.context, ctx)
      namntrad(kalla, dict(kalla, kalla.catalog.get(N('Names')))?.get(N('EmbeddedFiles'))).forEach(([nm, fs], i) => {
        if (taBort.has(`b:${i}`)) return
        let n = nm || filspec(kalla, fs).namn
        for (let j = 2; anvanda.has(n); j++) n = `${nm} (${j})`
        anvanda.add(n)
        lov.push(PDFHexString.fromText(n), kopia.copy(fs))
      })
    }
    if (lov.length) {
      // Namnträdet ska vara sorterat på nyckeln.
      const par: [PDFObject, PDFObject][] = []
      for (let i = 0; i < lov.length; i += 2) par.push([lov[i]!, lov[i + 1]!])
      par.sort(([a], [b]) => text(ut, a).localeCompare(text(ut, b), 'en'))
      ut.catalog.set(N('Names'), ctx.obj({ EmbeddedFiles: ctx.obj({ Names: par.flat() }) }))
    }
  }
}

/** Sidan en länk pekar på i samma fil, eller null. */
function lankmal(doc: PDFDocument, ad: PDFDict): PDFRef | null {
  let dest = ad.get(N('Dest'))
  const a = dict(doc, ad.get(N('A')))
  if (!dest && a && namn(doc, a.get(N('S'))) === 'GoTo') dest = a.get(N('D'))
  const d = slaUpp(doc, dest)
  if (d instanceof PDFArray) {
    const forsta = d.get(0)
    return forsta instanceof PDFRef ? forsta : null
  }
  return null
}

/** Tar bort objekt som inget längre pekar på, så att inget från bortvalda sidor finns kvar i filen (FR-DOL-013). */
export function stada(doc: PDFDocument) {
  const ctx = doc.context
  const nadda = new Set<string>()
  const ko: PDFObject[] = []
  const t = ctx.trailerInfo
  for (const o of [t.Root, t.Info, t.Encrypt, t.ID] as (PDFObject | undefined)[]) if (o) ko.push(o)
  while (ko.length) {
    const o = ko.pop()!
    if (o instanceof PDFRef) {
      const k = o.toString()
      if (nadda.has(k)) continue
      nadda.add(k)
      const v = ctx.lookup(o)
      if (v) ko.push(v)
    } else if (o instanceof PDFDict) o.entries().forEach(([, v]) => ko.push(v))
    else if (o instanceof PDFArray) ko.push(...o.asArray())
    else if (o instanceof PDFStream) ko.push(o.dict)
  }
  for (const [ref] of ctx.enumerateIndirectObjects()) if (!nadda.has(ref.toString())) ctx.delete(ref)
}
