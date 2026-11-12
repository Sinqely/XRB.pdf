// FEAT-011 Om-sidan SCR-APP-009 (FR-DOK-004..006), verifieringsrapporten SCR-APP-010 (FR-DOK-007),
// tillgänglighetsredogörelsen SCR-APP-011 (FR-DOK-008) och proven som rapporten bygger på:
// inga nätverksanrop i DS-02 (NFR-SEC-001), skript i PDF körs aldrig (NFR-SEC-003), ingen lagring (FR-ALM-008).
import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readFileSync } from 'node:fs'
import { fil, laggTillAlla, spara } from './hjalp'

const tagg = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const paket = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'))

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('om-sidan visar namn, version, att inget lämnar datorn och licenserna (FR-DOK-004..006)', async ({ page }) => {
  await page.getByRole('button', { name: 'Om PDF-bagaren' }).click()
  const d = page.getByRole('dialog', { name: 'Om PDF-bagaren' })
  await expect(d).toBeVisible()
  await expect(d.getByText(`version ${paket.version}`, { exact: false })).toBeVisible()
  await expect(d.getByText('Inga filer eller uppgifter lämnar din dator.', { exact: false })).toBeVisible()
  const tabell = d.getByRole('table')
  for (const [namn, licens] of [
    ['pdfjs-dist', 'Apache-2.0'],
    ['@cantoo/pdf-lib', 'MIT'],
    ['preact', 'MIT'],
    ['Carlito', 'OFL-1.1'],
    ['Tinos', 'OFL-1.1'],
    ['Cousine', 'OFL-1.1'],
  ])
    await expect(tabell.getByRole('row').filter({ has: page.getByText(namn, { exact: true }) })).toContainText(licens)
  await expect(tabell.getByRole('row').filter({ has: page.getByText('pdfjs-dist', { exact: true }) })).toContainText('6.5.438')
  await tabell.getByText('Carlito', { exact: true }).click()
  await expect(d.getByText('SIL Open Font License', { exact: false }).first()).toBeVisible()
  expect((await new AxeBuilder({ page }).withTags(tagg).analyze()).violations).toEqual([])
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Om PDF-bagaren' })).toBeFocused()
})

test('verifieringsrapporten och tillgänglighetsredogörelsen (FR-DOK-007, FR-DOK-008)', async ({ page }) => {
  await page.getByRole('button', { name: 'Om PDF-bagaren' }).click()
  await page.getByRole('button', { name: 'Visa verifieringsrapporten' }).click()
  const rapport = page.getByRole('dialog', { name: 'Verifieringsrapport' })
  await expect(rapport.getByRole('heading', { name: 'Verifieringsrapport' })).toBeFocused()
  for (const krav of ['NFR-SEC-001', 'NFR-SEC-002', 'NFR-SEC-003', 'NFR-SEC-004', 'NFR-PRIV-001', 'NFR-PRIV-002', 'FR-ALM-008'])
    await expect(rapport.getByRole('rowheader', { name: krav })).toBeVisible()
  expect((await new AxeBuilder({ page }).withTags(tagg).analyze()).violations).toEqual([])
  await page.getByRole('button', { name: 'Tillbaka' }).click()
  await page.getByRole('button', { name: 'Visa tillgänglighetsredogörelsen' }).click()
  const tg = page.getByRole('dialog', { name: 'Tillgänglighetsredogörelse' })
  await expect(tg.getByRole('heading', { name: 'Kända brister' })).toBeVisible()
  await expect(tg.getByText('WCAG 2.1 nivå AA', { exact: false }).first()).toBeVisible()
  expect((await new AxeBuilder({ page }).withTags(tagg).analyze()).violations).toEqual([])
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Om PDF-bagaren' })).toBeVisible()
})

test('DS-02 med en fil med skript: inga anrop, inga skript körs och inget sparas i webbläsaren (NFR-SEC-001, NFR-SEC-003, FR-ALM-008)', async ({ page }) => {
  const anrop: string[] = []
  const konsol: string[] = []
  const dialoger: string[] = []
  page.on('request', (r) => {
    if (!/^(blob|data):/.test(r.url())) anrop.push(r.url())
  })
  page.on('console', (m) => konsol.push(m.text()))
  page.on('dialog', (dl) => {
    dialoger.push(dl.message())
    void dl.dismiss()
  })
  await page.locator('#filval').setInputFiles(fil('dold.pdf'))
  await expect(page.locator('.statusyta')).toContainText('dold.pdf inläst')
  await laggTillAlla(page)
  await page.locator('#bildval').setInputFiles(fil('stampel.png'))
  await page.getByRole('tab', { name: 'Textetikett' }).click()
  await page.getByLabel('Text', { exact: true }).fill('Utkast')
  await page.waitForTimeout(500)
  const d = await spara(page)
  expect(d.suggestedFilename()).toMatch(/\.pdf$/)
  expect(anrop).toEqual([])
  expect(dialoger).toEqual([])
  expect(konsol.filter((k) => /öppnad|hej/.test(k))).toEqual([])
  const lagring = await page.evaluate(() => ({ lokal: Object.keys(localStorage), session: sessionStorage.length }))
  expect(lagring.session).toBe(0)
  expect(lagring.lokal.every((k) => /tema/i.test(k))).toBe(true)
  const databaser = await page.evaluate(async () => ((await indexedDB.databases?.()) ?? []).length)
  expect(databaser).toBe(0)
})
