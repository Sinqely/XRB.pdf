// Skelettets end-to-end-test (docs/implementation-plan.md avsnitt 2):
// läsa in en PDF, se sidantal, spara en ihopbakad kopia – utan ett enda nätverksanrop.
import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { PDFDocument } from '@cantoo/pdf-lib'
import { readFileSync } from 'node:fs'

const fil = (n: string) => new URL(`../filer/${n}`, import.meta.url).pathname

test('läser in en PDF och sparar en kopia utan nätverksanrop (NFR-SEC-002)', async ({ page }) => {
  const anrop: string[] = []
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Baka ihop och spara' })).toBeVisible()
  // Efter laddning: registrera allt som går ut, utom blob:/data: som stannar i webbläsaren.
  page.on('request', (r) => {
    if (!/^(blob|data):/.test(r.url())) anrop.push(r.url())
  })

  await page.locator('#filval').setInputFiles([fil('beslut.pdf'), fil('underskrift.pdf')])
  await expect(page.getByRole('status')).toContainText('underskrift.pdf inläst, 1 sida')
  await expect(page.getByText('3 sidor', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: /2 Resultat · 4 sidor/ })).toBeVisible()
  await expect(page.getByAltText('Sida 1 av 3 ur beslut.pdf')).toBeVisible()

  const nedladdning = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Baka ihop och spara' }).click()
  const d = await nedladdning
  expect(d.suggestedFilename()).toBe('beslut-ihopbakad.pdf')
  const sparad = await PDFDocument.load(readFileSync((await d.path())!))
  expect(sparad.getPageCount()).toBe(4)
  await expect(page.getByRole('status')).toContainText('Sparad som beslut-ihopbakad.pdf')

  expect(anrop).toEqual([])
})

test('fungerar med nätverket avstängt efter laddning (BG-007)', async ({ page, context }) => {
  await page.goto('/')
  await context.setOffline(true)
  await page.locator('#filval').setInputFiles(fil('beslut.pdf'))
  await expect(page.getByRole('status')).toContainText('beslut.pdf inläst, 3 sidor')
  const nedladdning = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Baka ihop och spara' }).click()
  expect((await nedladdning).suggestedFilename()).toBe('beslut-ihopbakad.pdf')
})

test('visar ett begripligt fel för en fil som inte är PDF (BH-020)', async ({ page }) => {
  await page.goto('/')
  await page.locator('#filval').setInputFiles(fil('inte-pdf.pdf'))
  await expect(page.getByRole('alert')).toContainText('inte-pdf.pdf kunde inte läsas in')
})

test('har inga automatiskt upptäckta WCAG 2.1 AA-fel i startläget och med fil (NFR-ACC-001)', async ({ page }) => {
  await page.goto('/')
  const tagg = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
  expect((await new AxeBuilder({ page }).withTags(tagg).analyze()).violations).toEqual([])
  await page.locator('#filval').setInputFiles(fil('beslut.pdf'))
  await expect(page.getByAltText('Sida 1 av 3 ur beslut.pdf')).toBeVisible()
  expect((await new AxeBuilder({ page }).withTags(tagg).analyze()).violations).toEqual([])
})

test('GP MS-tokens används i skalet, mörkt tema som standard och ljust som val (FR-ALM-009)', async ({ page }) => {
  await page.goto('/')
  const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  expect(await bg()).toBe('rgb(72, 75, 67)') // skiffer #484b43 ur tokens.json
  await page.getByRole('button', { name: 'Ljust tema' }).click()
  await expect.poll(bg).toBe('rgb(236, 234, 230)') // sten-ljus #eceae6
  await page.reload()
  await expect.poll(bg).toBe('rgb(236, 234, 230)')
})

test('CSP står först i head och spärrar anslutningar (R2)', async ({ page }) => {
  await page.goto('/')
  const forsta = await page.evaluate(() => document.head.firstElementChild?.outerHTML ?? '')
  expect(forsta).toContain("connect-src 'none'")
  const blockerat = await page.evaluate(async () => {
    try {
      await fetch('https://example.com/')
      return false
    } catch {
      return true
    }
  })
  expect(blockerat).toBe(true)
})

test('fungerar när filen öppnas direkt från disken (file://), som Ägaren provat', async ({ page }) => {
  const anrop: string[] = []
  page.on('request', (r) => {
    if (!/^(blob|data|file):/.test(r.url())) anrop.push(r.url())
  })
  await page.goto(new URL('../../dist/index.html', import.meta.url).href)
  await page.locator('#filval').setInputFiles([fil('beslut.pdf'), fil('underskrift.pdf')])
  await expect(page.getByRole('status')).toContainText('underskrift.pdf inläst, 1 sida')
  const nedladdning = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Baka ihop och spara' }).click()
  const d = await nedladdning
  expect((await PDFDocument.load(readFileSync((await d.path())!))).getPageCount()).toBe(4)
  expect(anrop).toEqual([])
})
