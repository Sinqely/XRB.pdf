// FEAT-007 Textetikett (UC-004, UC-005; SCR-APP-003): text, storlek, färg, bakgrund, typsnitt, stil, placering, sidor,
// saknade tecken och sparad fil. Etikettens läge i filen prövas mot layoutmodellen i tests/enhet/etikett.test.ts.
import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { PDFDict, PDFName } from '@cantoo/pdf-lib'
import { fil, lasPdf, laggTillAlla, spara, tabbaTill } from './hjalp'

const tagg = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const MM = 72 / 25.4
const panel = (page: Page) => page.getByRole('tabpanel', { name: 'Textetikett' })
const objekt = (page: Page) => page.locator('.etikett-objekt')
const statusyta = (page: Page) => page.locator('.statusyta')

async function borja(page: Page, ...namn: string[]) {
  await page.goto('/')
  await page.locator('#filval').setInputFiles(namn.map(fil))
  await expect(statusyta(page)).toContainText(`${namn[namn.length - 1]} inläst`)
  await laggTillAlla(page)
  await page.getByRole('tab', { name: 'Textetikett' }).click()
}

async function ruta(page: Page) {
  return page.evaluate(() => {
    const sida = document.querySelector('.sidram')!.getBoundingClientRect()
    const o = document.querySelector('.etikett-objekt')!.getBoundingClientRect()
    return { sida: { b: sida.width, h: sida.height }, x: o.left - sida.left, y: o.top - sida.top, b: o.width, h: o.height }
  })
}

test('DS-02: skriva, formge och spara en textetikett (FR-TXT-001..012, FR-PLC-006)', async ({ page }) => {
  await borja(page, 'beslut.pdf', 'blandade-format.pdf')
  const text = panel(page).getByLabel('Text', { exact: true })
  await expect(objekt(page)).toHaveCount(0)
  await text.fill('Utkast – får ej spridas, ÅÄÖ')
  await expect(statusyta(page)).toHaveText('Textetikett tillagd på alla sidor.')
  await expect(objekt(page)).toBeVisible()
  await expect(objekt(page).locator('text')).toHaveText('Utkast – får ej spridas, ÅÄÖ')
  await expect(panel(page).getByText('28 av 200')).toBeVisible()
  // Förval: 12 pt, svart, ingen bakgrund, Carlito, sidhuvudet 10 mm (FR-TXT-003, FR-PLC-006)
  await expect(panel(page).getByLabel('Textstorlek (pt)')).toHaveValue('12')
  await expect(panel(page).getByRole('radiogroup', { name: 'Textfärg' }).getByRole('radio', { name: 'Svart' })).toHaveAttribute('aria-checked', 'true')
  await expect(panel(page).getByRole('radiogroup', { name: 'Bakgrund' }).getByRole('radio', { name: 'Ingen' })).toHaveAttribute('aria-checked', 'true')
  await expect(panel(page).getByRole('radio', { name: 'Carlito (utan seriffer)' })).toBeChecked()
  await expect(panel(page).getByRole('radio', { name: 'Centrerat i sidhuvudet' })).toHaveAttribute('aria-checked', 'true')
  let r = await ruta(page)
  const skala = r.sida.b / 595.28
  expect(r.y).toBeCloseTo(10 * MM * skala, 0)
  expect(r.x + r.b / 2).toBeCloseTo(r.sida.b / 2, 0)
  const hojd12 = r.h

  // Storlek, färg, bakgrund, typsnitt och stil (FR-TXT-004..008)
  await panel(page).getByLabel('Textstorlek (pt)').fill('24')
  await panel(page).getByLabel('Textstorlek (pt)').press('Enter')
  r = await ruta(page)
  expect(r.h).toBeCloseTo(hojd12 * 2, 0)
  await panel(page).getByRole('radiogroup', { name: 'Textfärg' }).getByRole('radio', { name: 'Röd' }).click()
  await expect(objekt(page).locator('text')).toHaveAttribute('fill', '#c00000')
  await panel(page).getByRole('radiogroup', { name: 'Bakgrund' }).getByRole('radio', { name: 'Gul' }).click()
  await expect(objekt(page).locator('rect')).toHaveAttribute('fill', '#ffdd00')
  await panel(page).getByRole('radio', { name: 'Tinos (med seriffer)' }).check()
  await panel(page).getByRole('checkbox', { name: 'Fet' }).check()
  await panel(page).getByRole('checkbox', { name: 'Kursiv' }).check()
  await expect(objekt(page).locator('text')).toHaveAttribute('font-family', /serif-700-italic/)

  // Saknat tecken namnges (FR-TXT-013)
  await text.fill('Utkast 漢')
  await expect(panel(page).getByRole('alert')).toContainText('Typsnittet saknar tecknet "漢"')
  await text.fill('Utkast – får ej spridas, ÅÄÖ')
  await expect(panel(page).getByRole('alert')).toHaveCount(0)

  expect((await new AxeBuilder({ page }).withTags(tagg).analyze()).violations).toEqual([])

  // Sidval oberoende av stämpeln (FR-TXT-010)
  await page.getByRole('checkbox', { name: 'Textetikett på sida 2' }).uncheck()
  await expect(panel(page).getByRole('checkbox', { name: /Alla sidor/ })).not.toBeChecked()

  // Spara: typsnittet Tinos fet kursiv är inbäddat på sidorna med etikett
  const d = await spara(page)
  const ut = await lasPdf((await d.path())!)
  const typsnitt = (i: number) => {
    const f = ut.getPage(i).node.Resources()?.lookupMaybe(PDFName.of('Font'), PDFDict)
    return f ? f.keys().map((k) => String(f.lookup(k, PDFDict).get(PDFName.of('BaseFont')))) : []
  }
  expect(typsnitt(0).some((n) => /Tinos-BoldItalic/.test(n))).toBe(true)
  expect(typsnitt(1).some((n) => /Tinos/.test(n))).toBe(false)

  // Tom text: ingen etikett (FR-TXT-012); ta bort (FR-TXT-011)
  await text.fill('')
  await expect(objekt(page)).toHaveCount(0)
  await expect(panel(page).getByText('Fältet är tomt')).toBeVisible()
  await panel(page).getByRole('button', { name: 'Ta bort etiketten' }).click()
  await expect(page.getByRole('checkbox', { name: /Textetikett på sida/ })).toHaveCount(0)
  await expect(panel(page).getByLabel('Textstorlek (pt)')).toHaveValue('12')
})

