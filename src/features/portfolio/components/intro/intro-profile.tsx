"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"

import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll"
import { ProfileHeader } from "@/features/portfolio/components/profile-header"
import { USER } from "@/features/portfolio/data/user"
import {
  getIntroPresentationState,
  getIntroScheduleMs,
  getMorphTransform,
  type IntroMode,
  type IntroPhase,
} from "@/features/portfolio/lib/home-intro-session"

import {
  CURTAIN_DELAY_MS,
  CURTAIN_DURATION_MS,
  CURTAIN_EASING,
  GREETING_DURATION_MS,
  GREETINGS,
  IDENTITY_AVATAR_SIZE,
  IDENTITY_HOLD_MS,
  PROFILE_LAYOUT_DURATION_MS,
  PROFILE_LAYOUT_EASING,
  PROFILE_NAME_CLASS,
} from "./intro-shared"

export function IntroProfile({ mode }: { mode: IntroMode }) {
  const shouldReduceMotion = useReducedMotion()
  const [phase, setPhase] = useState<IntroPhase>("greetings")
  const [greetingIndex, setGreetingIndex] = useState(0)
  const [hasMorphFinished, setHasMorphFinished] = useState(false)
  const [isIntroComplete, setIsIntroComplete] = useState(false)
  const sourceAvatarRef = useRef<HTMLDivElement>(null)
  const sourceNameRef = useRef<HTMLSpanElement>(null)
  const targetAvatarRef = useRef<HTMLDivElement>(null)
  const targetNameRef = useRef<HTMLSpanElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const reduceMotion = shouldReduceMotion === true
  const shouldPlayIntro = mode === "play" && !reduceMotion
  const presentation = getIntroPresentationState(
    mode,
    phase,
    hasMorphFinished,
    isIntroComplete,
    reduceMotion
  )

  useLockBodyScroll(presentation.shouldLockScroll)

  useEffect(() => {
    if (!shouldPlayIntro) {
      return
    }

    const schedule = getIntroScheduleMs(
      GREETINGS.length,
      GREETING_DURATION_MS,
      IDENTITY_HOLD_MS
    )
    const timers = [
      ...schedule.greetingSwitchAtMs.map((atMs, index) =>
        window.setTimeout(() => setGreetingIndex(index + 1), atMs)
      ),
      window.setTimeout(() => setPhase("identity"), schedule.identityAtMs),
      window.setTimeout(() => setPhase("morphing"), schedule.profileAtMs),
    ]

    return () => {
      for (const timer of timers) {
        window.clearTimeout(timer)
      }
    }
  }, [shouldPlayIntro])

  useLayoutEffect(() => {
    if (!shouldPlayIntro || phase !== "morphing") {
      return
    }

    const sourceAvatar = sourceAvatarRef.current
    const sourceName = sourceNameRef.current
    const targetAvatar = targetAvatarRef.current
    const targetName = targetNameRef.current
    const backdrop = backdropRef.current

    if (
      !sourceAvatar ||
      !sourceName ||
      !targetAvatar ||
      !targetName ||
      !backdrop
    ) {
      queueMicrotask(() => {
        setHasMorphFinished(true)
        setIsIntroComplete(true)
      })
      return
    }

    const avatarTransform = getMorphTransform(
      sourceAvatar.getBoundingClientRect(),
      targetAvatar.getBoundingClientRect(),
      true
    )
    const nameTransform = getMorphTransform(
      sourceName.getBoundingClientRect(),
      targetName.getBoundingClientRect(),
      false
    )
    let avatarAnimation: Animation
    let nameAnimation: Animation
    let curtainAnimation: Animation

    try {
      avatarAnimation = sourceAvatar.animate(
        [
          { transform: "translate3d(0, 0, 0) scale(1)" },
          {
            transform: `translate3d(${avatarTransform.translateX}px, ${avatarTransform.translateY}px, 0) scale(${avatarTransform.scale})`,
          },
        ],
        {
          duration: PROFILE_LAYOUT_DURATION_MS,
          easing: PROFILE_LAYOUT_EASING,
          fill: "forwards",
        }
      )
      nameAnimation = sourceName.animate(
        [
          { transform: "translate3d(0, 0, 0)" },
          {
            transform: `translate3d(${nameTransform.translateX}px, ${nameTransform.translateY}px, 0)`,
          },
        ],
        {
          duration: PROFILE_LAYOUT_DURATION_MS,
          easing: PROFILE_LAYOUT_EASING,
          fill: "forwards",
        }
      )
      curtainAnimation = backdrop.animate(
        [
          { transform: "translate3d(0, 0, 0)" },
          { transform: "translate3d(0, -100%, 0)" },
        ],
        {
          delay: CURTAIN_DELAY_MS,
          duration: CURTAIN_DURATION_MS,
          easing: CURTAIN_EASING,
          fill: "forwards",
        }
      )
    } catch {
      queueMicrotask(() => {
        setHasMorphFinished(true)
        setIsIntroComplete(true)
      })
      return
    }

    let isCancelled = false

    void Promise.all([avatarAnimation.finished, nameAnimation.finished])
      .then(() => {
        if (!isCancelled) {
          setHasMorphFinished(true)
        }
      })
      .catch(() => undefined)

    void curtainAnimation.finished
      .then(() => {
        if (!isCancelled) {
          setIsIntroComplete(true)
        }
      })
      .catch(() => undefined)

    return () => {
      isCancelled = true
      avatarAnimation.cancel()
      nameAnimation.cancel()
      curtainAnimation.cancel()
    }
  }, [phase, shouldPlayIntro])

  return (
    <div>
      {mode === "pending" ? (
        <div
          data-intro-pending=""
          aria-hidden="true"
          className="pointer-events-auto fixed -inset-1 z-[62] touch-none bg-background"
        />
      ) : null}

      {shouldPlayIntro && phase !== "morphing" ? (
        <img
          src={USER.avatar}
          alt=""
          width={IDENTITY_AVATAR_SIZE}
          height={IDENTITY_AVATAR_SIZE}
          aria-hidden="true"
          className="pointer-events-none fixed size-px opacity-0"
        />
      ) : null}

      {presentation.showBackdrop ? (
        <div
          ref={backdropRef}
          data-intro-backdrop=""
          aria-hidden="true"
          className="pointer-events-auto fixed -inset-1 z-[60] touch-none bg-background will-change-transform"
        />
      ) : null}

      {presentation.showGreeting ? (
        <p
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[61] flex items-center justify-center gap-1.5 text-2xl leading-snug font-semibold tracking-tight text-foreground"
        >
          <span className="size-1.5 rounded-full bg-current" />
          <span>{GREETINGS[greetingIndex]}</span>
        </p>
      ) : null}

      {presentation.showIdentity ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[61] flex items-center justify-center gap-2 text-foreground"
        >
          <span
            className={
              phase === "morphing"
                ? "invisible text-2xl leading-snug font-medium"
                : "text-2xl leading-snug font-medium"
            }
          >
            I&apos;m
          </span>
          <div
            ref={sourceAvatarRef}
            className="relative shrink-0 origin-center overflow-hidden rounded-full will-change-transform [backface-visibility:hidden]"
            style={{
              width: IDENTITY_AVATAR_SIZE,
              height: IDENTITY_AVATAR_SIZE,
            }}
          >
            <img
              src={USER.avatar}
              alt=""
              className="size-full rounded-full object-cover"
            />
          </div>
          <span
            ref={sourceNameRef}
            className={`${PROFILE_NAME_CLASS} inline-block origin-center will-change-transform [backface-visibility:hidden]`}
          >
            {USER.firstName}
          </span>
        </div>
      ) : null}

      <ProfileHeader
        intro={
          shouldPlayIntro
            ? {
                avatarTargetRef: targetAvatarRef,
                nameTargetRef: targetNameRef,
                detailsVisible: presentation.detailsVisible,
                morphTargetsVisible: presentation.showMorphTargets,
                elevateMorphTargets: presentation.elevateMorphTargets,
              }
            : undefined
        }
      />
    </div>
  )
}
