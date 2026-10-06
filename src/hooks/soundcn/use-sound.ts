"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { decodeAudioData, getAudioContext } from "@/lib/soundcn/sound-engine"
import type {
  SoundAsset,
  UseSoundOptions,
  UseSoundReturn,
} from "@/lib/soundcn/sound-types"

export function useSound(
  sound: SoundAsset,
  options: UseSoundOptions = {}
): UseSoundReturn {
  const {
    volume = 1,
    playbackRate = 1,
    interrupt = false,
    soundEnabled = true,
    onPlay,
    onEnd,
    onPause,
    onStop,
  } = options

  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState<number | null>(
    sound.duration ?? null
  )
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const bufferRef = useRef<AudioBuffer | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    bufferRef.current = null
    return () => {
      mountedRef.current = false
    }
  }, [sound.dataUri])

  const stop = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop()
      } catch {
        // Already stopped
      }
      sourceRef.current = null
    }
    setIsPlaying(false)
    onStop?.()
  }, [onStop])

  const play = useCallback(
    (overrides?: { volume?: number; playbackRate?: number }) => {
      if (!soundEnabled) return

      const startPlayback = (buffer: AudioBuffer) => {
        if (!mountedRef.current) return
        const ctx = getAudioContext()

        if (ctx.state === "suspended") {
          void ctx.resume()
        }

        if (interrupt && sourceRef.current) {
          stop()
        }

        const source = ctx.createBufferSource()
        const gain = ctx.createGain()

        source.buffer = buffer
        source.playbackRate.value = overrides?.playbackRate ?? playbackRate
        gain.gain.value = overrides?.volume ?? volume

        source.connect(gain)
        gain.connect(ctx.destination)

        source.onended = () => {
          setIsPlaying(false)
          onEnd?.()
        }

        source.start(0)
        sourceRef.current = source
        gainRef.current = gain
        setIsPlaying(true)
        onPlay?.()
      }

      if (bufferRef.current) {
        startPlayback(bufferRef.current)
        return
      }

      // Decode lazily on first play so page load never instantiates AudioContext.
      void decodeAudioData(sound.dataUri).then((buffer) => {
        if (!mountedRef.current) return
        bufferRef.current = buffer
        setDuration(buffer.duration)
        startPlayback(buffer)
      })
    },
    [
      soundEnabled,
      sound.dataUri,
      playbackRate,
      volume,
      interrupt,
      stop,
      onPlay,
      onEnd,
    ]
  )

  const pause = useCallback(() => {
    stop()
    onPause?.()
  }, [stop, onPause])

  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = volume
    }
  }, [volume])

  useEffect(() => {
    return () => {
      if (sourceRef.current) {
        try {
          sourceRef.current.stop()
        } catch {
          // Already stopped
        }
      }
    }
  }, [])

  return [play, { stop, pause, isPlaying, duration, sound }] as const
}
