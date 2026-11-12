// Läser in en bild för vattenstämpeln (FR-STA-001, FR-STA-011). Bilden avkodas i webbläsaren för att få
// storleken och upptäcka skadade filer; inget lämnar datorn. JPEG i CMYK ritas om till PNG i RGB,
// eftersom PDF/A-2b inte tillåter CMYK utan färgprofil och stämpeln är appens eget objekt (inte sidans innehåll).
import { texter } from '../karna/texter'
import type { Stampelbild } from '../karna/markning'
import { bildkontroll, bildtyp, jpegKomponenter } from '../karna/validering'

export type Bildutfall = { ok: true; bild: Stampelbild } | { ok: false; meddelande: string }

export async function lasBild(fil: File): Promise<Bildutfall> {
  const borjan = new Uint8Array(await fil.slice(0, 16).arrayBuffer())
  const fel = bildkontroll(fil.size, borjan)
  if (fel === 'fel-typ') return { ok: false, meddelande: texter.bildFelTyp(fil.name) }
  if (fel === 'for-stor') return { ok: false, meddelande: texter.bildForStor(fil.name) }
  let bytes = new Uint8Array(await fil.arrayBuffer())
  let typ = bildtyp(borjan)!
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(new Blob([bytes as BlobPart], { type: `image/${typ}` }))
  } catch {
    return { ok: false, meddelande: texter.bildSkadad(fil.name) }
  }
  try {
    if (bitmap.width < 1 || bitmap.height < 1) return { ok: false, meddelande: texter.bildSkadad(fil.name) }
    if (typ === 'jpeg' && jpegKomponenter(bytes) === 4) {
      const c = document.createElement('canvas')
      c.width = bitmap.width
      c.height = bitmap.height
      c.getContext('2d')!.drawImage(bitmap, 0, 0)
      const blob = await new Promise<Blob | null>((ok) => c.toBlob(ok, 'image/png'))
      if (!blob) return { ok: false, meddelande: texter.bildSkadad(fil.name) }
      bytes = new Uint8Array(await blob.arrayBuffer())
      typ = 'png'
    }
    return { ok: true, bild: { namn: fil.name, bild: bytes, typ, pxBredd: bitmap.width, pxHojd: bitmap.height } }
  } finally {
    bitmap.close()
  }
}
