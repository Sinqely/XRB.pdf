// En egen, minimal sRGB-färgprofil (ICC v2, klass mntr) för PDF/A-filens OutputIntent (ADR-005).
// Skapas här i stället för att bakas in som fil; värdena följer IEC 61966-2-1 med primärer anpassade till D50 (Bradford).

function s15f16(v: number): number {
  return Math.round(v * 65536) | 0
}

class Skrivare {
  private b: number[] = []
  u8(v: number) { this.b.push(v & 0xff) }
  u16(v: number) { this.u8(v >>> 8); this.u8(v) }
  u32(v: number) { this.u16((v >>> 16) & 0xffff); this.u16(v & 0xffff) }
  s32(v: number) { this.u32(v >>> 0) }
  sig(s: string) { for (const c of s) this.u8(c.charCodeAt(0)) }
  noll(n: number) { for (let i = 0; i < n; i++) this.u8(0) }
  linje() { while (this.b.length % 4) this.u8(0) }
  get langd() { return this.b.length }
  bytes() { return Uint8Array.from(this.b) }
}

function xyz(x: number, y: number, z: number): Uint8Array {
  const w = new Skrivare()
  w.sig('XYZ ')
  w.noll(4)
  w.s32(s15f16(x))
  w.s32(s15f16(y))
  w.s32(s15f16(z))
  return w.bytes()
}

function text(s: string): Uint8Array {
  const w = new Skrivare()
  w.sig('text')
  w.noll(4)
  w.sig(s)
  w.u8(0)
  return w.bytes()
}

function beskrivning(s: string): Uint8Array {
  const w = new Skrivare()
  w.sig('desc')
  w.noll(4)
  w.u32(s.length + 1)
  w.sig(s)
  w.u8(0)
  w.noll(4) // unicode language code
  w.noll(4) // unicode count
  w.noll(2) // scriptcode code
  w.u8(0) // scriptcode count
  w.noll(67)
  return w.bytes()
}

function kurva(n = 1024): Uint8Array {
  const w = new Skrivare()
  w.sig('curv')
  w.noll(4)
  w.u32(n)
  for (let i = 0; i < n; i++) {
    const v = i / (n - 1)
    const lin = v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    w.u16(Math.round(lin * 65535))
  }
  return w.bytes()
}

let cache: Uint8Array | null = null

export function srgbProfil(): Uint8Array {
  if (cache) return cache
  const trc = kurva()
  const taggar: [string, Uint8Array][] = [
    ['desc', beskrivning('sRGB (PDF-bagaren)')],
    ['cprt', text('Ingen upphovsrätt, fri att använda (CC0).')],
    ['wtpt', xyz(0.9642, 1.0, 0.8249)],
    ['rXYZ', xyz(0.4360747, 0.2225045, 0.0139322)],
    ['gXYZ', xyz(0.3850649, 0.7168786, 0.0971045)],
    ['bXYZ', xyz(0.1430804, 0.0606169, 0.7141733)],
    ['rTRC', trc],
    ['gTRC', trc],
    ['bTRC', trc],
  ]
  // Lägg ut taggdata; samma kurva delas av de tre TRC-taggarna.
  const tabellSlut = 128 + 4 + taggar.length * 12
  const data = new Skrivare()
  const plats = new Map<Uint8Array, number>()
  const poster: [string, number, number][] = []
  for (const [sig, d] of taggar) {
    if (!plats.has(d)) {
      plats.set(d, tabellSlut + data.langd)
      for (const x of d) data.u8(x)
      data.linje()
    }
    poster.push([sig, plats.get(d)!, d.length])
  }
  const storlek = tabellSlut + data.langd
  const w = new Skrivare()
  w.u32(storlek)
  w.noll(4) // CMM
  w.u32(0x02100000) // version 2.1
  w.sig('mntr')
  w.sig('RGB ')
  w.sig('XYZ ')
  for (const v of [2026, 1, 1, 0, 0, 0]) w.u16(v)
  w.sig('acsp')
  w.noll(4) // plattform
  w.noll(4) // flaggor
  w.noll(4) // tillverkare
  w.noll(4) // modell
  w.noll(8) // attribut
  w.u32(0) // återgivningsavsikt: perceptuell
  w.s32(s15f16(0.9642))
  w.s32(s15f16(1.0))
  w.s32(s15f16(0.8249))
  w.noll(4) // skapare
  w.noll(16) // profil-id
  w.noll(28)
  w.u32(poster.length)
  for (const [sig, off, len] of poster) {
    w.sig(sig)
    w.u32(off)
    w.u32(len)
  }
  const ut = new Uint8Array(storlek)
  ut.set(w.bytes(), 0)
  ut.set(data.bytes(), tabellSlut)
  cache = ut
  return ut
}
