// FEAT-001 Baka ihop: acceptanskriterier AC-1..AC-17 (docs/features/FEAT-001-baka-ihop/technical-design.md §6).
// DS-01 utan stämpel (UC-001, UC-002, UC-007) med mus och med bara tangentbord.
import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readFileSync } from 'node:fs'
import { fil, innehall, lasPdf, laggTillAlla, spara, tabbaTill } from './hjalp'

const tagg = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const etiketter = (page: Page) => page.locator('.resultatetikett').allTextContents()
const status = (page: Page) => page.getByRole('status')

async function lasIn(page: Page, ...namn: string[]) {
  await page.locator('#filval').setInputFiles(namn.map(fil))
  await expect(status(page)).toContainText(`${namn[namn.length - 1]} inläst`)
}

async function kontrolleraSparad(sokvag: string, forvantat: [string, number][]) {
  const ut = await lasPdf(sokvag)
  expect(ut.getPageCount()).toBe(forvantat.length)
  const kallor = new Map<string, Awaited<ReturnType<typeof lasPdf>>>()
  for (const [i, [namn, sida]] of forvantat.entries()) {
    if (!kallor.has(namn)) kallor.set(namn, await lasPdf(fil(namn)))
    expect(innehall(ut.getPage(i))).toBe(innehall(kallor.get(namn)!.getPage(sida - 1)))
  }
  expect(ut.isEncrypted).toBe(false)
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('DS-01 med mus: läsa in, välja, ta bort, dra och spara (AC-1, AC-5..AC-10, AC-12, AC-13, AC-16)', async ({ page }) => {
  const anrop: string[] = []
  page.on('request', (r) => {
    if (!/^(blob|data):/.test(r.url())) anrop.push(r.url())
  })
  await lasIn(page, 'beslut.pdf', 'underskrift.pdf')
  // AC-1: båda filerna med namn och antal sidor, resultatet tomt (B1)
  await expect(page.getByRole('heading', { name: 'beslut.pdf' })).toBeVisible()
  await expect(page.getByText('3 sidor · under 0,1 MB')).toBeVisible()
  await expect(page.getByText('Inga sidor ännu. Klicka på en miniatyr för att lägga till den.')).toBeVisible()
  // AC-5: miniatyrer med namn
  await expect(page.getByRole('button', { name: 'Sida 3 av 3 ur beslut.pdf' }).locator('img')).toBeVisible()

  await page.getByRole('button', { name: 'Lägg till alla sidor' }).first().click()
  await expect(status(page)).toHaveText('3 sidor ur beslut.pdf tillagda. Resultatet har 3 sidor.')
  await expect(page.getByRole('button', { name: 'Vald, sida 2 av 3 ur beslut.pdf' })).toHaveAttribute('aria-pressed', 'true')

  await page.getByRole('button', { name: 'Ta bort sida 2 ur beslut.pdf från resultatet' }).click()
  await expect(status(page)).toHaveText('Sida 2 ur beslut.pdf borttagen ur resultatet.')
  await page.getByRole('button', { name: 'Sida 1 av 1 ur underskrift.pdf' }).click()
  await expect(status(page)).toHaveText('Sida 1 ur underskrift.pdf tillagd på plats 3.')
  expect(await etiketter(page)).toEqual(['1 · beslut.pdf s. 1', '2 · beslut.pdf s. 3', '3 · underskrift.pdf s. 1'])

  // AC-9: dra underskriften till plats 2
  const rad = page.getByRole('list', { name: 'Resultatets sidor' })
  const kalla = rad.getByRole('listitem', { name: /ur underskrift\.pdf, plats 3/ })
  const mal = rad.getByRole('listitem', { name: /Sida 3 av 3 ur beslut\.pdf, plats 2/ })
  await kalla.dragTo(mal, { targetPosition: { x: 5, y: 40 } })
  await expect(status(page)).toHaveText('Sida 1 ur underskrift.pdf flyttad till plats 2.')
  expect(await etiketter(page)).toEqual(['1 · beslut.pdf s. 1', '2 · underskrift.pdf s. 1', '3 · beslut.pdf s. 3'])
  await expect(page.getByRole('heading', { name: /Resultat\s*3 sidor/ })).toBeVisible() // AC-8

  // AC-12, AC-13: spara med eget namn, sidorna orörda och i ordning
  const d = await spara(page, 'Beslut/slutligt?')
  expect(d.suggestedFilename()).toBe('Beslutslutligt.pdf')
  await expect(status(page)).toHaveText('Sparad som Beslutslutligt.pdf.')
  await kontrolleraSparad((await d.path())!, [['beslut.pdf', 1], ['underskrift.pdf', 1], ['beslut.pdf', 3]])

  // AC-14: arbetsytan finns kvar och nästa sparande föreslår samma namn
  expect(await etiketter(page)).toHaveLength(3)
  await page.getByRole('button', { name: 'Baka ihop och spara' }).click()
  await expect(page.getByLabel('Filnamn')).toHaveValue('Beslutslutligt.pdf')
  await page.getByRole('button', { name: 'Avbryt' }).click()

  expect(anrop).toEqual([]) // AC-16
})

test('DS-01 med bara tangentbord (AC-6, AC-9, AC-12, AC-15)', async ({ page }) => {
  await lasIn(page, 'beslut.pdf', 'underskrift.pdf')
  await tabbaTill(page, 'Lägg till alla sidor')
  await page.keyboard.press('Enter')
  await tabbaTill(page, /^Sida 2 av 3 ur beslut\.pdf, plats 2 av 3$/)
  await page.keyboard.press('Delete')
  await expect(status(page)).toHaveText('Sida 2 ur beslut.pdf borttagen ur resultatet.')
  await tabbaTill(page, 'Sida 1 av 1 ur underskrift.pdf')
  await page.keyboard.press('Space')
  await expect(status(page)).toHaveText('Sida 1 ur underskrift.pdf tillagd på plats 3.')
  await tabbaTill(page, /ur underskrift\.pdf, plats 3 av 3$/)
  await page.keyboard.press('Alt+ArrowLeft')
  await expect(status(page)).toHaveText('Sida 1 ur underskrift.pdf flyttad till plats 2.')
  // Fokus följer den flyttade sidan
  await expect(page.locator(':focus')).toHaveAttribute('aria-label', /ur underskrift\.pdf, plats 2 av 3$/)
  await page.keyboard.press('Alt+ArrowLeft')
  await page.keyboard.press('Alt+ArrowLeft')
  await expect(status(page)).toHaveText('Sidan är redan först.')
  await page.keyboard.press('Alt+ArrowRight')

  await tabbaTill(page, 'Baka ihop och spara')
  await page.keyboard.press('Enter')
  await expect(page.getByLabel('Filnamn')).toBeFocused()
  const nedladdning = page.waitForEvent('download')
  await page.keyboard.press('Enter')
  const d = await nedladdning
  expect(d.suggestedFilename()).toBe('beslut-ihopbakad.pdf')
  await expect(page.getByRole('button', { name: 'Baka ihop och spara' })).toBeFocused()
  await kontrolleraSparad((await d.path())!, [['beslut.pdf', 1], ['underskrift.pdf', 1], ['beslut.pdf', 3]])
})

test('växla miniatyr, ny fil och ta bort fil (AC-3, AC-4, AC-6)', async ({ page }) => {
  await lasIn(page, 'beslut.pdf')
  const sida2 = page.getByRole('button', { name: /sida 2 av 3 ur beslut\.pdf$/i })
  await sida2.click()
  await expect(sida2).toHaveAttribute('aria-pressed', 'true')
  await sida2.click()
  await expect(sida2).toHaveAttribute('aria-pressed', 'false')
  await expect(status(page)).toHaveText('Sida 2 ur beslut.pdf borttagen ur resultatet.')

  await page.getByRole('button', { name: 'Lägg till alla sidor' }).click()
  await page.locator('#filval').setInputFiles([fil('underskrift.pdf'), fil('beslut.pdf')])
  await expect(status(page)).toHaveText('beslut.pdf (2) inläst, 3 sidor.')
  expect(await etiketter(page)).toEqual(['1 · beslut.pdf s. 1', '2 · beslut.pdf s. 2', '3 · beslut.pdf s. 3'])
  await expect(page.getByRole('heading', { name: 'beslut.pdf (2)' })).toBeVisible()

  await page.getByRole('button', { name: 'Sida 1 av 1 ur underskrift.pdf' }).click()
  await page.getByRole('button', { name: 'Ta bort beslut.pdf', exact: true }).click()
  await expect(status(page)).toHaveText('beslut.pdf borttagen. 3 sidor togs bort ur resultatet.')
  expect(await etiketter(page)).toEqual(['1 · underskrift.pdf s. 1'])
  await expect(page.getByRole('heading', { name: 'beslut.pdf', exact: true })).toHaveCount(0)
})

test('släpp av fil på arbetsytan läser in den (AC-2)', async ({ page }) => {
  const bytes = readFileSync(fil('underskrift.pdf')).toString('base64')
  await page.evaluate((b64) => {
    const data = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
    const dt = new DataTransfer()
    dt.items.add(new File([data], 'släppt.pdf', { type: 'application/pdf' }))
    const mal = document.querySelector('.kolumn-mitt')!
    for (const typ of ['dragenter', 'dragover', 'drop'])
      mal.dispatchEvent(new DragEvent(typ, { dataTransfer: dt, bubbles: true, cancelable: true }))
  }, bytes)
  await expect(status(page)).toHaveText('släppt.pdf inläst, 1 sida.')
  await expect(page).toHaveURL(/127\.0\.0\.1|localhost/)
})

test('"Baka ihop och spara" är inaktiv med förklaring när resultatet är tomt (AC-11)', async ({ page }) => {
  const knapp = page.getByRole('button', { name: 'Baka ihop och spara' })
  await expect(knapp).toHaveAttribute('aria-disabled', 'true')
  await expect(knapp).toHaveAccessibleDescription('Läs in minst en PDF-fil först.')
  await lasIn(page, 'beslut.pdf')
  await expect(knapp).toHaveAccessibleDescription('Välj minst en sida först.')
  // Playwright klickar inte på aria-disabled; skicka klicket direkt för att pröva att inget händer.
  await knapp.dispatchEvent('click')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('inga WCAG 2.1 AA-fel med resultat och i spara-dialogen (AC-15)', async ({ page }) => {
  await lasIn(page, 'beslut.pdf', 'underskrift.pdf')
  await laggTillAlla(page)
  await expect(page.locator('.resultatsida img')).toHaveCount(4)
  expect((await new AxeBuilder({ page }).withTags(tagg).analyze()).violations).toEqual([])
  await page.getByRole('button', { name: 'Baka ihop och spara' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  expect((await new AxeBuilder({ page }).withTags(tagg).analyze()).violations).toEqual([])
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'ljus'))
  expect((await new AxeBuilder({ page }).withTags(tagg).analyze()).violations).toEqual([])
})

test('100 sidor inlästa med alla miniatyrer inom 5 sekunder, och frigörs vid borttagning (AC-17)', async ({ page }) => {
  const start = Date.now()
  await page.locator('#filval').setInputFiles(fil('hundra-sidor.pdf'))
  await expect(page.locator('.miniatyr img')).toHaveCount(100, { timeout: 5000 })
  expect(Date.now() - start).toBeLessThan(5000)
  await page.getByRole('button', { name: 'Ta bort hundra-sidor.pdf' }).click()
  await expect(page.locator('img[src^="blob:"]')).toHaveCount(0)
})
