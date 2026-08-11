import type { User } from "@/features/portfolio/types/user"

export const USER: User = {
  firstName: "Yugesh",
  lastName: "Sappidi",
  displayName: "Yugesh Reddy Sappidi",
  username: "yugesh-reddy",
  gender: "male",
  pronouns: "he/him",
  bio: "AI Engineer working on adversarial robustness and AI safety.",
  flipSentences: [
    "AI Engineer",
    "Adversarial Robustness",
    "AI Safety",
    "LLM Red Teaming",
  ],
  address: "Chicago, IL, USA",
  phoneNumber: "",
  email: "eXVnZXNocmVkZHlzYXBwaWRpQGdtYWlsLmNvbQ==",
  website: "https://github.com/Yugesh-reddy",
  jobTitle: "AI Engineer",
  jobs: [
    {
      title: "Graduate Research Assistant",
      company: "UI Health",
      website: "https://hospital.uillinois.edu/",
      experienceId: "ui-health",
    },
  ],
  about: `
I'm an AI Engineer focused on adversarial robustness and AI safety across multiple modalities — language, vision-language, and multi-agent systems. My work sits at the intersection of two questions I find endlessly interesting: *how do you break an AI system?* and *how do you make it unbreakable?*

I build production-grade ML research systems around RAG, context engineering, red teaming, fine-tuning (SFT/DPO), and test-time adaptation, with a particular emphasis on making models robust across languages — a gap I treat as both a safety problem and a fairness one. Most of my recent projects form a coherent narrative: probing where modern LLMs and vision-language models fail under adversarial pressure, then designing adaptive defenses that learn and improve rather than relying on static guardrails.

Outside of structured coursework and research, I stay close to the leading edge of the field, tracking new techniques in alignment, robustness, and agentic systems so the things I build reflect where AI is actually heading.
`,
  avatar: "/yugesh.png",
  avatarVariants: {
    lightOff: "/yugesh.png",
    lightOn: "/yugesh.png",
    darkOff: "/yugesh.png",
    darkOn: "/yugesh.png",
  },
  ogImage: "/og.png",
  namePronunciationUrl: "",
  timeZone: "America/Chicago",
  keywords: [
    "yugesh",
    "yugesh reddy",
    "yugesh sappidi",
    "yugesh-reddy",
    "ai engineer",
    "adversarial robustness",
    "ai safety",
    "llm red teaming",
  ],
  dateCreated: "2026-05-26",
}
