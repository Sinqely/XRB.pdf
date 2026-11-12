# Teknisk design: FEAT-004 – Vrida sidor, visa en sida stort och lägga till en sida två gånger

> Implementerar: FR-SID-010 (Should), FR-SID-012 (Should), FR-SID-013 (Could) · Realiserar: UC-002 · Skärmar: SCR-APP-001, SCR-APP-007
> Status: Byggd utan separat G4 (Ägarens beslut 2026-11-12) · Datum: 2026-11-12

## Design
- **Kärnan** (`arbetsyta.ts`): `vridSida(yta, id, ±1)` ändrar resultatsidans `vridning` i steg om 90 grader; `laggTillIgen(yta, id)` lägger en ny förekomst direkt efter, med samma vridning. Båda är ångra-steg med meddelande till statusytan.
- **Export**: vridningen sätts i sidans `/Rotate` (fanns sedan FEAT-001); innehållet rörs inte (BG-009). Stämpel och etikett placeras i den visade riktningen.
- **Gränssnittet**: under förhandsvisningen finns knapparna Vrid åt vänster, Vrid åt höger, Visa stort och Lägg till en gång till för den visade sidan. På en resultatsida vrider R åt höger och Skift+R åt vänster. Miniatyren i resultatraden visas vriden. Varje miniatyr i Filer har en förstoringsknapp.
- **Stor visning SCR-APP-007** (`StorVisning.tsx`): stor dialog med sidan ritad så stor som fönstret tillåter (högst 840 px bred, 75 % av höjden). Stängs med knappen eller Esc; fokus tillbaka.

## Acceptanskriterier
`tests/enhet/arbetsyta.test.ts` (vrida runt varvet, lägga till igen); `tests/e2e/feat-004.spec.ts`: vrida med knapp och Skift+R, liggande förhandsvisning, `/Rotate` 90 och 270 i filen med orörda innehållsflöden; stor visning från miniatyr och förhandsvisning med axe utan fel; en sida två gånger i filen.
