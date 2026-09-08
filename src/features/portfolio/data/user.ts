import type { User } from "@/features/portfolio/types/user"

export const USER: User = {
  firstName: "Yugesh",
  lastName: "Sappidi",
  displayName: "Yugesh Reddy Sappidi",
  username: "yugesh-reddy",
  gender: "male",
  pronouns: "he/him",
  bio: "AI Engineer working on LLM safety, evaluation, and inference systems.",
  flipSentences: [
    "AI Engineer",
    "LLM Red Teaming",
    "Adversarial Robustness",
    "Evals & Inference",
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
I'm an AI Engineer focused on LLM safety, evaluation, and inference. I completed my MS in Computer Science at UIC in May 2026. I care about what makes a model ready for real users: reliability, cost, and answers grounded in evidence.

At UI Health, I built a clinical RAG system over patient records that answers over WhatsApp at 1.2s median latency, with a 60% reduction in response failures. My projects explore the same questions through medical LLM red teaming with [MediCS](https://github.com/Yugesh-reddy/MediCS-Red-Teaming), agent memory quality with Mnemo, and adaptive inference with [AdaTTT](https://github.com/Yugesh-reddy/AdaTTT-Adaptive-Test-Time-Training).

I build with strong baselines, confidence intervals, and ablations, and I document the results even when they challenge my approach. Red teaming taught me to trust a system only after a serious attempt to break it.
`,
  avatar: "/yugesh.png",
  avatarVariants: {
    lightOff: "/yugesh.png",
    lightOn: "/yugesh.png",
    darkOff: "/yugesh.png",
    darkOn: "/yugesh.png",
  },
  ogImage: "/og.png",
  namePronunciationUrl: "/yugesh-name.mp3",
  timeZone: "America/Chicago",
  keywords: [
    "yugesh",
    "yugesh reddy",
    "yugesh sappidi",
    "yugesh-reddy",
    "ai engineer",
    "machine learning engineer",
    "llm engineer",
    "adversarial robustness",
    "ai safety",
    "llm red teaming",
    "llm evaluation",
    "rag",
    "fine-tuning",
    "inference optimization",
    "chicago",
  ],
  dateCreated: "2026-05-26",
}
