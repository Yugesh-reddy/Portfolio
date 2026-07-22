import { compareDesc } from "date-fns"

import { CollapsibleList } from "@/components/collapsible-list"
import { CountUp } from "@/components/motion/count-up"

import { BOOKMARKS } from "../../data/bookmarks"
import { Panel, PanelHeader, PanelTitle, PanelTitleSup } from "../panel"
import { BookmarkItem } from "./bookmark-item"

const SORTED_BOOKMARKS = [...BOOKMARKS].sort((a, b) => {
  return compareDesc(new Date(a.bookmarkedAt), new Date(b.bookmarkedAt))
})

export function Bookmarks() {
  return (
    <Panel id="bookmarks">
      <PanelHeader>
        <PanelTitle>
          Bookmarks
          <PanelTitleSup>
            [<CountUp value={SORTED_BOOKMARKS.length} />]
          </PanelTitleSup>
        </PanelTitle>
      </PanelHeader>

      <CollapsibleList
        items={SORTED_BOOKMARKS}
        max={6}
        renderItem={(item) => <BookmarkItem bookmark={item} />}
      />
    </Panel>
  )
}
