// PDF/A-2b-modulen (ADR-005; FEAT-009): förkontroll av resultatets sidor och komplettering av filen.
// Sidornas innehållsflöden ändras aldrig (BG-009, R8). Det är veraPDF i testerna som avgör giltigheten.
import {
  decodePDFRawStream,
  PDFArray,
  PDFDict,
  PDFHexString,
  PDFName,
  PDFNumber,
  PDFRawStream,
  PDFRef,
  PDFStream,
  PDFString,
  type PDFDocument,
  type PDFObject,
} from '@cantoo/pdf-lib'
import { srgbProfil } from './srgb-icc'

export type Hinderkod = 'typsnitt' | 'cmyk' | 'lzw' | 'interpolering' | 'kommentar-utseende' | 'media' | 'overforingsfunktion' | 'postscript'

export interface Hinder {
  /** Plats i resultatet, från 1. */
  readonly sida: number
  readonly kod: Hinderkod
  /** Detalj, t.ex. typsnittets namn. */
  readonly detalj: string
}

const N = PDFName.of
const namn = (o: PDFObject | undefined) => (o instanceof PDFName ? o.decodeText() : '')

function slaUpp(doc: PDFDocument, o: PDFObject | undefined): PDFObject | undefined {
  return o instanceof PDFRef ? doc.context.lookup(o) : o
}
function dict(doc: PDFDocument, o: PDFObject | undefined): PDFDict | undefined {
  const v = slaUpp(doc, o)
  if (v instanceof PDFDict) return v
  if (v instanceof PDFStream) return v.dict
  return undefined
}

function filter(d: PDFDict): string[] {
  const f = d.get(N('Filter'))
  if (f instanceof PDFName) return [f.decodeText()]
  if (f instanceof PDFArray) return f.asArray().map((x) => namn(x))
  return []
}

function innehallstext(doc: PDFDocument, s: PDFObject | undefined): string {
  const v = slaUpp(doc, s)
  if (!(v instanceof PDFRawStream)) return ''
  try {
    const bytes = filter(v.dict).length ? decodePDFRawStream(v).decode() : v.getContents()
    let t = ''
    for (let i = 0; i < bytes.length; i += 8192) t += String.fromCharCode(...bytes.subarray(i, i + 8192))
    return t
  } catch {
    return ''
  }
}