test('högst 200 tecken och gränsen visas (FR-TXT-002); skrivandet blir ett ångra-steg', async ({ page }) => {
  await borja(page, 'beslut.pdf')
  const text = panel(page).getByLabel('Text', { exact: true })
  await text.fill('x'.repeat(199))
  await text.press('End')
  await page.keyboard.type('abc')
  await expect(text).toHaveValue(`${'x'.repeat(199)}a`)
  await expect(panel(page).getByText('Gränsen på 200 tecken är nådd.')).toBeVisible()
  await text.fill('')
  await text.pressSequentially('Hej')
  await page.getByRole('button', { name: 'Ångra' }).click()
  await expect(objekt(page)).toHaveCount(0)
})

test('etiketten flyttas med tangentbordet och varnar nära kanten och vid överlapp (FR-PLC-003, FR-PLC-010, FR-PLC-012)', async ({ page }) => {
  await borja(page, 'beslut.pdf')
  // Från fliken når Tab textfältet först i panelen
  await page.getByRole('tab', { name: 'Textetikett' }).focus()
  await page.keyboard.press('Tab')
  await expect(panel(page).getByLabel('Text', { exact: true })).toBeFocused()
  await page.keyboard.type('Utkast')
  const fore = await ruta(page)
  await tabbaTill(page, /^Textetikett "Utkast"/)
  await page.keyboard.press('Shift+ArrowUp')
  const efter = await ruta(page)
  const pt = (r: typeof fore, v: number) => (v * 595.28) / r.sida.b
  expect(Math.abs(pt(fore, fore.y) - pt(efter, efter.y) - 10 * MM)).toBeLessThan(pt(fore, 1.5)) // högst 1,5 skärmpunkter
  await expect(panel(page).getByRole('status')).toContainText('närmare kanten än säkerhetsmarginalen på 5 mm på sidorna 1, 2 och 3')
  // Stämpel i sidhuvudet överlappar etiketten
  await page.getByRole('tab', { name: 'Vattenstämpel' }).click()
  await page.locator('#bildval').setInputFiles(fil('stampel.png'))
  await page.getByRole('tabpanel', { name: 'Vattenstämpel' }).getByRole('radio', { name: 'Centrerat i sidhuvudet' }).click()
  await page.getByRole('tab', { name: 'Textetikett' }).click()
  await panel(page).getByRole('radio', { name: 'Centrerat i sidhuvudet' }).click()
  await expect(panel(page).getByText('Vattenstämpeln och textetiketten överlappar varandra på sidorna 1, 2 och 3.')).toBeVisible()
})
