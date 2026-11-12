// FEAT-009 Arkivformat: PDF/A-2b som standard (FR-SPA-004), förkontroll och varning SCR-APP-006 (FR-SPA-005)
// och vanlig PDF utan PDF/A-märkning (FR-SPA-006). Filen valideras med veraPDF (NFR-COMP-004).
import { expect, test, type Download, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { PDFName } from '@cantoo/pdf-lib'
import { fil, innehall, lasPdf, laggTillAlla, spara } from './hjalp'

const tagg = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const status = (page: Page) => page.getByRole('status')
// veraPDF läser bara filer med ändelsen .pdf, så nedladdningen sparas med sitt namn först.
async function verapdf(d: Download): Promise<string> {
  const sokvag = test.info().outputPath(d.suggestedFilename())
  await d.saveAs(sokvag)
  return execFileSync('node', [new URL('../../scripts/verapdf.mjs', import.meta.url).pathname, sokvag], { encoding: 'utf8' })
}
const arPdfa = (sokvag: string) => readFileSync(sokvag).toString('latin1').includes('pdfaid:part')

async function lasIn(page: Page, ...namn: string[]) {
  await page.locator('#filval').setInputFiles(namn.map(fil))
  await expect(status(page)).toContainText(`${namn[namn.length - 1]} inläst`)
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('arkivformat är förvalt och ger en fil som veraPDF godkänner (FR-SPA-004, NFR-COMP-004)', async ({ page }) => {
  await lasIn(page, 'arkivbar.pdf')
  await laggTillAlla(page)
  await page.getByRole('button', { name: 'Baka ihop och spara' }).click()
  const dialog = page.getByRole('dialog', { name: 'Baka ihop och spara' })
  await expect(dialog.getByRole('radio', { name: /^Arkivformat PDF\/A/ })).toBeChecked()
  const nedladdning = page.waitForEvent('download')
  await dialog.getByRole('button', { name: 'Spara' }).click()
  const d = await nedladdning
  const sokvag = (await d.path())!
  expect(await verapdf(d)).toMatch(/^PASS .* 2b$/m)
  const ut = await lasPdf(sokvag)
  const kalla = await lasPdf(fil('arkivbar.pdf'))
  expect(ut.getPageCount()).toBe(2)
  for (let i = 0; i < 2; i++) expect(innehall(ut.getPage(i))).toBe(innehall(kalla.getPage(i)))
})

test('sidor som hindrar arkivformatet listas med orsak; avbryta, vanlig PDF och ta bort (FR-SPA-005, FR-SPA-006)', async ({ page }) => {
  await lasIn(page, 'arkivbar.pdf', 'beslut.pdf', 'cmyk.pdf')
  await laggTillAlla(page)
  // arkivbar 2 sidor, beslut 3 sidor (Helvetica ej inbäddad), cmyk 1 sida
  await page.getByRole('button', { name: 'Baka ihop och spara' }).click()
  const dialog = page.getByRole('dialog', { name: 'Baka ihop och spara' })
  await dialog.getByRole('button', { name: 'Spara' }).click()

  const varning = page.getByRole('dialog', { name: 'Filen kan inte sparas i arkivformat' })
  await expect(varning).toBeVisible()
  await expect(varning).toContainText('4 sidor hindrar att filen blir PDF/A')
  const lista = varning.getByRole('list', { name: 'Filen kan inte sparas i arkivformat' })
  await expect(lista.locator(':scope > li')).toHaveCount(4)
  await expect(lista).toContainText('Sida 3 i resultatet (beslut.pdf, sida 1)')
  await expect(lista).toContainText('Typsnittet Helvetica är inte inbäddat i sidan.')
  await expect(lista).toContainText('Sida 6 i resultatet (cmyk.pdf, sida 1)')
  await expect(lista).toContainText('Sidan har tryckfärger (CMYK) utan färgprofil.')
  await expect(lista).not.toContainText('Sida 1 i resultatet')
  expect((await new AxeBuilder({ page }).withTags(tagg).analyze()).violations).toEqual([])

  // Avbryt går tillbaka till spara-dialogen utan att något ändras
  await varning.getByRole('button', { name: 'Avbryt' }).click()
  await expect(dialog).toBeVisible()
  await expect(page.locator('.resultatetikett')).toHaveCount(6)

  // Spara som vanlig PDF: alla sidor, ingen PDF/A-märkning (FR-SPA-006)
  await dialog.getByRole('button', { name: 'Spara' }).click()
  let nedladdning = page.waitForEvent('download')
  await varning.getByRole('button', { name: 'Spara som vanlig PDF' }).click()
  let sokvag = (await (await nedladdning).path())!
  await expect(dialog).toBeHidden()
  let ut = await lasPdf(sokvag)
  expect(ut.getPageCount()).toBe(6)
  expect(ut.catalog.has(PDFName.of('OutputIntents'))).toBe(false)
  expect(arPdfa(sokvag)).toBe(false)

  // Ta bort sidorna: resten sparas som PDF/A, och borttagningen kan ångras
  await page.getByRole('button', { name: 'Baka ihop och spara' }).click()
  await expect(dialog.getByRole('radio', { name: /^Arkivformat PDF\/A/ })).toBeChecked()
  await dialog.getByRole('button', { name: 'Spara' }).click()
  nedladdning = page.waitForEvent('download')
  await varning.getByRole('button', { name: 'Ta bort de 4 sidorna' }).click()
  const d = await nedladdning
  sokvag = (await d.path())!
  await expect(page.locator('.resultatetikett')).toHaveCount(2)
  ut = await lasPdf(sokvag)
  expect(ut.getPageCount()).toBe(2)
  expect(await verapdf(d)).toMatch(/^PASS .* 2b$/m)
  await page.getByRole('button', { name: 'Ångra' }).click()
  await expect(page.locator('.resultatetikett')).toHaveCount(6)
})

test('när alla sidor har hinder erbjuds bara vanlig PDF eller avbryt (FR-SPA-005)', async ({ page }) => {
  await lasIn(page, 'cmyk.pdf')
  await laggTillAlla(page)
  await page.getByRole('button', { name: 'Baka ihop och spara' }).click()
  await page.getByRole('dialog', { name: 'Baka ihop och spara' }).getByRole('button', { name: 'Spara' }).click()
  const varning = page.getByRole('dialog', { name: 'Filen kan inte sparas i arkivformat' })
  await expect(varning).toContainText('det finns inget kvar att spara i arkivformat')
  await expect(varning.getByRole('button', { name: /^Ta bort/ })).toHaveCount(0)
  await expect(varning.getByRole('button', { name: 'Spara som vanlig PDF' })).toBeVisible()
  await expect(varning.getByRole('heading', { name: 'Filen kan inte sparas i arkivformat' })).toBeFocused()
})

test('vanlig PDF kan väljas direkt och valet behålls till nästa sparande (FR-SPA-006)', async ({ page }) => {
  await lasIn(page, 'arkivbar.pdf')
  await laggTillAlla(page)
  const d = await spara(page, undefined, 'pdf')
  expect(arPdfa((await d.path())!)).toBe(false)
  await page.getByRole('button', { name: 'Baka ihop och spara' }).click()
  await expect(page.getByRole('dialog', { name: 'Baka ihop och spara' }).getByRole('radio', { name: /^Vanlig PDF/ })).toBeChecked()
})
