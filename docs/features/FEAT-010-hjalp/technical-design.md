# Teknisk design: FEAT-010 – Startläge, hjälp och kortkommandon

> Implementerar: FR-ALM-005, FR-ALM-010 (Should), FR-DOK-001..003, FR-DOK-009 · Realiserar: UC-009 · Skärmar: SCR-APP-001, SCR-APP-008 Hjälp, SCR-APP-013 Kortkommandon
> Status: Byggd utan separat G4 (Ägarens beslut 2026-11-12) · Datum: 2026-11-12

## Design
- **Startläget** (fanns sedan skelettet): släppytan "Dra in PDF-filer här / eller välj filer" och de tre stegen i förhandsvisningen tills resultatet har en sida.
- **`src/ui/Hjalp.tsx`**: `HjalpDialog` (stor dialog) med ingress, de fyra stegen, steg-för-steg för DS-01 och DS-02 och tabellen med kortkommandon; `KortkommandoDialog`; `Hjalpknapp`. All text ligger i `texter.hjalpAvsnitt`, `texter.hjalpFall` och `texter.kortkommandoGrupper`.
- **Hjälp vid varje steg (FR-DOK-001):** en hjälpknapp i rubriken för kolumnerna Filer, Resultat och Märkning öppnar hjälpen med fokus på avsnittet. Panelerna och spara-dialogen har dessutom korta hjälptexter vid fälten. Fokus går tillbaka till knappen när hjälpen stängs.
- **Sidhuvudet:** knappen Hjälp. **?** utanför textfält och dialoger öppnar kortkommandona (FR-ALM-010); de kan också öppnas från hjälpen.
- Rullbara ytor i dialogerna går att nå med tangentbordet (WCAG 2.1.1).

## Acceptanskriterier
`tests/e2e/feat-010.spec.ts`: startläget med ytan och de tre stegen; hjälpen har alla avsnitt, vardagsfallen och kortkommandona, axe utan fel, Esc och fokus tillbaka; hjälpknapparna öppnar rätt avsnitt; ? visar kortkommandona, också från hjälpen.
