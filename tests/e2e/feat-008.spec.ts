// FEAT-008 Dold information SCR-APP-004: panelen före sparandet (FR-DOL-001), metadata (FR-DOL-002..004),
// kommentarer (FR-DOL-005..007), bilagor (FR-DOL-008..010), formulärfält (FR-DOL-011), skript (FR-DOL-012),
// sidor utanför resultatet (FR-DOL-013) och "Ingen dold information hittades" (FR-DOL-014).
import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { PDFDict, PDFHexString, PDFName, PDFString } from '@cantoo/pdf-lib'
import { fil, lasPdf, spara, tabbaTill } from './hjalp'

const tagg = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const status = (page: Page) => page.getByRole('status').first()
const N = PDFName.of
const str = (o: unknown) => (o instanceof PDFString || o instanceof PDFHexString ? o.decodeText() : '')

async function lasIn(page: Page, ...namn: string[]) {
  await page.locator('#filval').setInputFiles(namn.map(fil))
  await expect(page.locator('.statusyta')).toContainText(`${namn[namn.length - 1]} inläst`)
}
async function valjSidor(page: Page, dok: string, ...sidor: number[]) {
  for (const s of sidor) await page.getByRole('button', { name: new RegExp(`sida ${s} av \\d+ ur ${dok.replace('.', '\\.')}$`, 'i') }).click()
}
const panel = (page: Page) => page.getByRole('dialog', { name: 'Dold information' })

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('panelen visas före sparandet med metadata, kommentarer, bilagor, fält och skript (FR-DOL-001, -002, -005, -008, -011, -012, -013)', async ({ page }) => {
  await lasIn(page, 'dold.pdf')
  await valjSidor(page, 'dold.pdf', 1, 2)
  await page.getByRole('button', { name: 'Baka ihop och spara' }).click()
  const p = panel(page)
  await expect(p).toBeVisible()
  await expect(p.getByRole('heading', { name: 'Dold information' })).toBeFocused()
  // Metadata för dokumentet och förifyllda uppgifter för resultatet
  const dok = p.getByRole('region', { name: 'dold.pdf' })
  await expect(dok).toContainText('Testtitel')
  await expect(dok).toContainText('Testförfattare')
  await expect(dok).toContainText('Testprogram')
  await expect(dok).toContainText('2 januari 2025')
  await expect(p.getByLabel('Titel', { exact: true })).toHaveValue('Testtitel')
  await expect(p.getByText('Förifyllt från dold.pdf.', { exact: false })).toBeVisible()
  // Bara kommentaren på sida 1; den på sida 3 hör inte till resultatet
  await expect(p.getByRole('group', { name: '1 kommentar' })).toBeVisible()
  await expect(p.getByLabel(/^På sida 1 i resultatet, av Granskare/)).toHaveValue('Kommentar pa sida 1')
  // Bilagan på dokumentnivå, inte den på sida 3
  await expect(p.getByRole('checkbox', { name: /^Ta bort bilaga\.txt/ })).toBeVisible()
  await expect(p.getByText('sidbilaga.txt')).toHaveCount(0)
  await expect(p.getByText(/PDF\/A-2 bara tillåter bifogade filer/)).toBeVisible()
  await expect(p.getByRole('checkbox', { name: /^Ta bort fältet Namn/ })).toBeVisible()
  await expect(p.getByText('Ett skript som körs när dokumentet öppnas.')).toBeVisible()
  await expect(p.getByText('Privata uppgifter från programmet som skapade sidan på sida 2 i resultatet.')).toBeVisible()
  expect((await new AxeBuilder({ page }).withTags(tagg).analyze()).violations).toEqual([])
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'ljus'))
  expect((await new AxeBuilder({ page }).withTags(tagg).analyze()).violations).toEqual([])
  // Avbryt sparar inget
  await p.getByRole('button', { name: 'Avbryt' }).click()
  await expect(p).toBeHidden()
  await expect(page.getByRole('button', { name: 'Baka ihop och spara' })).toBeFocused()
})

