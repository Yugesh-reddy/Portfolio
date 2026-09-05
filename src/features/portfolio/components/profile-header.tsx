"use client"

import type { CSSProperties, RefObject } from "react"

import { cn } from "@/lib/utils"
import { SpotlightLogo } from "@/components/spotlight-logo"
import { AvatarLights } from "@/registry/components/avatar-lights"
import {
  DETAIL_DELAY_MS,
  DETAIL_DURATION_MS,
  DETAIL_EASING,
  PROFILE_NAME_CLASS,
  ROLE_STAGGER_MS,
} from "@/features/portfolio/components/intro/intro-shared"
import { USER } from "@/features/portfolio/data/user"
import { splitDisplayName } from "@/features/portfolio/lib/home-intro-session"

import { AvatarLightsToggle } from "./avatar-lights-toggle"
import { FlipSentences } from "./flip-sentences"
import { HandwrittenArrow, HandwrittenNote } from "./handwritten-note"
import { PronounceMyName } from "./pronounce-my-name"
import { VerifiedIcon } from "./verified-icon"

type ProfileHeaderIntro = {
  avatarTargetRef: RefObject<HTMLDivElement | null>
  nameTargetRef: RefObject<HTMLSpanElement | null>
  detailsVisible: boolean
  morphTargetsVisible: boolean
  elevateMorphTargets: boolean
}

export function ProfileHeader({ intro }: { intro?: ProfileHeaderIntro }) {
  const { first, remainder } = splitDisplayName(
    USER.displayName,
    USER.firstName
  )
  const detailsVisible = intro?.detailsVisible ?? true
  const morphTargetsVisible = intro?.morphTargetsVisible ?? true
  const detailStyle: CSSProperties | undefined = intro
    ? {
        transitionDelay: intro.detailsVisible ? `${DETAIL_DELAY_MS}ms` : "0ms",
        transitionDuration: `${DETAIL_DURATION_MS}ms`,
        transitionTimingFunction: DETAIL_EASING,
      }
    : undefined
  const roleStyle: CSSProperties | undefined = intro
    ? {
        transitionDelay: intro.detailsVisible
          ? `${DETAIL_DELAY_MS + ROLE_STAGGER_MS}ms`
          : "0ms",
        transitionDuration: `${DETAIL_DURATION_MS}ms`,
        transitionTimingFunction: DETAIL_EASING,
      }
    : undefined

  return (
    <div className="screen-line-bottom relative grid grid-cols-[auto_1fr] grid-rows-[1fr_auto] overflow-y-clip border-x border-line">
      <figure
        className={cn(
          "relative col-span-2 p-2 sm:col-span-1 sm:col-start-2 sm:p-4",
          intro &&
            "transform-gpu transition-[opacity,transform] motion-reduce:transition-none",
          detailsVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-1 opacity-0"
        )}
        style={detailStyle}
      >
        <SpotlightLogo />
        <HandwrittenNote
          className="bottom-20 left-full hidden w-40 flex-col items-start lg:flex"
          aria-hidden
        >
          <HandwrittenArrow className="-scale-y-100 -rotate-6" />
          <span className="ml-1 -rotate-6">
            follows your cursor
            <br />
            click for a sound
          </span>
        </HandwrittenNote>
        <figcaption className="pointer-events-none absolute right-2 bottom-2 font-mono text-xs leading-none text-zinc-400 select-none sm:right-4 dark:text-zinc-700">
          FIG_001
        </figcaption>
      </figure>

      <div className="flex flex-col sm:row-span-2 sm:row-start-1">
        <div className="screen-line-top mt-auto shrink-0 border-r border-line">
          <AvatarLightsToggle className="group/avatar-lights-toggle mx-0.5 my-0.75 flex outline-none">
            <div
              ref={intro?.avatarTargetRef}
              className={cn(
                "relative h-fit w-fit shrink-0",
                morphTargetsVisible ? "opacity-100" : "opacity-0",
                intro?.elevateMorphTargets && "z-[61]"
              )}
            >
              <AvatarLights
                className="ring-[#fbbf24] ring-offset-2 ring-offset-background group-focus-visible/avatar-lights-toggle:ring-2 dark:ring-[#FFC799]"
                variants={USER.avatarVariants}
              />
            </div>
          </AvatarLightsToggle>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="mt-auto border-t border-line">
          <div className="flex items-center gap-2 pl-4">
            <h1 className={cn("relative -top-px", PROFILE_NAME_CLASS)}>
              <span
                ref={intro?.nameTargetRef}
                className={cn(
                  "relative inline-block",
                  morphTargetsVisible ? "opacity-100" : "opacity-0",
                  intro?.elevateMorphTargets && "z-[61]"
                )}
              >
                {first}
              </span>
              {remainder ? (
                <>
                  {" "}
                  <span
                    className={cn(
                      "inline-block transform-gpu",
                      intro &&
                        "transition-[opacity,transform] motion-reduce:transition-none",
                      detailsVisible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-0.5 opacity-0"
                    )}
                    style={detailStyle}
                  >
                    {remainder}
                  </span>
                </>
              ) : null}
            </h1>

            <div
              className={cn(
                "flex transform-gpu items-center gap-2",
                intro &&
                  "transition-[opacity,transform] motion-reduce:transition-none",
                detailsVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-0.5 opacity-0"
              )}
              style={detailStyle}
            >
              <VerifiedIcon
                className="size-4.5 text-foreground select-none"
                aria-label="Verified"
              />

              {USER.namePronunciationUrl ? (
                <PronounceMyName
                  namePronunciationUrl={USER.namePronunciationUrl}
                />
              ) : null}
            </div>
          </div>

          <div
            className={cn(
              "transform-gpu",
              intro &&
                "transition-[opacity,transform] motion-reduce:transition-none",
              detailsVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-1 opacity-0"
            )}
            style={roleStyle}
          >
            <FlipSentences className="h-12.5 border-t border-line py-1 pl-4 sm:h-9">
              {USER.flipSentences}
            </FlipSentences>
          </div>
        </div>
      </div>
    </div>
  )
}
