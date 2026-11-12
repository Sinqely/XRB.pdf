// Skapar testfilerna i tests/filer/ (NFR-MAINT-004). Innehåller bara påhittad text.
import { PDFDocument, StandardFonts, rgb } from '@cantoo/pdf-lib'
import { writeFileSync, mkdirSync } from 'node:fs'

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
writeFileSync(new URL('../tests/filer/skadad.pdf', import.meta.url), '%PDF-1.7\n1 0 obj << /Type /Catalog >> trasigt innehåll utan sidor\n')
writeFileSync(new URL('../tests/filer/inte-pdf.pdf', import.meta.url), 'Det här är ingen PDF.\n')
console.log('Testfiler skapade i tests/filer/')
