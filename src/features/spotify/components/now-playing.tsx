"use client"

import Image from "next/image"
import { IconBrandSpotify } from "@tabler/icons-react"
import { Disc3 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import {
  ShelfArt,
  ShelfBadge,
  ShelfCard,
} from "@/features/off-clock/components/personal-tile"
import { useVisibleResource } from "@/features/off-clock/lib/use-visible-resource"

import type { NowPlaying } from "../lib/now-playing"

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
  return (
    <div ref={ref} className={cn("min-w-0", className)}>
      <ShelfCard
        index="01"
        label="Listening"
        href={track?.url}
        live={Boolean(playing)}
      >
        <div className="flex items-center gap-3">
          <ShelfArt>
            {track?.artwork ? (
              <Image
                src={track.artwork}
                width={112}
                height={112}
                unoptimized
                alt={`${track.title} album cover`}
              />
            ) : (
              <span className="flex size-full items-center justify-center">
                <Disc3
                  aria-hidden
                  strokeWidth={1.5}
                  className="size-6 motion-safe:animate-[spin_8s_linear_infinite]"
                />
              </span>
            )}
          </ShelfArt>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <p
                className="truncate leading-snug font-medium text-balance"
                title={track?.title || "On my headphones"}
              >
                {track?.title || "On my headphones"}
              </p>
              {playing ? <EqBars /> : null}
            </div>

            <dl className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
              <div className="min-w-0">
                <dt className="sr-only">Artist</dt>
                <dd className="truncate">{track?.artist || caption}</dd>
              </div>
              <Separator
                className="data-vertical:h-4 data-vertical:self-center"
                orientation="vertical"
              />
              <div>
                <dt className="sr-only">Source</dt>
                <dd className="font-mono text-xs">
                  {playing
                    ? "Spotify // live"
                    : recent
                      ? "Spotify // last played"
                      : "Spotify"}
                </dd>
              </div>
            </dl>
          </div>

          <ShelfBadge>
            <IconBrandSpotify />
          </ShelfBadge>
        </div>
      </ShelfCard>
    </div>
  )
}

function EqBars() {
  return (
    <span aria-hidden className="flex h-3.5 shrink-0 items-end gap-[2.5px]">
      {[0, 1, 2].map((bar) => (
        <span
          key={bar}
          className="w-[3px] eq rounded-full bg-emerald-500"
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
