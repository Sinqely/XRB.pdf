// Ikoner efter Lucide (ISC), inbakade som SVG (docs/design.md; licens i src/resurser/ikoner/LICENS-lucide.txt).
const banor = {
  taBort: ['M3 6h18', 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6', 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2', 'M10 11v6', 'M14 11v6'],
  vanster: ['m15 18-6-6 6-6'],
  hoger: ['m9 18 6-6-6-6'],
  kryss: ['M18 6 6 18', 'm6 6 12 12'],
  plus: ['M5 12h14', 'M12 5v14'],
  minus: ['M5 12h14'],
  vrid: ['M21 12a9 9 0 1 1-9-9c2.5 0 4.9 1 6.7 2.7L21 8', 'M21 3v5h-5'],
  vridVanster: ['M3 12a9 9 0 1 0 9-9 9.8 9.8 0 0 0-6.7 2.7L3 8', 'M3 3v5h5'],
  forstora: ['M15 3h6v6', 'M9 21H3v-6', 'M21 3l-7 7', 'M3 21l7-7'],
  bild: ['M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z', 'M9 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z', 'm21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21'],
  varning: ['m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3Z', 'M12 9v4', 'M12 17h.01'],
  info: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 16v-4', 'M12 8h.01'],
  angra: ['M9 14 4 9l5-5', 'M4 9h10.5a5.5 5.5 0 0 1 0 11H11'],
  gorOm: ['m15 14 5-5-5-5', 'M20 9H9.5a5.5 5.5 0 0 0 0 11H13'],
  borjaOm: ['M3 12a9 9 0 1 0 9-9 9.8 9.8 0 0 0-6.7 2.7L3 8', 'M3 3v5h5'],
  hjalp: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3', 'M12 17h.01'],
  skold: ['M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.7 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.5 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1Z'],
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
