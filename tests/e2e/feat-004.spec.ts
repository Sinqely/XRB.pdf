// FEAT-004: vrida sidor (FR-SID-010), visa en sida stort (FR-SID-012) och lägga till en sida en gång till (FR-SID-013).
import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { fil, innehall, lasPdf, spara } from './hjalp'

const tagg = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const statusyta = (page: Page) => page.locator('.statusyta')

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.locator('#filval').setInputFiles(fil('beslut.pdf'))
  await expect(statusyta(page)).toContainText('beslut.pdf inläst')
})

test('vrida med knapparna och R; vridningen följer med i filen men innehållet är orört (FR-SID-010, BG-009)', async ({ page }) => {
  await page.getByRole('button', { name: /sida 1 av 3 ur beslut\.pdf$/i }).click()
  await page.getByRole('button', { name: /sida 2 av 3 ur beslut\.pdf$/i }).click()
  const fore = await page.locator('.forhandsvisning canvas').boundingBox()
  await page.getByRole('button', { name: 'Vrid åt höger' }).click()
  await expect(statusyta(page)).toHaveText('Sida 1 ur beslut.pdf vriden åt höger, 90 grader från originalet.')
  // Liggande i förhandsvisningen
  await expect.poll(async () => {
    const b = await page.locator('.forhandsvisning canvas').boundingBox()
    return b ? b.width > b.height : false
  }).toBe(true)
  expect(fore!.height).toBeGreaterThan(fore!.width)
  // Sida 2 med tangentbordet: Skift+R vrider åt vänster
  const sida2 = page.getByRole('listitem', { name: /Sida 2 .*plats 2 av 2/i })
  await sida2.focus()
  await page.keyboard.press('Shift+R')
  await expect(statusyta(page)).toHaveText('Sida 2 ur beslut.pdf vriden åt vänster, 270 grader från originalet.')
  const d = await spara(page)
  const ut = await lasPdf((await d.path())!)
  const kalla = await lasPdf(fil('beslut.pdf'))
  expect(ut.getPages().map((p) => p.getRotation().angle)).toEqual([90, 270])
  for (const i of [0, 1]) expect(innehall(ut.getPage(i))).toBe(innehall(kalla.getPage(i)))
})

test('visa en sida stort från miniatyren och från förhandsvisningen, stäng med knapp eller Esc (FR-SID-012)', async ({ page }) => {
  await page.getByRole('button', { name: 'Visa sida 2 ur beslut.pdf stort' }).click()
  const d = page.getByRole('dialog', { name: 'Sida 2 ur beslut.pdf' })
  await expect(d).toBeVisible()
  await expect(d.locator('canvas')).toBeVisible()
  // Vänta tills sidan är ritad; en tom canvas är 150 px hög.
  await expect.poll(async () => (await d.locator('canvas').boundingBox())?.height ?? 0).toBeGreaterThan(400)
  expect((await new AxeBuilder({ page }).withTags(tagg).analyze()).violations).toEqual([])
  await page.keyboard.press('Escape')
  await expect(d).toBeHidden()
  await expect(page.getByRole('button', { name: 'Visa sida 2 ur beslut.pdf stort' })).toBeFocused()

  await page.getByRole('button', { name: /sida 3 av 3 ur beslut\.pdf$/i }).click()
  await page.getByRole('button', { name: 'Visa stort', exact: true }).click()
  const d3 = page.getByRole('dialog', { name: 'Sida 3 ur beslut.pdf' })
  await expect(d3).toBeVisible()
  await d3.getByRole('button', { name: 'Stäng' }).click()
  await expect(d3).toBeHidden()
})

test('lägga till en sida en gång till (FR-SID-013)', async ({ page }) => {
  await page.getByRole('button', { name: /sida 1 av 3 ur beslut\.pdf$/i }).click()
  await page.getByRole('button', { name: 'Lägg till en gång till' }).click()
  await expect(statusyta(page)).toHaveText('Sida 1 ur beslut.pdf tillagd en gång till på plats 2.')
  await expect(page.getByRole('heading', { name: /Resultat\s*2 sidor/ })).toBeVisible()
  const d = await spara(page)
  const ut = await lasPdf((await d.path())!)
  expect(ut.getPageCount()).toBe(2)
  const kalla = await lasPdf(fil('beslut.pdf'))
  for (const i of [0, 1]) expect(innehall(ut.getPage(i))).toBe(innehall(kalla.getPage(0)))
})
