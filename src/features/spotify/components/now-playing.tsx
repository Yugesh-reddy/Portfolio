"use client"

import Image from "next/image"
import { IconBrandSpotify } from "@tabler/icons-react"
import { Headphones, Music2 } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  ShelfArt,
  ShelfCard,
} from "@/features/off-clock/components/personal-tile"
import { useVisibleResource } from "@/features/off-clock/lib/use-visible-resource"

import type { NowPlaying } from "../lib/now-playing"

function durationLabel(milliseconds: number) {
  const seconds = Math.floor(milliseconds / 1000)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
}

export function SpotifyNowPlaying({ className }: { className?: string }) {
  const { ref, data, failed } = useVisibleResource<NowPlaying>(
    "/api/spotify",
    30_000
  )
  const playing = data?.status === "playing" ? data : null
  const track = playing || (data?.status === "recent" ? data : null)
  const caption =
    failed || data?.status === "unavailable"
      ? "Listening status unavailable."
      : !data
        ? "Checking Spotify…"
        : data.status === "unconfigured"
          ? "Spotify is not connected yet."
          : "Nothing playing right now."
  const progress = playing?.progressMs

  return (
    <div ref={ref} className={cn("min-w-0", className)}>
      <ShelfCard
        index="01"
        label="Listening"
        href={track?.url}
        linkLabel={
          track
            ? `Listen to ${track.title} by ${track.artist} on Spotify`
            : undefined
        }
        bodyClassName="min-h-56 gap-5"
      >
        <div className="flex flex-1 items-center gap-4 sm:gap-5">
          <ShelfArt className="size-28 rounded-lg sm:size-24 md:size-32">
            {track?.artwork ? (
              <Image
                src={track.artwork}
                width={256}
                height={256}
                unoptimized
                alt={`${track.album || track.title} album cover`}
              />
            ) : (
              <span className="flex size-full items-center justify-center">
                <Headphones aria-hidden strokeWidth={1} className="size-10" />
              </span>
            )}
          </ShelfArt>

          <div className="min-w-0 flex-1">
            <p className="mb-2.5 flex items-center gap-2 font-mono text-xs text-muted-foreground">
              {playing ? (
                <EqBars />
              ) : (
                <Headphones aria-hidden className="size-3.5" />
              )}
              {playing
                ? "Now playing"
                : track
                  ? "Last played"
                  : "On my headphones"}
            </p>
            <p
              className="line-clamp-2 text-xl leading-tight font-semibold tracking-tight sm:text-2xl"
              title={track?.title}
            >
              {track?.title || "A moment of quiet"}
            </p>
            <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
              {track?.artist || caption}
            </p>
            {track?.album && track.album !== track.title ? (
              <p
                className="mt-3 truncate font-mono text-xs text-muted-foreground"
                title={track.album}
              >
                {track.album}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-auto border-t border-dashed border-line pt-3">
          {playing?.durationMs && progress != null ? (
            <div className="mb-3 flex items-center gap-3 font-mono text-xs text-muted-foreground tabular-nums">
              <span>{durationLabel(progress)}</span>
              <div
                role="progressbar"
                aria-label="Song playback position"
                aria-valuemin={0}
                aria-valuemax={playing.durationMs}
                aria-valuenow={progress}
                aria-valuetext={`${durationLabel(progress)} of ${durationLabel(playing.durationMs)}`}
                className="h-0.5 flex-1 overflow-hidden rounded-full bg-foreground/10"
              >
                <div
                  className="h-full origin-left bg-foreground/75 motion-safe:transition-transform motion-safe:duration-300"
                  style={{
                    transform: `scaleX(${progress / playing.durationMs})`,
                  }}
                />
              </div>
              <span>{durationLabel(playing.durationMs)}</span>
            </div>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <IconBrandSpotify aria-hidden className="size-4" />
              <span className="font-medium">Spotify</span>
            </span>
            <span className="flex items-center gap-2 font-mono">
              {!playing && track?.durationMs ? (
                <>
                  <Music2 aria-hidden className="size-3" />
                  {durationLabel(track.durationMs)}
                  <span aria-hidden className="text-muted-foreground/40">
                    /
                  </span>
                </>
              ) : null}
              {track ? "Listen on Spotify" : "Off the air"}
            </span>
          </div>
        </div>
      </ShelfCard>
    </div>
  )
}

function EqBars() {
  return (
    <span aria-hidden className="flex h-3.5 shrink-0 items-end gap-0.5">
      {[0, 1, 2, 3].map((bar) => (
        <span
          key={bar}
          className="w-0.5 eq rounded-full bg-current"
          style={{
            height: "100%",
            animationDelay: `${bar * 0.18}s`,
            animationDuration: `${0.8 + bar * 0.13}s`,
          }}
        />
      ))}
    </span>
  )
}
