// Pixel "YS" rects on a shared 64-unit cell grid — source of truth for both
// the flat nav mark (`pixel-mark.tsx`) and the isometric hero generator.
export const YS_PIXEL_CELL = 64

export const YS_PIXEL_RECTS = [
  [0, 0, 64, 128],
  [256, 0, 64, 128],
  [64, 128, 64, 64],
  [192, 128, 64, 64],
  [128, 192, 64, 256],
  [448, 0, 192, 64],
  [384, 64, 64, 128],
  [640, 64, 64, 64],
  [448, 192, 192, 64],
  [640, 256, 64, 128],
  [384, 320, 64, 64],
  [448, 384, 192, 64],
] as const

export const YS_PIXEL_PATH = YS_PIXEL_RECTS.map(
  ([x, y, w, h]) => `M${x} ${y}h${w}v${h}H${x}z`
).join("")

export const YS_PIXEL_VIEWBOX = "-13 -13 730 474" as const
