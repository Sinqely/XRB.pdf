// NFR-PERF-003: ett resultat på 100 sidor med vattenstämpel och textetikett skapas inom 15 sekunder.
// Mäts här i Node, utan webbläsarens arbetstråd; samma kod körs i bygg-arbetstråden.
import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'
import { bakaIhop } from '../../src/bygg/export'
import { forval } from '../../src/karna/layout'

const las = (p: string) => new Uint8Array(readFileSync(new URL(p, import.meta.url)))

it('100 sidor med stämpel och etikett på under 15 sekunder (NFR-PERF-003)', async () => {
  const start = Date.now()
  const ut = await bakaIhop({
    dokument: { h: las('../filer/hundra-sidor.pdf') },
    sidor: Array.from({ length: 100 }, (_, i) => ({ dokumentId: 'h', sidindex: i, stampel: true, etikett: true })),
    stampel: { bild: las('../filer/stampel.png'), typ: 'png', pxBredd: 400, pxHojd: 200, breddMm: 40, opacitet: 50, placering: forval('nedre-hoger') },
    etikett: { text: 'Utkast – får ej spridas', storlekPt: 12, farg: '#000000', bakgrund: '#ffff00', placering: forval('sidhuvud'), typsnitt: las('../../src/resurser/typsnitt/etikett/carlito-400-normal.ttf') },
    format: 'pdf',
    datum: 0,
  })
  const tid = Date.now() - start
  expect(ut.length).toBeGreaterThan(0)
  expect(tid).toBeLessThan(15_000)
}, 30_000)
