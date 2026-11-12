// FEAT-006 Vattenstämpel (UC-003, UC-005; SCR-APP-002): bild, opacitet, storlek, placering, sidor och fel,
// med mus och med bara tangentbord. Placeringen i filen prövas mot layoutmodellen i tests/enhet/stampel-export.test.ts.
import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { PDFDict, PDFName } from '@cantoo/pdf-lib'
import { fil, innehall, lasPdf, laggTillAlla, spara, tabbaTill } from './hjalp'

const tagg = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const MM = 72 / 25.4
const panel = (page: Page) => page.getByRole('tabpanel', { name: 'Vattenstämpel' })
const objekt = (page: Page) => page.locator('.stampel-objekt')

async function lasIn(page: Page, ...namn: string[]) {
  await page.locator('#filval').setInputFiles(namn.map(fil))
  await expect(page.locator('.statusyta')).toContainText(`${namn[namn.length - 1]} inläst`)
}

/** Stämpelns ruta i sidans punkter, mätt i förhandsvisningen. */
async function ruta(page: Page) {
  return page.evaluate(() => {
    const sida = document.querySelector('.sidram')!.getBoundingClientRect()
    const o = document.querySelector('.stampel-objekt')!.getBoundingClientRect()
    const canvas = document.querySelector('.sidram canvas') as HTMLCanvasElement
    return { sida: { b: sida.width, h: sida.height }, x: o.left - sida.left, y: o.top - sida.top, b: o.width, h: o.height, cssB: canvas.getBoundingClientRect().width }
  })
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('märkningen är inaktiv med förklaring tills resultatet har sidor', async ({ page }) => {
  await expect(page.getByText('Lägg först till sidor i resultatet.')).toBeVisible()
  await expect(page.getByRole('tab')).toHaveCount(0)
})

test('DS-01 med mus: lägga till, ändra och spara en vattenstämpel (FR-STA-001..010, FR-PLC-002..010)', async ({ page }) => {
  await lasIn(page, 'beslut.pdf', 'blandade-format.pdf')
  await laggTillAlla(page)
  await expect(page.getByRole('tab', { name: 'Vattenstämpel' })).toHaveAttribute('aria-selected', 'true')

  // Fel bild avvisas med filnamn och orsak (FR-STA-011)
  await page.locator('#bildval').setInputFiles(fil('inte-bild.png'))
  await expect(panel(page).getByRole('alert')).toContainText('inte-bild.png kan inte användas som vattenstämpel. Bara bilder i formaten PNG och JPEG')

  // Ny stämpel: alla sidor, 100 %, nedre högra hörnet 10 mm (FR-STA-001, FR-STA-003, FR-PLC-007)
  await page.locator('#bildval').setInputFiles(fil('stampel.png'))
  await expect(page.locator('.statusyta')).toHaveText('stampel.png tillagd som vattenstämpel på alla sidor.')
  await expect(panel(page).getByRole('alert')).toHaveCount(0)
  await expect(panel(page).getByLabel('Opacitet (%)').first()).toHaveValue('100')
  await expect(panel(page).getByRole('checkbox', { name: /Alla sidor/ })).toBeChecked()
  await expect(panel(page).getByRole('radio', { name: 'Nedre högra hörnet' })).toHaveAttribute('aria-checked', 'true')
  await expect(panel(page).getByLabel('Avstånd till kant (mm)')).toHaveValue('10')
  await expect(objekt(page)).toBeVisible()
  let r = await ruta(page)
  const skala = r.sida.b / 595.28
  expect(r.sida.b - r.x - r.b).toBeCloseTo(10 * MM * skala, 0)
  expect(r.sida.h - r.y - r.h).toBeCloseTo(10 * MM * skala, 0)
  expect(r.b).toBeCloseTo(40 * MM * skala, 0)
  expect(r.h / r.b).toBeCloseTo(0.5, 2)
  await expect(page.locator('.marginal')).toBeVisible()
  // Kryssrutor i resultatraden
  await expect(page.getByRole('checkbox', { name: 'Vattenstämpel på sida 2' })).toBeChecked()

  // Opacitet (FR-STA-004)
  await panel(page).getByRole('spinbutton', { name: 'Opacitet (%)' }).fill('40')
  await panel(page).getByRole('spinbutton', { name: 'Opacitet (%)' }).press('Enter')
  await expect(objekt(page).locator('img')).toHaveCSS('opacity', '0.4')

  // Storlek med knapp och fält (FR-STA-006)
  await panel(page).getByRole('button', { name: 'Större' }).click()
  await expect(panel(page).getByLabel('Bredd (mm)')).toHaveValue('45')
  await panel(page).getByLabel('Bredd (mm)').fill('60')
  await panel(page).getByLabel('Bredd (mm)').press('Enter')
  r = await ruta(page)
  expect(r.b).toBeCloseTo(60 * MM * skala, 0)
  expect(r.h / r.b).toBeCloseTo(0.5, 2)

  // Dra i ett hörn ändrar storleken med samma proportioner (FR-STA-005)
  await objekt(page).hover()
  const handtag = page.locator('.handtag-nw')
  const hb = (await handtag.boundingBox())!
  await page.mouse.move(hb.x + 6, hb.y + 6)
  await page.mouse.down()
  await page.mouse.move(hb.x + 6 - 30, hb.y + 6, { steps: 5 })
  await page.mouse.up()
  const efter = await ruta(page)
  expect(efter.b).toBeCloseTo(r.b + 30, 0)
  expect(efter.h / efter.b).toBeCloseTo(0.5, 2)
  expect(efter.x + efter.b).toBeCloseTo(r.x + r.b, 0)
  expect(Number(await panel(page).getByLabel('Bredd (mm)').inputValue())).toBeGreaterThan(60)

  // Dra stämpeln (FR-PLC-002)
  const ob = (await objekt(page).boundingBox())!
  await page.mouse.move(ob.x + ob.width / 2, ob.y + ob.height / 2)
  await page.mouse.down()
  await page.mouse.move(ob.x + ob.width / 2 - 40, ob.y + ob.height / 2 - 80, { steps: 8 })
  await page.mouse.up()
  const flyttad = await ruta(page)
  expect(flyttad.x).toBeCloseTo(efter.x - 40, 0)
  expect(flyttad.y).toBeCloseTo(efter.y - 80, 0)
  await expect(panel(page).getByText('Egen placering.')).toBeVisible()
  await expect(panel(page).getByRole('radio', { checked: true })).toHaveCount(0)

  // Färdig placering och avstånd (FR-PLC-004, FR-PLC-005)
  await panel(page).getByRole('radio', { name: 'Centrerat i sidhuvudet' }).click()
  r = await ruta(page)
  expect(r.y).toBeCloseTo(10 * MM * skala, 0)
  expect(r.x + r.b / 2).toBeCloseTo(r.sida.b / 2, 0)
  // Varning inom säkerhetsmarginalen, med sidorna (FR-PLC-010)
  await panel(page).getByLabel('Avstånd till kant (mm)').fill('2')
  await panel(page).getByLabel('Avstånd till kant (mm)').press('Enter')
  await expect(panel(page).getByRole('status')).toHaveText(/närmare kanten än säkerhetsmarginalen på 5 mm på sidorna 1, 2, 3, 4, 5 och 6/)
  await panel(page).getByLabel('Avstånd till kant (mm)').fill('10')
  await panel(page).getByLabel('Avstånd till kant (mm)').press('Enter')
  await expect(panel(page).getByRole('status')).toHaveCount(0)

  expect((await new AxeBuilder({ page }).withTags(tagg).analyze()).violations).toEqual([])

  // Sidval: ta bort på sida 2 (FR-STA-008)
  await page.getByRole('checkbox', { name: 'Vattenstämpel på sida 2' }).uncheck()
  await expect(panel(page).getByRole('checkbox', { name: /Alla sidor/ })).not.toBeChecked()
  await expect(panel(page).getByText('Ligger på sidorna 1, 3, 4, 5 och 6.')).toBeVisible()
  await page.getByRole('listitem', { name: /plats 2 av 6/ }).click()
  await expect(objekt(page)).toHaveCount(0)

  // Spara som vanlig PDF: stämpel på rätt sidor, källsidornas flöden finns kvar (FR-SPA-008, R8)
  const d = await spara(page)
  const ut = await lasPdf((await d.path())!)
  const kalla = await lasPdf(fil('beslut.pdf'))
  const harBild = (i: number) => {
    const xo = ut.getPage(i).node.Resources()?.lookupMaybe(PDFName.of('XObject'), PDFDict)
    return !!xo && xo.keys().length > 0
  }
  expect([0, 1, 2, 3, 4, 5].map(harBild)).toEqual([true, false, true, true, true, true])
  expect(innehall(ut.getPage(0))).toContain(innehall(kalla.getPage(0)))

  // Ta bort stämpeln från alla sidor (FR-STA-010)
  await panel(page).getByRole('button', { name: 'Ta bort stämpeln' }).click()
  await expect(objekt(page)).toHaveCount(0)
  await expect(page.getByRole('checkbox', { name: /Vattenstämpel på sida/ })).toHaveCount(0)
  await expect(page.locator('.marginal')).toHaveCount(0)
})

test('byta bild behåller inställningarna (FR-STA-009) och JPEG fungerar', async ({ page }) => {
  await lasIn(page, 'arkivbar.pdf')
  await laggTillAlla(page)
  await page.locator('#bildval').setInputFiles(fil('stampel.png'))
  await panel(page).getByRole('spinbutton', { name: 'Opacitet (%)' }).fill('70')
  await panel(page).getByRole('spinbutton', { name: 'Opacitet (%)' }).press('Enter')
  await panel(page).getByRole('radio', { name: 'Övre vänstra hörnet' }).click()
  await page.locator('#bildval').setInputFiles(fil('stampel-cmyk.jpg'))
  await expect(page.locator('.statusyta')).toHaveText('Stämpelns bild bytt till stampel-cmyk.jpg.')
  await expect(panel(page).getByRole('spinbutton', { name: 'Opacitet (%)' })).toHaveValue('70')
  await expect(panel(page).getByRole('radio', { name: 'Övre vänstra hörnet' })).toHaveAttribute('aria-checked', 'true')
  const r = await ruta(page)
  expect(r.h / r.b).toBeCloseTo(1, 2)
  // CMYK-bilden har ritats om till RGB, så filen kan sparas i arkivformat utan varning
  const d = await spara(page, 'stampel-pdfa', 'pdfa')
  expect(d.suggestedFilename()).toBe('stampel-pdfa.pdf')
})

test('DS-01 med bara tangentbord: välja bild, flytta med pilar och välja sidor (BG-004, FR-PLC-003)', async ({ page }) => {
  await lasIn(page, 'blandade-format.pdf')
  await laggTillAlla(page)
  // Filväljaren fångas innan tangenttrycket, så att Playwright hinner slå på uppfångningen.
  const val = page.waitForEvent('filechooser')
  await tabbaTill(page, 'Välj bild')
  await page.keyboard.press('Enter')
  await (await val).setFiles(fil('stampel.png'))
  await expect(objekt(page)).toBeVisible()
  const fore = await ruta(page)
  await tabbaTill(page, /^Vattenstämpel stampel\.png/)
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('Shift+ArrowUp')
  const efter = await ruta(page)
  // Jämför i punkter med skalan vid varje mätning, ifall förhandsvisningens skala hinner ändras
  const pt = (r: typeof fore, v: number) => (v * 595.28) / r.sida.b
  expect(Math.abs(pt(fore, fore.x) - pt(efter, efter.x) - 1 * MM)).toBeLessThan(pt(fore, 1.5)) // högst 1,5 skärmpunkter
  expect(Math.abs(pt(fore, fore.y) - pt(efter, efter.y) - 10 * MM)).toBeLessThan(pt(fore, 1.5)) // högst 1,5 skärmpunkter
  await expect(page.locator('.statusyta')).toHaveText('Vattenstämpeln flyttad.')
  // Placeringsväljaren med piltangenter
  await tabbaTill(page, 'Nedre högra hörnet')
  await page.keyboard.press('ArrowUp')
  await expect(page.getByRole('radio', { name: 'Övre högra hörnet' })).toBeFocused()
  await expect(page.getByRole('radio', { name: 'Övre högra hörnet' })).toHaveAttribute('aria-checked', 'true')
  // Sidval med kryssruta i resultatraden
  await tabbaTill(page, 'Vattenstämpel på sida 3')
  await page.keyboard.press('Space')
  await expect(page.locator('.statusyta')).toHaveText('Vattenstämpeln borttagen från sida 3.')
})