/** Går igenom en sidas resurser rekursivt och listar hinder för PDF/A-2b. */
export function forkontroll(doc: PDFDocument): Hinder[] {
  const ut: Hinder[] = []
  doc.getPages().forEach((sida, i) => {
    const nr = i + 1
    const sett = new Set<PDFObject>()
    const lagg = (kod: Hinderkod, detalj = '') => {
      if (!ut.some((h) => h.sida === nr && h.kod === kod && h.detalj === detalj)) ut.push({ sida: nr, kod, detalj })
    }
    const kollaStrom = (s: PDFObject | undefined) => {
      const d = dict(doc, s)
      if (d && filter(d).includes('LZWDecode')) lagg('lzw')
    }
    const kollaInnehall = (s: PDFObject | undefined) => {
      kollaStrom(s)
      const t = innehallstext(doc, s)
      // k/K sätter enhetsberoende CMYK-färg, som inte går ihop med sRGB-profilen.
      if (/(^|\s)(-?[\d.]+\s+){4}[kK](?=\s|$)/m.test(t)) lagg('cmyk')
    }
    const kollaFargrymd = (cs: PDFObject | undefined) => {
      const v = slaUpp(doc, cs)
      if (namn(v) === 'DeviceCMYK') lagg('cmyk')
      if (v instanceof PDFArray) v.asArray().forEach((x) => namn(slaUpp(doc, x)) === 'DeviceCMYK' && lagg('cmyk'))
    }
    const kollaTypsnitt = (f: PDFObject | undefined) => {
      const fd = dict(doc, f)
      if (!fd || sett.has(fd)) return
      sett.add(fd)
      const sub = namn(fd.get(N('Subtype')))
      if (sub === 'Type3') return void kollaResurser(fd.get(N('Resources')))
      if (sub === 'Type0') {
        const desc = slaUpp(doc, fd.get(N('DescendantFonts')))
        if (desc instanceof PDFArray) desc.asArray().forEach(kollaTypsnitt)
        return
      }
      const besk = dict(doc, fd.get(N('FontDescriptor')))
      const inbaddat = besk && (besk.has(N('FontFile')) || besk.has(N('FontFile2')) || besk.has(N('FontFile3')))
      if (!inbaddat) lagg('typsnitt', namn(fd.get(N('BaseFont'))).replace(/^[A-Z]{6}\+/, ''))
      else (['FontFile', 'FontFile2', 'FontFile3'] as const).forEach((k) => kollaStrom(besk.get(N(k))))
    }
    const kollaResurser = (r: PDFObject | undefined) => {
      const res = dict(doc, r)
      if (!res || sett.has(res)) return
      sett.add(res)
      const fonts = dict(doc, res.get(N('Font')))
      fonts?.entries().forEach(([, f]) => kollaTypsnitt(f))
      const cs = dict(doc, res.get(N('ColorSpace')))
      cs?.entries().forEach(([, c]) => kollaFargrymd(c))
      const gs = dict(doc, res.get(N('ExtGState')))
      gs?.entries().forEach(([, g]) => {
        const gd = dict(doc, g)
        if (!gd) return
        if (gd.has(N('TR'))) lagg('overforingsfunktion')
        const tr2 = gd.get(N('TR2'))
        if (tr2 && namn(tr2) !== 'Default') lagg('overforingsfunktion')
      })
      const xo = dict(doc, res.get(N('XObject')))
      xo?.entries().forEach(([, x]) => {
        const s = slaUpp(doc, x)
        if (!(s instanceof PDFStream) || sett.has(s)) return
        sett.add(s)
        const sub = namn(s.dict.get(N('Subtype')))
        kollaStrom(s)
        if (sub === 'Image') {
          kollaFargrymd(s.dict.get(N('ColorSpace')))
          if (s.dict.get(N('Interpolate'))?.toString() === 'true') lagg('interpolering')
        } else if (sub === 'Form') {
          if (s.dict.has(N('Ref'))) lagg('postscript')
          kollaInnehall(s)
          kollaResurser(s.dict.get(N('Resources')))
        } else if (sub === 'PS') lagg('postscript')
      })
      const pat = dict(doc, res.get(N('Pattern')))
      pat?.entries().forEach(([, p]) => {
        const s = slaUpp(doc, p)
        if (s instanceof PDFStream) kollaResurser(s.dict.get(N('Resources')))
      })
    }

    const node = sida.node
    const c = node.get(N('Contents'))
    const cv = slaUpp(doc, c)
    if (cv instanceof PDFArray) cv.asArray().forEach(kollaInnehall)
    else kollaInnehall(c)
    kollaResurser(node.get(N('Resources')))

    const annots = slaUpp(doc, node.get(N('Annots')))
    if (annots instanceof PDFArray) {
      for (const a of annots.asArray()) {
        const ad = dict(doc, a)
        if (!ad) continue
        const sub = namn(ad.get(N('Subtype')))
        if (['Sound', 'Movie', 'Screen', '3D', 'RichMedia'].includes(sub)) {
          lagg('media', sub)
          continue
        }
        if (sub === 'Popup' || sub === 'Link') continue
        const ap = dict(doc, ad.get(N('AP')))
        const flagga = (slaUpp(doc, ad.get(N('F'))) as PDFNumber | undefined)?.asNumber?.() ?? 0
        // Utseende krävs, och kommentaren ska skrivas ut men inte vara dold (ISO 19005-2, 6.3.2–6.3.3).
        if (!ap || !(flagga & 4) || flagga & (1 | 2 | 32)) lagg('kommentar-utseende', sub)
        else {
          const n = slaUpp(doc, ap.get(N('N')))
          if (n instanceof PDFStream) kollaResurser(n.dict.get(N('Resources')))
          else if (n instanceof PDFDict) n.entries().forEach(([, s]) => {
            const st = slaUpp(doc, s)
            if (st instanceof PDFStream) kollaResurser(st.dict.get(N('Resources')))
          })
        }
      }
    }
  })
  return ut
}

export interface Arkivuppgifter {
  readonly titel: string
  readonly forfattare: string
  readonly amne: string
  readonly nyckelord: string
  readonly datum: Date
  readonly program: string
}

function xml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function xmpDatum(d: Date) {
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z')
}

