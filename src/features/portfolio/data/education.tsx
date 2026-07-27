import type { Education } from "../types/education"

export const EDUCATION: Education[] = [
  {
    id: "uic",
    institution: "University of Illinois Chicago",
    institutionUrl: "https://www.uic.edu/",
    degree: "Master of Science in Computer Science",
    period: {
      start: "08/2024",
      end: "05/2026",
    },
    description: `
- GPA: 4.0 / 4.0
- Courses:
  - Computer Algorithms
  - Permissionless Systems
  - Data Science
  - Agentic Systems
  - Visual Analytics
  - Natural Language Processing
  - Visual Data Science
  - Data & Algorithmic Fairness
  - Deep Learning for Computer Vision
`,
  },
  {
    id: "snist",
    institution: "Sreenidhi Institute of Science and Technology",
    institutionUrl: "https://www.sreenidhi.edu.in/",
    degree: "Bachelor of Technology in Computer Engineering",
    period: {
      start: "2019",
      end: "2023",
    },
  },
]