test('valen följer med i den sparade filen (FR-DOL-004, -006, -007, -009, -011, -012, -013)', async ({ page }) => {
  await lasIn(page, 'dold.pdf')
  await valjSidor(page, 'dold.pdf', 1, 2)
  await page.getByRole('button', { name: 'Dold information' }).click()
  const p = panel(page)
  await p.getByLabel('Titel', { exact: true }).fill('Ny titel')
  await p.getByLabel('Författare', { exact: true }).fill('')
  await p.getByLabel(/^På sida 1 i resultatet/).fill('Ändrad kommentar')
  await p.getByRole('checkbox', { name: /^Ta bort bilaga\.txt/ }).check()
  await p.getByRole('checkbox', { name: /^Ta bort fältet Namn/ }).check()
  await expect(status(page)).toHaveText('Formulärfältet tas bort när filen sparas.')
  await p.getByRole('button', { name: 'Klar' }).click()
  await expect(page.getByRole('button', { name: 'Dold information' })).toBeFocused()

  const d = await spara(page)
  const ut = await lasPdf((await d.path())!)
  expect(ut.getTitle()).toBe('Ny titel')
  expect(ut.getAuthor()).toBeUndefined()
  expect(ut.getSubject()).toBe('Testämne')
  const objekt = ut.context.enumerateIndirectObjects().map(([, o]) => o)
  const kommentarer = objekt.flatMap((o) => (o instanceof PDFDict && o.get(N('Subtype'))?.toString() === '/Text' ? [str(o.get(N('Contents')))] : []))
  expect(kommentarer).toEqual(['Ändrad kommentar'])
  expect(objekt.filter((o) => o instanceof PDFDict && o.get(N('Type'))?.toString() === '/Page')).toHaveLength(2)
  expect(ut.catalog.has(N('AcroForm'))).toBe(false)
  expect(ut.catalog.has(N('Names'))).toBe(false)
  expect(ut.catalog.has(N('OpenAction'))).toBe(false)

  // Valen finns kvar till nästa gång, och kan ångras
  await page.getByRole('button', { name: 'Dold information' }).click()
  await expect(p.getByLabel('Titel', { exact: true })).toHaveValue('Ny titel')
  await expect(p.getByRole('checkbox', { name: /^Ta bort fältet Namn/ })).toBeChecked()
  await p.getByRole('button', { name: 'Klar' }).click()
  await page.getByRole('button', { name: 'Ångra' }).click()
  await page.getByRole('button', { name: 'Dold information' }).click()
  await expect(p.getByRole('checkbox', { name: /^Ta bort fältet Namn/ })).not.toBeChecked()
})

test('kommentarer, fält och bilagor behålls som förval (FR-DOL-007, -009, -011)', async ({ page }) => {
  await lasIn(page, 'dold.pdf')
  await valjSidor(page, 'dold.pdf', 1, 2)
  const d = await spara(page)
  const ut = await lasPdf((await d.path())!)
  expect(ut.getTitle()).toBe('Testtitel')
  expect(ut.getForm().getTextField('Namn').getText()).toBe('Påhittat namn')
  const objekt = ut.context.enumerateIndirectObjects().map(([, o]) => o)
  expect(objekt.some((o) => o instanceof PDFDict && o.get(N('Subtype'))?.toString() === '/Text')).toBe(true)
  expect(ut.catalog.has(N('Names'))).toBe(true)
})

test('ingen dold information hittades, med bara tangentbord (FR-DOL-014)', async ({ page }) => {
  await lasIn(page, 'arkivbar.pdf')
  await page.getByRole('button', { name: 'Lägg till alla sidor' }).click()
  await tabbaTill(page, 'Dold information')
  await page.keyboard.press('Enter')
  const p = panel(page)
  await expect(p.getByText('Ingen dold information hittades.')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(p).toBeHidden()
  await expect(page.getByRole('button', { name: 'Dold information' })).toBeFocused()
})
