"use client"

import { useEffect, useRef, useState } from "react"

/** Poll only while the tile is visible, with bounded requests and full cleanup. */
export function useVisibleResource<T>(url: string, intervalMs: number) {
  const ref = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<T | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let visible = false
    let disposed = false
    let pending: AbortController | undefined
    const refresh = async () => {
      if (!visible || document.hidden || pending) return
      const controller = new AbortController()
      pending = controller
      const timeout = setTimeout(() => controller.abort(), 12_000)
      try {
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) throw new Error("Unavailable")
        const next = (await response.json()) as T
        if (!disposed) {
          setData(next)
          setFailed(false)
        }
      } catch {
        if (!disposed) {
          setData(null)
          setFailed(true)
        }
      } finally {
        clearTimeout(timeout)
        pending = undefined
      }
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) void refresh()
    })
    if (ref.current) observer.observe(ref.current)
    const timer = setInterval(() => void refresh(), intervalMs)
    document.addEventListener("visibilitychange", refresh)
    return () => {
      disposed = true
      pending?.abort()
      observer.disconnect()
      clearInterval(timer)
      document.removeEventListener("visibilitychange", refresh)
    }
  }, [url, intervalMs])
  return { ref, data, failed }
}
