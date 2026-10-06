"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"

import { Skeleton } from "@/components/ui/skeleton"

import type { TokensChartPoint } from "./tokens-chart"

const TokensChart = dynamic(
  () => import("./tokens-chart").then((mod) => mod.TokensChart),
  {
    ssr: false,
    loading: () => <Skeleton className="aspect-2/1 w-full rounded-lg" />,
  }
)

export function LazyTokensChart({ data }: { data: TokensChartPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    const node = containerRef.current
    if (!node || shouldRender) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setShouldRender(true)
        observer.disconnect()
      },
      { rootMargin: "400px 0px" }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [shouldRender])

  return (
    <div ref={containerRef}>
      {shouldRender ? (
        <TokensChart data={data} />
      ) : (
        <Skeleton className="aspect-2/1 w-full rounded-lg" />
      )}
    </div>
  )
}