function xmp(u: Arkivuppgifter): string {
  const dc = [
    '<dc:format>application/pdf</dc:format>',
    u.titel && `<dc:title><rdf:Alt><rdf:li xml:lang="x-default">${xml(u.titel)}</rdf:li></rdf:Alt></dc:title>`,
    u.forfattare && `<dc:creator><rdf:Seq><rdf:li>${xml(u.forfattare)}</rdf:li></rdf:Seq></dc:creator>`,
    u.amne && `<dc:description><rdf:Alt><rdf:li xml:lang="x-default">${xml(u.amne)}</rdf:li></rdf:Alt></dc:description>`,
  ]
    .filter(Boolean)
    .join('')
  const d = xmpDatum(u.datum)
  return `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
<rdf:Description rdf:about="" xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/"><pdfaid:part>2</pdfaid:part><pdfaid:conformance>B</pdfaid:conformance></rdf:Description>
<rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/">${dc}</rdf:Description>
<rdf:Description rdf:about="" xmlns:xmp="http://ns.adobe.com/xap/1.0/"><xmp:CreateDate>${d}</xmp:CreateDate><xmp:ModifyDate>${d}</xmp:ModifyDate><xmp:MetadataDate>${d}</xmp:MetadataDate><xmp:CreatorTool>${xml(u.program)}</xmp:CreatorTool></rdf:Description>
<rdf:Description rdf:about="" xmlns:pdf="http://ns.adobe.com/pdf/1.3/"><pdf:Producer>${xml(u.program)}</pdf:Producer>${u.nyckelord ? `<pdf:Keywords>${xml(u.nyckelord)}</pdf:Keywords>` : ''}</rdf:Description>
</rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`
}

/** Dokumentinformation som stämmer med XMP (ISO 19005-2, 6.6.3). Används för både PDF/A och vanlig PDF. */
export function sattDokumentinfo(doc: PDFDocument, u: Arkivuppgifter) {
  if (u.titel) doc.setTitle(u.titel)
  if (u.forfattare) doc.setAuthor(u.forfattare)
  if (u.amne) doc.setSubject(u.amne)
  if (u.nyckelord) doc.setKeywords([u.nyckelord])
  doc.setCreator(u.program)
  doc.setProducer(u.program)
  doc.setCreationDate(u.datum)
  doc.setModificationDate(u.datum)
}

/** Lägger till det filen själv behöver för PDF/A-2b. Rör inte sidornas innehållsflöden. */
export function komplettera(doc: PDFDocument, u: Arkivuppgifter) {
  const ctx = doc.context
  const katalog = doc.catalog

  const metadata = ctx.stream(new TextEncoder().encode(xmp(u)), { Type: 'Metadata', Subtype: 'XML' })
  katalog.set(N('Metadata'), ctx.register(metadata))

  const profil = ctx.flateStream(srgbProfil(), { N: 3 })
  const avsikt = ctx.obj({
    Type: 'OutputIntent',
    S: 'GTS_PDFA1',
    OutputConditionIdentifier: PDFString.of('sRGB IEC61966-2.1'),
    Info: PDFString.of('sRGB IEC61966-2.1'),
    DestOutputProfile: ctx.register(profil),
  })
  katalog.set(N('OutputIntents'), ctx.obj([avsikt]))

  // Åtgärder och skript är inte tillåtna; de tas bort ur katalog, sidor och kommentarer (ADR-005).
  katalog.delete(N('OpenAction'))
  katalog.delete(N('AA'))
  const namnTrad = dict(doc, katalog.get(N('Names')))
  namnTrad?.delete(N('JavaScript'))
  for (const sida of doc.getPages()) {
    sida.node.delete(N('AA'))
    const annots = slaUpp(doc, sida.node.get(N('Annots')))
    if (annots instanceof PDFArray) {
      for (const a of annots.asArray()) {
        const ad = dict(doc, a)
        if (!ad) continue
        ad.delete(N('AA'))
        const atg = dict(doc, ad.get(N('A')))
        const typ = namn(atg?.get(N('S')))
        if (atg && typ !== 'GoTo' && typ !== 'URI' && typ !== 'GoToR' && typ !== 'Named') ad.delete(N('A'))
      }
    }
  }
}

/** Fil-id som alla filer får (krävs av PDF/A, nyttigt för signering). */
export function sattFilId(doc: PDFDocument, fro: Uint8Array) {
  let h = 0x811c9dc5
  for (const b of fro) h = Math.imul(h ^ b, 16777619) >>> 0
  const hex = Array.from({ length: 4 }, (_, i) => ((h + i * 0x9e3779b9) >>> 0).toString(16).padStart(8, '0')).join('')
  const id = PDFHexString.of(hex)
  doc.context.trailerInfo.ID = doc.context.obj([id, id])
}
