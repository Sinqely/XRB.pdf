// Gemensamma hjälpfunktioner för e2e-testerna.
import { expect, type Page } from '@playwright/test'

export const fil = (n: string) => new URL(`../filer/${n}`, import.meta.url).pathname

/** Väljer "Lägg till alla sidor" för varje inläst dokument, i ordning. */
export async function laggTillAlla(page: Page) {
  const knappar = page.getByRole('button', { name: 'Lägg till alla sidor' })
  const n = await knappar.count()
  for (let i = 0; i < n; i++) await knappar.nth(i).click()
}

/**
 * Öppnar spara-dialogen, behåller eller anger filnamn, väljer format och väntar på nedladdningen.
 * Standard är vanlig PDF, eftersom flera testfiler medvetet har ej inbäddade typsnitt; arkivformatet
 * prövas i feat-009.spec.ts.
 */
export async function spara(page: Page, filnamn?: string, format: 'pdf' | 'pdfa' = 'pdf') {
  await page.getByRole('button', { name: 'Baka ihop och spara' }).click()
  const dialog = page.getByRole('dialog', { name: 'Baka ihop och spara' })
  await expect(dialog).toBeVisible()
  if (filnamn !== undefined) await dialog.getByLabel('Filnamn').fill(filnamn)
  await dialog.getByRole('radio', { name: format === 'pdf' ? /^Vanlig PDF/ : /^Arkivformat PDF\/A/ }).check()
  const nedladdning = page.waitForEvent('download')
  await dialog.getByRole('button', { name: 'Spara' }).click()
  const d = await nedladdning
  await expect(dialog).toBeHidden()
  return d
}

import { readFileSync } from 'node:fs'
import { PDFArray, PDFDocument, PDFName, type PDFRawStream, type PDFRef, type PDFPage } from '@cantoo/pdf-lib'

/** Sidans innehållsflöden som bytes, för jämförelse byte för byte (R8). */
export function innehall(sida: PDFPage): string {
  const c = sida.node.get(PDFName.of('Contents'))
  const refs = c instanceof PDFArray ? c.asArray() : [c]
  return refs.map((r) => Buffer.from((sida.doc.context.lookup(r as PDFRef) as PDFRawStream).getContents()).toString('base64')).join('|')
}

export async function lasPdf(sokvag: string) {
  return PDFDocument.load(readFileSync(sokvag))
}

/** Trycker Tab tills elementet med det namnet har fokus (bara tangentbord). */
export async function tabbaTill(page: Page, namn: string | RegExp, max = 80) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab')
    const aktiv = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null
      return el?.getAttribute('aria-label') ?? el?.textContent?.trim() ?? ''
    })
    if (typeof namn === 'string' ? aktiv === namn : namn.test(aktiv)) return
  }
  throw new Error(`Fick aldrig fokus på ${namn}`)
}
