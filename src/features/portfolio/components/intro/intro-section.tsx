"use client"

import { useLayoutEffect, useState } from "react"

import {
  readHomeIntroStorage,
  resolveHomeIntroMode,
  writeHomeIntroStorage,
  type IntroMode,
} from "@/features/portfolio/lib/home-intro-session"

import { IntroProfile } from "./intro-profile"

let hasHomeIntroStarted = false

export function IntroSection() {
  const [introMode, setIntroMode] = useState<IntroMode>(
    hasHomeIntroStarted ? "skip" : "pending"
  )

  useLayoutEffect(() => {
    const storageValue = readHomeIntroStorage((key) =>
      window.sessionStorage.getItem(key)
    )
    hasHomeIntroStarted ||= storageValue === "true"

    if (resolveHomeIntroMode(hasHomeIntroStarted, storageValue) === "skip") {
      hasHomeIntroStarted = true
      setIntroMode("skip")
      return
    }

    hasHomeIntroStarted = true
    writeHomeIntroStorage((key, value) => {
      window.sessionStorage.setItem(key, value)
    })
    setIntroMode("play")
  }, [])

  return <IntroProfile mode={introMode} />
}
