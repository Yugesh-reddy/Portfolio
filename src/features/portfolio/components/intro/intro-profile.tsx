"use client"

import { useEffect, useRef, type CSSProperties } from "react"

import { cn } from "@/lib/utils"
import { ProfileHeader } from "@/features/portfolio/components/profile-header"
import { USER } from "@/features/portfolio/data/user"
import {
  getIntroTimeline,
  getMorphTransform,
} from "@/features/portfolio/lib/home-intro-session"

import {
  CURTAIN_DELAY_MS,
  CURTAIN_DURATION_MS,
  CURTAIN_EASING,
  FIRST_GREETING_HOLD_MS,
  GREETING_EASING,
  GREETING_FADE_MS,
  GREETING_HOLD_MS,
  GREETINGS,
  IDENTITY_AVATAR_SIZE,
  IDENTITY_FADE_MS,
  IDENTITY_HOLD_MS,
  PROFILE_LAYOUT_DURATION_MS,
  PROFILE_LAYOUT_EASING,
  PROFILE_NAME_CLASS,
} from "./intro-shared"
import styles from "./intro.module.css"

const timeline = getIntroTimeline(
  GREETINGS.length,
  FIRST_GREETING_HOLD_MS,
  GREETING_HOLD_MS,
  GREETING_FADE_MS
)

const splashVars = {
  "--greeting-fade": `${GREETING_FADE_MS}ms`,
  "--identity-fade": `${IDENTITY_FADE_MS}ms`,
  "--greeting-easing": GREETING_EASING,
} as CSSProperties

export function IntroProfile() {
  const rootRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const identityRef = useRef<HTMLDivElement>(null)
  const imRef = useRef<HTMLSpanElement>(null)
  const avatarRef = useRef<HTMLSpanElement>(null)
  const nameRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const html = document.documentElement
    const running: Animation[] = []
    let cancelled = false
    let timer = 0
    let frame = 0

    const finish = () => {
      html.dataset.homeIntro = "done"
      for (const animation of running) animation.cancel()
    }

    const morph = () => {
      if (cancelled || html.dataset.homeIntro !== "play") return

      const avatar = avatarRef.current
      const name = nameRef.current
      const backdrop = backdropRef.current
      const targetAvatar = rootRef.current?.querySelector<HTMLElement>(
        '[data-intro-target="avatar"]'
      )
      const targetName = rootRef.current?.querySelector<HTMLElement>(
        '[data-intro-target="name"]'
      )
      if (!avatar || !name || !backdrop || !targetAvatar || !targetName) {
        finish()
        return
      }

      const avatarFrom = avatar.getBoundingClientRect()
      const avatarTo = targetAvatar.getBoundingClientRect()
      const avatarMove = getMorphTransform(avatarFrom, avatarTo, true)
      const nameMove = getMorphTransform(
        name.getBoundingClientRect(),
        targetName.getBoundingClientRect(),
        true
      )

      // Draw the avatar at its header size and shrink it to the splash size, so
      // it stays sharp as it grows instead of stretching a small bitmap. The
      // negative margin keeps the identity line's layout as it was.
      const size = avatarTo.width
      const inset = (size - avatarFrom.width) / 2
      avatar.style.width = `${size}px`
      avatar.style.height = `${size}px`
      avatar.style.margin = `${-inset}px`

      const move = {
        duration: PROFILE_LAYOUT_DURATION_MS,
        easing: PROFILE_LAYOUT_EASING,
        fill: "forwards",
      } as const
      const avatarAnimation = avatar.animate(
        [
          { transform: `scale(${1 / avatarMove.scale})` },
          {
            transform: `translate(${avatarMove.translateX}px, ${avatarMove.translateY}px)`,
          },
        ],
        move
      )
      const nameAnimation = name.animate(
        [
          { transform: "none" },
          {
            transform: `translate(${nameMove.translateX}px, ${nameMove.translateY}px) scale(${nameMove.scale})`,
          },
        ],
        move
      )
      const curtainAnimation = backdrop.animate(
        [{ transform: "none" }, { transform: "translateY(-100%)" }],
        {
          delay: CURTAIN_DELAY_MS,
          duration: CURTAIN_DURATION_MS,
          easing: CURTAIN_EASING,
          fill: "forwards",
        }
      )
      running.push(avatarAnimation, nameAnimation, curtainAnimation)
      if (imRef.current) {
        running.push(
          imRef.current.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: 160,
            easing: "ease-out",
            fill: "forwards",
          })
        )
      }
      html.dataset.homeIntro = "morph"

      const landed = Promise.all([
        avatarAnimation.finished,
        nameAnimation.finished,
      ])
      landed
        .then(() => {
          if (!cancelled) html.dataset.homeIntro = "landed"
        })
        .catch(() => undefined)
      Promise.all([landed, curtainAnimation.finished])
        .then(() => {
          if (!cancelled) finish()
        })
        .catch(() => undefined)
    }

    // Morph once the identity line has faded in and held, timed from its own
    // CSS animation, so a slow hydration only lengthens the hold.
    const scheduleMorph = async () => {
      let shownAtMs = timeline.identityMs + IDENTITY_FADE_MS
      const fadeIn = identityRef.current?.getAnimations()[0]
      if (fadeIn) {
        await fadeIn.ready.catch(() => undefined)
        const endMs = fadeIn.effect?.getComputedTiming().endTime
        if (fadeIn.startTime !== null && typeof endMs === "number") {
          shownAtMs = Number(fadeIn.startTime) + endMs
        }
      }
      if (cancelled) return

      const nowMs = Number(document.timeline.currentTime ?? performance.now())
      timer = window.setTimeout(
        () => {
          frame = window.requestAnimationFrame(morph)
        },
        Math.max(0, shownAtMs + IDENTITY_HOLD_MS - nowMs)
      )
    }

    if (html.dataset.homeIntro === "play") void scheduleMorph()

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div ref={rootRef}>
      <div className={styles.splash} style={splashVars} aria-hidden="true">
        <div ref={backdropRef} className={styles.backdrop} />

        <p className={styles.greetings}>
          {GREETINGS.map((greeting, index) => (
            <span
              key={greeting}
              className={cn(
                styles.greeting,
                "text-2xl leading-snug font-semibold tracking-tight"
              )}
              style={
                {
                  "--in": `${timeline.greetings[index].inMs}ms`,
                  "--out": `${timeline.greetings[index].outMs}ms`,
                } as CSSProperties
              }
            >
              <span className="size-1.5 rounded-full bg-current" />
              {greeting}
            </span>
          ))}
        </p>

        <div
          ref={identityRef}
          className={styles.identity}
          style={{ "--in": `${timeline.identityMs}ms` } as CSSProperties}
        >
          <span ref={imRef} className="text-2xl leading-snug font-medium">
            I&apos;m
          </span>
          <span
            ref={avatarRef}
            className={styles.avatar}
            style={{
              width: IDENTITY_AVATAR_SIZE,
              height: IDENTITY_AVATAR_SIZE,
            }}
          >
            {/* The same small image the header shows, so it's already decoded. */}
            <img
              src={USER.avatarVariants.lightOff}
              alt=""
              fetchPriority="high"
              className="size-full object-cover"
            />
          </span>
          <span
            ref={nameRef}
            className={cn(PROFILE_NAME_CLASS, "inline-block")}
          >
            {USER.firstName}
          </span>
        </div>
      </div>

      <ProfileHeader intro />
    </div>
  )
}
