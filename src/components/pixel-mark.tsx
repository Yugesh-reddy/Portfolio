import {
  YS_PIXEL_PATH,
  YS_PIXEL_VIEWBOX,
} from "@/features/portfolio/data/ys-pixel-mark"

export function PixelMark(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox={YS_PIXEL_VIEWBOX}
      aria-hidden
      {...props}
    >
      <path
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={20}
        d={YS_PIXEL_PATH}
      />
    </svg>
  )
}

export function getMarkSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="${YS_PIXEL_VIEWBOX}"><path fill="currentColor" stroke="currentColor" stroke-width="20" d="${YS_PIXEL_PATH}"/></svg>`
}
