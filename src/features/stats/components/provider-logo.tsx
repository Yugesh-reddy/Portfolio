import { cn } from "@/lib/utils"

export function ProviderLogo({
  url,
  className,
}: {
  url: string
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("size-3.5 shrink-0 bg-current", className)}
      style={{
        WebkitMaskImage: `url(${url})`,
        WebkitMaskPosition: "center",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskImage: `url(${url})`,
        maskPosition: "center",
        maskRepeat: "no-repeat",
        maskSize: "contain",
      }}
    />
  )
}
