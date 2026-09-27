import { CountUp } from "@/components/motion/count-up"
import { ActivityTile } from "@/features/activity/components/activity-tile"
import {
  ChicagoTile,
  WatchingTile,
} from "@/features/off-clock/components/editorial-tiles"
import { SpotifyNowPlaying } from "@/features/spotify/components/now-playing"

import { HandwrittenArrow, HandwrittenNote } from "./handwritten-note"
import { Panel, PanelHeader, PanelTitle, PanelTitleSup } from "./panel"

export function ProfileSummary() {
  return (
    <Panel id="profile-summary" aria-labelledby="profile-summary-title">
      <PanelHeader>
        <PanelTitle id="profile-summary-title">
          After hours
          <PanelTitleSup>
            [<CountUp value={4} />]
          </PanelTitleSup>
        </PanelTitle>
      </PanelHeader>

      <HandwrittenNote
        className="top-6 left-full ml-2 hidden w-32 flex-col items-start lg:flex"
        aria-hidden
      >
        <span className="rotate-3">A little of life outside the editor.</span>
        <HandwrittenArrow className="mt-1 size-7 rotate-3" />
      </HandwrittenNote>

      <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-6">
        <SpotifyNowPlaying className="sm:col-span-3 md:col-span-4" />
        <ActivityTile className="sm:col-span-3 md:col-span-2" />
        <WatchingTile className="sm:col-span-2" />
        <ChicagoTile className="sm:col-span-4" />
      </div>
    </Panel>
  )
}
