import { Prose } from "@/components/ui/typography"
import { Markdown } from "@/components/markdown"
import { USER } from "@/features/portfolio/data/user"

import { HelloTitle } from "./hello-title"
import { Panel, PanelContent, PanelHeader } from "./panel"

export function About() {
  return (
    <Panel id="about">
      <PanelHeader>
        <HelloTitle />
      </PanelHeader>

      <PanelContent>
        <Prose>
          <Markdown>{USER.about}</Markdown>
        </Prose>
      </PanelContent>
    </Panel>
  )
}
