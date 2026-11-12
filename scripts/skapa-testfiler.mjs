// Skapar testfilerna i tests/filer/ (NFR-MAINT-004). Innehåller bara påhittad text.
import { PDFDocument, PDFName, PDFString, StandardFonts, rgb, cmyk } from '@cantoo/pdf-lib'
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import fontkit from '@pdf-lib/fontkit'

mkdirSync(new URL('../tests/filer/', import.meta.url), { recursive: true })
async function skapa(namn, sidor) {
  const doc = await PDFDocument.create()
  doc.setTitle(namn.replace('.pdf', ''))
  const font = await doc.embedFont(StandardFonts.Helvetica)
  sidor.forEach(([text, b, h], i) => {
    const s = doc.addPage([b, h])
    s.drawText(`${text} – sida ${i + 1}`, { x: 50, y: h - 80, size: 18, font, color: rgb(0, 0, 0) })
  })
  writeFileSync(new URL(`../tests/filer/${namn}`, import.meta.url), await doc.save({ useObjectStreams: false }))
}
const A4 = [595.28, 841.89]
await skapa('beslut.pdf', [['Beslut', ...A4], ['Beslut', ...A4], ['Beslut', ...A4]])
await skapa('underskrift.pdf', [['Underskriven sida', ...A4]])
await skapa('blandade-format.pdf', [['Stående A4', ...A4], ['Liggande A4', A4[1], A4[0]], ['Letter', 612, 792]])
await skapa('hundra-sidor.pdf', Array.from({ length: 100 }, () => ['Hundra sidor', ...A4]))
{
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  doc.addPage(A4).drawText('Hemlig sida', { x: 50, y: 760, size: 18, font })
  doc.encrypt({ userPassword: 'hemligt', ownerPassword: 'agare' })
  writeFileSync(new URL('../tests/filer/losenord.pdf', import.meta.url), await doc.save({ useObjectStreams: false }))
}
// Sidor med inbäddat typsnitt (Carlito, OFL) som kan bli PDF/A-2b, och en CMYK-sida som inte kan det.
{
  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit)
  const font = await doc.embedFont(readFileSync(new URL('../src/resurser/typsnitt/etikett/carlito-400-normal.ttf', import.meta.url)), { subset: false })
  for (let i = 1; i <= 2; i++) doc.addPage(A4).drawText(`Arkivbar sida ${i} – åäö`, { x: 50, y: 760, size: 18, font, color: rgb(0, 0, 0) })
  writeFileSync(new URL('../tests/filer/arkivbar.pdf', import.meta.url), await doc.save({ useObjectStreams: false }))
}
{
  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit)
  const font = await doc.embedFont(readFileSync(new URL('../src/resurser/typsnitt/etikett/carlito-400-normal.ttf', import.meta.url)), { subset: false })
  const s = doc.addPage(A4)
  s.drawText('Tryckfärger (CMYK)', { x: 50, y: 760, size: 18, font, color: cmyk(0, 1, 1, 0) })
  writeFileSync(new URL('../tests/filer/cmyk.pdf', import.meta.url), await doc.save({ useObjectStreams: false }))
}
// Dold information (FEAT-008): metadata, kommentarer, bilagor, formulärfält, skript och programdata.
// Sidan 3 bär sådant som inte får följa med när bara sida 1 och 2 väljs (FR-DOL-013).
{
  // Sidorna kopieras från arkivbar.pdf, så att filen kan bli PDF/A när kommentarerna har utseenden.
  const doc = await PDFDocument.create()
  const arkivbar = await PDFDocument.load(readFileSync(new URL('../tests/filer/arkivbar.pdf', import.meta.url)))
  doc.setTitle('Testtitel')
  doc.setAuthor('Testförfattare')
  doc.setSubject('Testämne')
  doc.setKeywords(['testord'])
  doc.setCreator('Testprogram')
  doc.setProducer('Testproducent')
  doc.setCreationDate(new Date('2025-01-02T03:04:05Z'))
  doc.setModificationDate(new Date('2025-06-07T08:09:10Z'))
  const sidor = []
  for (const i of [0, 1, 0]) {
    const [s] = await doc.copyPages(arkivbar, [i])
    sidor.push(doc.addPage(s))
  }
  const ctx = doc.context
  const utseende = (b, h) => ctx.register(ctx.stream(`0 0 1 rg 0 0 ${b} ${h} re f`, { Type: 'XObject', Subtype: 'Form', BBox: [0, 0, b, h] }))
  const kommentar = (sida, text, x) => {
    const popup = ctx.register(ctx.obj({ Type: 'Annot', Subtype: 'Popup', Rect: [x + 30, 600, x + 230, 700], F: 4 + 8 + 16 }))
    const a = ctx.register(
      ctx.obj({ Type: 'Annot', Subtype: 'Text', Rect: [x, 700, x + 20, 720], Contents: PDFString.of(text), T: PDFString.of('Granskare'), F: 4, AP: { N: utseende(20, 20) }, Popup: popup, P: sida.ref }),
    )
    ctx.lookup(popup).set(PDFName.of('Parent'), a)
    sida.node.addAnnot(a)
    sida.node.addAnnot(popup)
  }
  kommentar(sidor[0], 'Kommentar pa sida 1', 60)
  kommentar(sidor[2], 'Kommentar pa sida 3', 60)
  // Länkar från sida 1 till sida 3 (som inte ska följa med) och till sida 2.
  for (const [mal, y] of [[sidor[2], 500], [sidor[1], 450]]) {
    sidor[0].node.addAnnot(ctx.register(ctx.obj({ Type: 'Annot', Subtype: 'Link', Rect: [50, y, 200, y + 20], Border: [0, 0, 0], F: 4, Dest: [mal.ref, 'Fit'] })))
  }
  // Bifogad fil som kommentar på sida 3.
  const sidbilaga = ctx.register(ctx.flateStream(new TextEncoder().encode('Sidbilaga med påhittat innehåll'), { Type: 'EmbeddedFile', Params: { Size: 31 } }))
  sidor[2].node.addAnnot(
    ctx.register(
      ctx.obj({ Type: 'Annot', Subtype: 'FileAttachment', Rect: [300, 700, 320, 720], F: 4, AP: { N: utseende(20, 20) }, Contents: PDFString.of('Sidbilaga'), FS: { Type: 'Filespec', F: PDFString.of('sidbilaga.txt'), UF: PDFString.of('sidbilaga.txt'), EF: { F: sidbilaga } } }),
    ),
  )
  // Formulärfält på sida 2 med ett skript.
  const form = doc.getForm()
  const falt = form.createTextField('Namn')
  falt.setText('Påhittat namn')
  falt.addToPage(sidor[1], { x: 50, y: 600, width: 200, height: 24 })
  // Eget utseende utan typsnitt, så att sidan kan bli PDF/A.
  falt.acroField.getWidgets()[0].setNormalAppearance(utseende(200, 24))
  falt.acroField.dict.set(PDFName.of('AA'), ctx.obj({ K: { S: 'JavaScript', JS: PDFString.of('event.value = event.value;') } }))
  // Skript på dokumentnivå, bilaga på dokumentnivå och programdata på sida 2.
  doc.addJavaScript('hej', 'console.println("hej");')
  doc.catalog.set(PDFName.of('OpenAction'), ctx.obj({ S: 'JavaScript', JS: PDFString.of('console.println("öppnad");') }))
  await doc.attach(new TextEncoder().encode('Bilaga med påhittat innehåll'), 'bilaga.txt', { mimeType: 'text/plain', description: 'Testbilaga' })
  sidor[1].node.set(PDFName.of('PieceInfo'), ctx.obj({ Testprogram: { LastModified: PDFString.of('D:20250101000000Z'), Private: PDFString.of('Privat programdata') } }))
  writeFileSync(new URL('../tests/filer/dold.pdf', import.meta.url), await doc.save({ useObjectStreams: false, updateFieldAppearances: false }))
}
writeFileSync(new URL('../tests/filer/skadad.pdf', import.meta.url), '%PDF-1.7\n1 0 obj << /Type /Catalog >> trasigt innehåll utan sidor\n')
writeFileSync(new URL('../tests/filer/inte-pdf.pdf', import.meta.url), 'Det här är ingen PDF.\n')
console.log('Testfiler skapade i tests/filer/')
