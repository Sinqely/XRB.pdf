// Ikoner efter Lucide (ISC), inbakade som SVG (docs/design.md; licens i src/resurser/ikoner/LICENS-lucide.txt).
const banor = {
  taBort: ['M3 6h18', 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6', 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2', 'M10 11v6', 'M14 11v6'],
  vanster: ['m15 18-6-6 6-6'],
  hoger: ['m9 18 6-6-6-6'],
  kryss: ['M18 6 6 18', 'm6 6 12 12'],
  plus: ['M5 12h14', 'M12 5v14'],
  bock: ['M20 6 9 17l-5-5'],
  ladda: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm7 10 5 5 5-5', 'M12 15V3'],
  moln: ['M12 13v8', 'm8 17 4-4 4 4', 'M4.4 15A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2'],
  sol: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z', 'M12 2v2', 'M12 20v2', 'm4.9 4.9 1.4 1.4', 'm17.7 17.7 1.4 1.4', 'M2 12h2', 'M20 12h2', 'm6.3 17.7-1.4 1.4', 'm19.1 4.9-1.4 1.4'],
  mane: ['M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z'],
  fil: ['M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z', 'M14 2v4a2 2 0 0 0 2 2h4', 'M9 15h6', 'M12 12v6'],
} as const

export type Ikonnamn = keyof typeof banor

export function Ikon({ namn, storlek = 20 }: { namn: Ikonnamn; storlek?: number }) {
  return (
    <svg class="ikon" width={storlek} height={storlek} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {banor[namn].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}
