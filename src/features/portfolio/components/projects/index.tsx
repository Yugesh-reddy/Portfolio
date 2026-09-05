import { CollapsibleList } from "@/components/collapsible-list"
import { CountUp } from "@/components/motion/count-up"

import { PROJECTS } from "../../data/projects"
import { HandwrittenArrow, HandwrittenNote } from "../handwritten-note"
import { Panel, PanelHeader, PanelTitle, PanelTitleSup } from "../panel"
import { ProjectItem } from "./project-item"

export function Projects() {
  return (
    <Panel id="projects">
      <PanelHeader>
        <PanelTitle>
          Projects
          <PanelTitleSup>
            [<CountUp value={PROJECTS.length} />]
          </PanelTitleSup>
        </PanelTitle>
      </PanelHeader>

      <CollapsibleList
        items={PROJECTS}
        max={4}
        renderItem={(item) => <ProjectItem project={item} />}
      />

      <HandwrittenNote
        className="top-6 left-full ml-2 hidden w-28 flex-col items-start lg:flex"
        aria-hidden
      >
        <span className="rotate-3">stuff I built</span>
        <HandwrittenArrow className="mt-1 size-7 rotate-3" />
      </HandwrittenNote>
    </Panel>
  )
}
