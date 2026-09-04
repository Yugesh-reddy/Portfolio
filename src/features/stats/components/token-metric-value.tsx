"use client"

import { CountUp } from "@/components/motion/count-up"

const COMPACT_NUMBER_FORMATTER = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
})

const USD_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
})

const FORMATTERS = {
  compact: COMPACT_NUMBER_FORMATTER.format,
  currency: USD_FORMATTER.format,
  number: (value: number) => Math.round(value).toLocaleString("en-US"),
}

export function TokenMetricValue({
  value,
  format = "number",
}: {
  value: number
  format?: keyof typeof FORMATTERS
}) {
  return <CountUp value={value} format={FORMATTERS[format]} />
}
