// Temaval: mörkt är standard, ljust som val (FR-ALM-009).
// Enda stället i appen som använder webbläsarens lagring (regel R3); bara temat sparas.
export type Tema = 'mork' | 'ljus'
const NYCKEL = 'pdf-bagaren-tema'

export function lasTema(): Tema {
  try {
    return localStorage.getItem(NYCKEL) === 'ljus' ? 'ljus' : 'mork'
  } catch {
    return 'mork'
  }
}

export function sattTema(tema: Tema): void {
  if (tema === 'ljus') document.documentElement.setAttribute('data-theme', 'ljus')
  else document.documentElement.removeAttribute('data-theme')
  try {
    localStorage.setItem(NYCKEL, tema)
  } catch {
    /* Lagring avstängd: temat gäller bara den här visningen. */
  }
}
