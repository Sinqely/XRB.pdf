# Teknisk design: FEAT-005 – Ångra, gör om och börja om

> Implementerar: FR-ALM-001..004 · Realiserar: UC-008 · Skärmar: SCR-APP-001 (sidhuvudet), SCR-APP-012 Bekräfta börja om
> Status: Byggd utan separat G4 (Ägarens beslut 2026-11-12) · Datum: 2026-11-12

## Design
- **`tillstand.ts`**: versioner med plats-pekare; `andra(fn, meddelande)` lägger en version och tar bort gör om-grenen; `angra`/`gorOm` flyttar pekaren och ger ändringens meddelande ("Ångrade: Sida 2 ur Beslut.pdf borttagen ur resultatet."); `ersatt` ändrar utan eget steg (sparat filnamn); `borjaOm` tömmer arbetsytan och historiken; högst 200 versioner.
- Allt som ändrar arbetsytan går genom `andra`: sidval, ordning, vridning, stämpel, etikett, placering och dold information (FR-ALM-001). Aktiv sida i förhandsvisningen är inte ett ångra-steg.
- **Resurser och ångra:** ett borttaget dokument behåller sitt pdf.js-dokument och sina miniatyrer så länge det finns i någon version, så att ångra visar det direkt; `dokumentregister.stada` frigör resten efter varje ändring.
- **Kortkommandon:** Ctrl/Cmd+Z ångra, Ctrl+Y eller Cmd+Skift+Z gör om; inte i textfält och dialoger, där webbläsarens egen ångra gäller. Knapparna Ångra, Gör om och Börja om i sidhuvudet, inaktiva med `aria-disabled` när de inte kan användas.
- **Börja om:** bekräftelsedialog (`Bekrafta.tsx`) med fokus på Avbryt; "Töm arbetsytan" är en `farlig-atgard` utan röd färg (design.md).
- **Osparat arbete (FR-ALM-004):** `beforeunload` är aktivt när arbetsytan har filer och skiljer sig från den senast sparade versionen.

## Acceptanskriterier
`tests/enhet/tillstand.test.ts` (ångra, gör om, gren, ersätt, börja om) och `tests/e2e/feat-005.spec.ts` (knappar, kortkommandon, ångra borttagen fil med miniatyrer, fråga vid stängning, börja om med avbryt och bekräfta).
