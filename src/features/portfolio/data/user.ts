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
I'm an AI Engineer in Chicago. I finished my MS in Computer Science at UIC in May 2026 with a 4.0, and I'm looking for a role building LLM systems that have to survive contact with real users.

The work I care about is the part between a model that demos well and a model you can actually ship: does it hold up when someone attacks it, what does it cost per query, and can you prove the answer is grounded in something. At UI Health I built clinical RAG over patient records, a FastAPI, GPT-4 and Pinecone retrieval backend running on Kubernetes that answers over WhatsApp at 1.2s median latency, with a 60% drop in response failures after I isolated the failure paths.

The rest of my work follows the same thread. [MediCS](https://github.com/Yugesh-reddy/MediCS-Red-Teaming) is a closed-loop red team and defense for medical LLMs: it found a 27.6% attack success rate using multilingual code-switching, then a single QLoRA fine-tune took that to 6.4% without costing helpfulness. Mnemo puts a quality gate on the write path of agent memory and takes stored-fact precision from 60% to 90% without giving up any recall. [AdaTTT](https://github.com/Yugesh-reddy/AdaTTT-Adaptive-Test-Time-Training) decides when a vision-language model should adapt at inference instead of adapting on every sample.

What ties those together is less the subject matter than the habit. Every one of them ships with baselines it could have lost to, confidence intervals instead of single numbers, and an ablation whose whole job is to explain the headline away. When DPO made MediCS *worse*, that went in the README and became a blog post. I spent a year on [Gambit](https://github.com/Yugesh-reddy/Gambit), a model router that looked excellent in simulation, then killed it when the pre-registered evaluation came back against me on real benchmarks. Red teaming teaches you to assume your own system is wrong until it survives a serious attempt to break it, and that turns out to be a good way to build anything.

If you're hiring for evaluation, safety, retrieval, or inference work on LLM systems, I'd like to hear from you.
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
