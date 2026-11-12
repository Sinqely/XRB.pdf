// FEAT-010 Startläge, hjälp och kortkommandon: startläget (FR-ALM-005, FR-DOK-002), hjälp vid varje steg
// (FR-DOK-001), vardagsfallen (FR-DOK-003), kortkommandon i hjälpen (FR-DOK-009) och med ? (FR-ALM-010).
import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { fil } from './hjalp'

const tagg = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('startläget visar ytan för filer och de tre stegen (FR-ALM-005, FR-DOK-002)', async ({ page }) => {
  await expect(page.getByText('Dra in PDF-filer här')).toBeVisible()
  await expect(page.getByText('eller välj filer')).toBeVisible()
  for (const steg of ['1 Läs in filer.', '2 Välj och ordna sidor.', '3 Märk och spara.']) await expect(page.getByText(steg)).toBeVisible()
  await page.locator('#filval').setInputFiles(fil('beslut.pdf'))
  await page.getByRole('button', { name: 'Lägg till alla sidor' }).click()
  await expect(page.getByText('1 Läs in filer.')).toBeHidden()
})

test('hjälpen har stegen, vardagsfallen och kortkommandona (FR-DOK-001, FR-DOK-003, FR-DOK-009)', async ({ page }) => {
  await page.getByRole('button', { name: 'Hjälp', exact: true }).click()
  const d = page.getByRole('dialog', { name: 'Hjälp' })
  await expect(d).toBeVisible()
  for (const r of ['1 Läs in filer', '2 Välj och ordna sidor', '3 Vattenstämpel och textetikett', '4 Baka ihop och spara', 'Beslut med inskannad namnteckning', 'Märka en PDF', 'Kortkommandon'])
    await expect(d.getByRole('heading', { name: r })).toBeVisible()
  await expect(d.getByRole('table', { name: 'Allmänt' }).getByRole('row', { name: /Ctrl\+Z.*Ångra/ })).toBeVisible()
  expect((await new AxeBuilder({ page }).withTags(tagg).analyze()).violations).toEqual([])
  await page.keyboard.press('Escape')
  await expect(d).toBeHidden()
  await expect(page.getByRole('button', { name: 'Hjälp', exact: true })).toBeFocused()
})

test('hjälpknappen vid ett steg öppnar hjälpen vid det steget (FR-DOK-001)', async ({ page }) => {
  await page.locator('#filval').setInputFiles(fil('beslut.pdf'))
  await page.getByRole('button', { name: 'Lägg till alla sidor' }).click()
  for (const [knapp, rubrik] of [
    ['Hjälp om att läsa in filer', '1 Läs in filer'],
    ['Hjälp om att välja och ordna sidor', '2 Välj och ordna sidor'],
    ['Hjälp om vattenstämpel och textetikett', '3 Vattenstämpel och textetikett'],
  ]) {
    await page.getByRole('button', { name: knapp }).click()
    await expect(page.getByRole('heading', { name: rubrik })).toBeFocused()
    await page.getByRole('button', { name: 'Klar' }).click()
    await expect(page.getByRole('button', { name: knapp })).toBeFocused()
  }
})

test('? visar kortkommandona, också från hjälpen (FR-ALM-010)', async ({ page }) => {
  await page.locator('body').click()
  await page.keyboard.press('Shift+?')
  const d = page.getByRole('dialog', { name: 'Kortkommandon' })
  await expect(d).toBeVisible()
  await expect(d.getByRole('row', { name: /Alt\+vänster- eller högerpil.*Flytta sidan/ })).toBeVisible()
  expect((await new AxeBuilder({ page }).withTags(tagg).analyze()).violations).toEqual([])
  await page.keyboard.press('Escape')
  await expect(d).toBeHidden()
  await page.getByRole('button', { name: 'Hjälp', exact: true }).click()
  await page.getByRole('button', { name: 'Visa alla kortkommandon' }).click()
  await expect(d).toBeVisible()
  await d.getByRole('button', { name: 'Klar' }).click()
  await expect(page.getByRole('button', { name: 'Hjälp', exact: true })).toBeFocused()
})
