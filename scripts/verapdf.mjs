// Validerar PDF-filer mot PDF/A-2b med veraPDF (ADR-005, NFR-COMP-004). Bara för tester; bakas aldrig in.
// Användning: node scripts/verapdf.mjs fil.pdf [...]. Hämtar veraPDF med Maven första gången.
// Skriver en rad per fil ("PASS fil 2b" eller "FAIL fil 2b") och avslutar med felkod om någon fil underkänns.
import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const katalog = new URL('../verktyg/verapdf/', import.meta.url).pathname
if (!existsSync(`${katalog}lib`)) {
  execFileSync('mvn', ['-q', '-B', 'dependency:copy-dependencies', '-DoutputDirectory=lib', '-DincludeScope=runtime'], { cwd: katalog, stdio: 'inherit' })
}
const filer = process.argv.slice(2)
// Java i miljöer utan UTF-8-locale hittar inte sökvägar med å, ä och ö, så filen kopieras till en ASCII-sökväg.
const arbete = mkdtempSync(join(tmpdir(), 'verapdf-'))
let fel = 0
for (const [i, f] of filer.entries()) {
  const kopia = join(arbete, `fil-${i}.pdf`)
  copyFileSync(f, kopia)
  let rad
  try {
    rad = execFileSync('java', ['-cp', `${katalog}lib/*`, 'org.verapdf.apps.GreenfieldCliWrapper', '--flavour', '2b', '--format', 'text', kopia], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch (e) {
    // veraPDF avslutar med felkod när filen inte godkänns; utskriften behövs ändå.
    rad = String(e.stdout ?? '').trim() || `FAIL ${kopia} (veraPDF kunde inte köras)`
  }
  const ut = rad.replace(kopia, f)
  if (!/^PASS/m.test(ut)) fel++
  console.log(ut)
}
process.exit(fel ? 1 : 0)
