// FEAT-005 Ångra, gör om och börja om: FR-ALM-001..004, UC-008.
import { expect, test } from '@playwright/test'
import { fil } from './hjalp'

test('ångra och gör om med knappar och kortkommandon, börja om med bekräftelse', async ({ page }) => {
  await page.goto('/')
  await page.locator('#filval').setInputFiles([fil('beslut.pdf'), fil('underskrift.pdf')])
  await expect(page.getByRole('status')).toContainText('underskrift.pdf inläst')
  await page.getByRole('button', { name: 'Lägg till alla sidor' }).first().click()
  const rad = page.locator('.resultatetikett')
  await expect(rad).toHaveCount(3)

  await page.getByRole('button', { name: 'Ta bort sida 2 ur beslut.pdf från resultatet' }).click()
  await expect(rad).toHaveCount(2)
  await page.getByRole('button', { name: 'Ångra' }).click()
  await expect(rad).toHaveCount(3)
  await expect(page.getByRole('status')).toHaveText('Ångrade: Sida 2 ur beslut.pdf borttagen ur resultatet.')
  await page.getByRole('button', { name: 'Gör om' }).click()
  await expect(rad).toHaveCount(2)

  // Kortkommandon (fokus utanför textfält)
  await page.locator('body').click({ position: { x: 5, y: 700 } })
  await page.keyboard.press('Control+Z')
  await expect(rad).toHaveCount(3)
  await page.keyboard.press('Control+Y')
  await expect(rad).toHaveCount(2)
  await page.keyboard.press('Control+Shift+Z') // inget mer att göra om
  await expect(rad).toHaveCount(2)

  // Ta bort en fil och ångra: filen och dess miniatyrer kommer tillbaka
  await page.getByRole('button', { name: 'Ta bort underskrift.pdf' }).click()
  await expect(page.locator('.dokumentnamn')).toHaveCount(1)
  await page.keyboard.press('Control+Z')
  await expect(page.getByRole('button', { name: 'Sida 1 av 1 ur underskrift.pdf' }).locator('img')).toBeVisible()

  // FR-ALM-004: osparat arbete ger fråga vid stängning
  const harFraga = await page.evaluate(() => {
    const e = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(e)
    return e.defaultPrevented
  })
  expect(harFraga).toBe(true)

  // FR-ALM-003: börja om, först avbryta, sedan bekräfta
  await page.getByRole('button', { name: 'Börja om' }).click()
  const dlg = page.getByRole('dialog', { name: 'Börja om?' })
  await expect(dlg).toBeVisible()
  await dlg.getByRole('button', { name: 'Avbryt' }).click()
  await expect(page.locator('.dokumentnamn')).toHaveCount(2)
  await page.getByRole('button', { name: 'Börja om' }).click()
  await dlg.getByRole('button', { name: 'Töm arbetsytan' }).click()
  await expect(page.locator('.dokumentnamn')).toHaveCount(0)
  await expect(page.getByRole('status')).toHaveText('Arbetsytan är tömd.')
  await expect(page.getByRole('button', { name: 'Ångra' })).toHaveAttribute('aria-disabled', 'true')
})
