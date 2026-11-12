// FEAT-003 Förhandsvisning: FR-FHV-001..005, 007..010, NFR-PERF-001.
import { expect, test } from '@playwright/test'
import { fil } from './hjalp'

test('förhandsvisar en sida i taget och bläddrar med knappar, val i raden och tangenter', async ({ page }) => {
  await page.goto('/')
  // FR-FHV-010: förklaring när resultatet är tomt
  await expect(page.getByText('1 Läs in filer.')).toBeVisible()
  await page.locator('#filval').setInputFiles([fil('beslut.pdf'), fil('underskrift.pdf')])
  await expect(page.getByRole('status')).toContainText('underskrift.pdf inläst')
  await page.getByRole('button', { name: 'Lägg till alla sidor' }).first().click()

  const info = page.locator('.sidinfo')
  await expect(info).toHaveText('Sida 1 av 3 · ur beslut.pdf, sida 1') // FR-FHV-001, 003, 007
  await expect(page.getByRole('img', { name: 'Sida 1 av 3 ur beslut.pdf' })).toBeVisible()
  // Sidan är faktiskt ritad (inte tom canvas)
  await expect.poll(() => page.locator('.sidram canvas').evaluate((c: HTMLCanvasElement) => c.width)).toBeGreaterThan(100)

  await page.getByRole('button', { name: 'Nästa sida' }).click() // FR-FHV-002
  await expect(info).toHaveText('Sida 2 av 3 · ur beslut.pdf, sida 2')
  await page.getByRole('listitem', { name: /Sida 3 av 3 ur beslut\.pdf, plats 3/ }).click() // FR-FHV-004
  await expect(info).toHaveText('Sida 3 av 3 · ur beslut.pdf, sida 3')

  await page.locator('.forhandsvisning-yta').focus() // FR-FHV-009
  await page.keyboard.press('ArrowLeft')
  await expect(info).toHaveText('Sida 2 av 3 · ur beslut.pdf, sida 2')
  await page.keyboard.press('PageDown')
  await expect(info).toHaveText('Sida 3 av 3 · ur beslut.pdf, sida 3')

  // FR-FHV-005 och NFR-PERF-001: en ändring syns inom 1 sekund
  const start = Date.now()
  await page.getByRole('button', { name: 'Sida 1 av 1 ur underskrift.pdf' }).click()
  await page.getByRole('listitem', { name: /underskrift\.pdf, plats 4/ }).click()
  await expect(info).toHaveText('Sida 4 av 4 · ur underskrift.pdf, sida 1', { timeout: 1000 })
  expect(Date.now() - start).toBeLessThan(1000)

  // Den visade sidan tas bort: förhandsvisningen visar sidan som tog dess plats
  await page.getByRole('button', { name: 'Ta bort sida 1 ur underskrift.pdf från resultatet' }).click()
  await expect(info).toHaveText('Sida 3 av 3 · ur beslut.pdf, sida 3')

  // FR-FHV-008 (Should): zooma
  await page.getByRole('button', { name: 'Zooma in' }).click()
  await expect(page.getByRole('button', { name: 'Anpassa' })).toHaveAttribute('aria-pressed', 'false')
})
