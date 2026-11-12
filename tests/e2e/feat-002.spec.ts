// FEAT-002 Felbesked: FR-FIL-006..008, FR-FIL-010, FR-FIL-011, FR-FIL-013. Fel rör bara den egna filen.
import { expect, test } from '@playwright/test'
import { fil } from './hjalp'

test('avvisar fel filer med begripliga meddelanden och behåller övriga', async ({ page }) => {
  await page.goto('/')
  await page.locator('#filval').setInputFiles([fil('beslut.pdf'), fil('inte-pdf.pdf'), fil('losenord.pdf'), fil('skadad.pdf'), fil('underskrift.pdf')])
  await expect(page.getByRole('status')).toHaveText('underskrift.pdf inläst, 1 sida.')
  const fel = page.getByRole('alert')
  await expect(fel).toHaveCount(3)
  await expect(fel.nth(0)).toContainText('inte-pdf.pdf är ingen PDF-fil')
  await expect(fel.nth(1)).toContainText('losenord.pdf är lösenordsskyddad')
  await expect(fel.nth(2)).toContainText('skadad.pdf är skadad')
  await expect(page.locator('.dokumentnamn')).toHaveText(['beslut.pdf', 'underskrift.pdf'])
  // Meddelandet kan stängas
  await fel.nth(0).getByRole('button', { name: 'Stäng meddelandet' }).click()
  await expect(page.getByRole('alert')).toHaveCount(2)
})

test('avvisar en fil som skulle ge fler än 500 sidor (FR-FIL-010)', async ({ page }) => {
  await page.goto('/')
  for (let i = 0; i < 5; i++) await page.locator('#filval').setInputFiles(fil('hundra-sidor.pdf'))
  await expect(page.locator('.dokumentnamn')).toHaveCount(5)
  await page.locator('#filval').setInputFiles(fil('underskrift.pdf'))
  await expect(page.getByRole('alert')).toContainText('fler än 500 sidor. Arbetsytan har redan 500 sidor.')
  await expect(page.locator('.dokumentnamn')).toHaveCount(5)
})
