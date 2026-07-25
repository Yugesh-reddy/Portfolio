import { CodeXmlIcon, FlaskConicalIcon } from "lucide-react"

import type { Experience } from "../types/experiences"

export const EXPERIENCES: Experience[] = [
  {
    id: "ui-health",
    companyName: "University of Illinois Health (UI Health)",
    companyLogo: "/icons/ui-health.png",
    companyWebsite: "https://hospital.uillinois.edu/",
    positions: [
      {
        id: "ui-health-gra",
        title: "Graduate Research Assistant",
        employmentPeriod: { start: "10.2025", end: "05.2026" },
        employmentType: "Research",
        icon: <FlaskConicalIcon />,
        description: `- Designed RAG pipelines over clinical datasets, enabling natural-language querying of both structured and unstructured patient records for faster clinical insights.
- Built a FastAPI + GPT-4 + Pinecone retrieval backend with chunked embeddings, grounding LLM outputs in source clinical documents to reduce hallucination.
- Optimized the retrieval pipeline for low-connectivity environments, reaching 1.2s median latency under constrained network conditions.
- Integrated Twilio for reliable concurrent WhatsApp sessions, managing conversation state with Cloudflare D1 and KV Store to keep interactions consistent at scale.
- Containerized the full pipeline with Docker and orchestrated it on Kubernetes (Helm), cutting response failures by 60% through better fault isolation.`,
        skills: [
          "RAG",
          "LLMs",
          "Clinical NLP",
          "FastAPI",
          "GPT-4",
          "Pinecone",
          "Vector Retrieval",
          "Twilio",
          "Cloudflare D1 / KV",
          "Docker",
          "Kubernetes",
          "Helm",
        ],
        isExpanded: true,
      },
    ],
  },
  {
    id: "grohubz",
    companyName: "Grohubz",
    companyLogo: "/icons/grohubz.png",
    companyWebsite: "https://grohubz.com/",
    positions: [
      {
        id: "grohubz-web-intern",
        title: "Web Development & Design Intern",
        employmentPeriod: { start: "06.2023", end: "08.2023" },
        employmentType: "Internship",
        icon: <CodeXmlIcon />,
        description: `- Built responsive UIs for an Instagram DM automation platform in React.js alongside a small frontend team, boosting user engagement by 19%.
- Implemented state management with React Hooks and Redux, reducing data-retrieval time by 40% and improving overall performance by 25%.
- Orchestrated multiple services with Docker Compose, shrinking deployment time and eliminating configuration errors across environments.
- Reached 95% test coverage for backend services and components using Mocha, resolving 8 critical bugs before the production release.`,
        skills: [
          "React.js",
          "Redux",
          "JavaScript",
          "React Hooks",
          "Docker",
          "Docker Compose",
          "Figma",
          "Mocha",
        ],
        isExpanded: false,
      },
    ],
  },
]
