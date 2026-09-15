"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { IconBrandSpotify } from "@tabler/icons-react"
import { Headphones } from "lucide-react"

import { cn } from "@/lib/utils"
import { Tag } from "@/components/ui/tag"
import artworkStyles from "@/features/off-clock/components/artwork.module.css"
import {
  ShelfArt,
  ShelfCard,
} from "@/features/off-clock/components/personal-tile"
import { useVisibleResource } from "@/features/off-clock/lib/use-visible-resource"

import type { NowPlaying } from "../lib/now-playing"
import styles from "./now-playing.module.css"

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago",
  hour: "numeric",
  minute: "2-digit",
})

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago",
  month: "2-digit",
  day: "2-digit",
})

function durationLabel(milliseconds: number) {
  const seconds = Math.floor(milliseconds / 1000)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
}

/** Same clock as the Moving tile: Chicago time, dated when not today. */
function playedLabel(iso: string) {
  const played = new Date(iso)
  const day = dayFormatter.format(played)
  const prefix = day === dayFormatter.format(new Date()) ? "" : `${day} · `
  return `Played ${prefix}${timeFormatter.format(played)} CT`
}

export function SpotifyNowPlaying({ className }: { className?: string }) {
  const { ref, data, failed } = useVisibleResource<NowPlaying>(
    "/api/spotify",
    30_000
  )
  const playing = data?.status === "playing" ? data : null
  const recent = data?.status === "recent" ? data : null
  const track = playing || recent
  const caption =
    failed || data?.status === "unavailable"
      ? "Listening status unavailable."
      : !data
        ? "Checking Spotify…"
        : data.status === "unconfigured"
          ? "Spotify is not connected yet."
          : "Nothing playing right now."
  const state = playing
    ? "Now playing"
    : track
      ? "Last played"
      : data || failed
        ? "Off the air"
        : "Tuning in"

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
        dividerBadge={
          <Tag className="gap-1.5">
            {playing ? <EqBars /> : null}
            {state}
          </Tag>
        }
        bodyClassName="min-h-56 gap-5 pt-5"
      >
        <div className="flex flex-1 items-center gap-5">
          <RecordDeck
            artwork={track?.artwork}
            alt={`${track?.album || track?.title} album cover`}
            spinning={Boolean(playing)}
          />

          <div className="min-w-0 flex-1">
            <p
              className="line-clamp-2 text-lg leading-snug font-medium text-balance"
              title={track?.title}
            >
              {track?.title || "A moment of quiet"}
            </p>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {track?.artist || caption}
            </p>
            {track?.album && track.album !== track.title ? (
              <p
                className="mt-1 truncate text-sm text-muted-foreground/70"
                title={track.album}
              >
                {track.album}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-auto flex items-center gap-1.5 border-t border-dashed border-line pt-3 text-xs text-muted-foreground">
          <IconBrandSpotify aria-hidden className="size-3.5 shrink-0" />
          {playing?.durationMs && playing.progressMs != null ? (
            <PlaybackProgress
              key={`${playing.url}:${playing.progressMs}`}
              progressMs={playing.progressMs}
              durationMs={playing.durationMs}
            />
          ) : (
            <>
              <span className="min-w-0 flex-1 truncate">
                {recent?.playedAt ? (
                  <time
                    dateTime={recent.playedAt}
                    className="font-mono tabular-nums"
                  >
                    {playedLabel(recent.playedAt)}
                  </time>
                ) : (
                  "Spotify"
                )}
              </span>
              {recent?.durationMs ? (
                <span className="font-mono tabular-nums">
                  {durationLabel(recent.durationMs)}
                </span>
              ) : null}
            </>
          )}
        </div>
      </ShelfCard>
    </div>
  )
}

/** Album sleeve with the record peeking out behind it. */
function RecordDeck({
  artwork,
  alt,
  spinning,
}: {
  artwork?: string
  alt: string
  spinning: boolean
}) {
  return (
    <div className="relative h-(--sleeve) w-[calc(var(--sleeve)*1.36)] shrink-0 [--sleeve:--spacing(28)] sm:[--sleeve:--spacing(24)] md:[--sleeve:--spacing(32)]">
      <span
        aria-hidden
        className={cn(
          styles.record,
          spinning && styles.spinning,
          "absolute top-[calc(var(--sleeve)*0.03)] left-[calc(var(--sleeve)*0.4)] size-[calc(var(--sleeve)*0.94)]"
        )}
      >
        <span className={styles.disc}>
          {artwork ? (
            <Image
              src={artwork}
              width={96}
              height={96}
              unoptimized
              alt=""
              className={cn(artworkStyles.artwork, styles.label)}
            />
          ) : (
            <span className={styles.label} />
          )}
        </span>
      </span>

      <ShelfArt className="size-(--sleeve) rounded-lg shadow-[6px_0_6px_-6px_rgb(0_0_0/0.6)]">
        {artwork ? (
          <Image
            src={artwork}
            width={256}
            height={256}
            unoptimized
            alt={alt}
            className={artworkStyles.artwork}
          />
        ) : (
          <span className="flex size-full items-center justify-center">
            <Headphones aria-hidden strokeWidth={1} className="size-10" />
          </span>
        )}
      </ShelfArt>
    </div>
  )
}

/** Advances locally between polls; remounted by key on each fresh position. */
function PlaybackProgress({
  progressMs,
  durationMs,
}: {
  progressMs: number
  durationMs: number
}) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const timer = setInterval(() => setElapsed(Date.now() - start), 1000)
    return () => clearInterval(timer)
  }, [])
  const position = Math.min(progressMs + elapsed, durationMs)

  return (
    <div className="ml-0.5 flex min-w-0 flex-1 items-center gap-3 font-mono tabular-nums">
      <span>{durationLabel(position)}</span>
      <div
        role="progressbar"
        aria-label="Song playback position"
        aria-valuemin={0}
        aria-valuemax={durationMs}
        aria-valuenow={position}
        aria-valuetext={`${durationLabel(position)} of ${durationLabel(durationMs)}`}
        className="h-0.5 flex-1 overflow-hidden rounded-full bg-foreground/10"
      >
        <div
          className="h-full origin-left bg-foreground/75 motion-safe:transition-transform motion-safe:duration-1000 motion-safe:ease-linear"
          style={{ transform: `scaleX(${position / durationMs})` }}
        />
      </div>
      <span>{durationLabel(durationMs)}</span>
    </div>
  )
}

function EqBars() {
  return (
    <span aria-hidden className="flex h-3 shrink-0 items-end gap-0.5">
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
