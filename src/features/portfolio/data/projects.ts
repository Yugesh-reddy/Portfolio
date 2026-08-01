import type { Project } from "../types/projects"

export const PROJECTS: Project[] = [
  {
    id: "medics",
    title: "MediCS — Adversarial Robustness for Medical LLMs",
    period: { start: "01.2026" },
    link: "https://github.com/Yugesh-reddy/MediCS-Red-Teaming",
    skills: [
      "PyTorch",
      "Transformers",
      "TRL (SFT + DPO)",
      "PEFT / LoRA",
      "Red Teaming",
    ],
    description: `An agentic adversarial-training framework for **medical LLM safety**, built on the finding that safety alignment degrades sharply on non-English and code-switched inputs relative to English.

- **Multilingual code-switching attack generation.** An agentic attacker constructs jailbreaks that mix languages mid-utterance to bypass safety classifiers aligned primarily in English.
- **SFT + DPO defense pipeline.** The base model is hardened with Supervised Fine-Tuning, then preference-optimized with DPO to prefer safe completions — modern RLHF-style post-training without a separate reward model.
- **MediCS-500 dataset.** A curated benchmark of adversarial medical prompts across six verified languages, each paired with a benign "twin" to measure jailbreak susceptibility *and* over-refusal.
- **Measured outcome.** A high attack-success rate on the base model collapses dramatically after a single round of SFT, quantifying how brittle — and recoverable — multilingual safety is.
- **Fairness framing.** When a model is safe in English but exploitable in other languages, the gap is a disparate-impact problem with language as the protected attribute.`,
    logo: "/icons/medics.svg",
    isExpanded: true,
  },
  {
    id: "adattt",
    title: "AdaTTT — Adaptive Test-Time Training for Vision-Language Models",
    period: { start: "01.2026" },
    link: "https://github.com/Yugesh-reddy/AdaTTT-Adaptive-Test-Time-Training",
    skills: [
      "PyTorch",
      "ViT + BERT",
      "Test-Time Training",
      "MAE Self-Supervision",
      "Gradio",
    ],
    description: `An adaptive **test-time training (TTT)** system for Visual Question Answering that adapts the model *per input* — but only when it's worth the compute.

- **Self-supervised TTT objective.** At inference, the model adapts via a per-token masked patch reconstruction task (MAE-style) over image tokens, requiring no labels while the ViT + BERT encoders stay frozen — only a lightweight head/adapter updates.
- **Confidence-gated adaptation.** An entropy/confidence gate decides which samples need TTT, skipping easy, high-confidence inputs to keep the decision boundary sharp.
- **Accuracy–compute Pareto frontier.** A Pareto curve of accuracy vs. FLOPs shows selective adaptation recovers most of full TTT's benefit at a fraction of the cost.
- **Rigorous evaluation.** Bootstrap confidence intervals provide honest error bars; gradient accumulation and LR warmup stabilize the few-step inner loop.
- **Cross-task generalization.** Transfer is tested beyond VQA onto Memotion2 meme-sentiment classification, plus a Gradio demo and ablation studies.`,
    logo: "/icons/adattt.svg",
    isExpanded: true,
  },
  {
    id: "llm-reasoning-factuality",
    title: "LLM Reasoning & Factuality",
    period: { start: "01.2026" },
    link: "https://github.com/Yugesh-reddy/LLM-Reasoning-and-Factuality",
    skills: [
      "Python",
      "RAG",
      "Self-Consistency",
      "ReAct",
      "FAISS / Chroma",
    ],
    description: `A reasoning-and-factuality pipeline that combines and benchmarks the leading inference-time techniques for grounded, multi-step reasoning.

- **Self-Consistency decoding.** Samples multiple chain-of-thought traces and aggregates by majority vote to reduce variance from any single greedy decode.
- **ReAct agent loop.** Interleaves reasoning traces with tool/action steps so the model retrieves and verifies intermediate facts instead of hallucinating them.
- **Retrieval-Augmented Generation (RAG).** Grounds answers in an external knowledge store via dense embedding retrieval.
- **Standardized benchmarking.** Evaluated on GSM8K and TruthfulQA, with adversarial robustness testing that measures how reasoning quality degrades under crafted, misleading inputs.`,
    logo: "/icons/llm-reasoning.svg",
    isExpanded: false,
  },
  {
    id: "melanoma-tissue-volumes",
    title: "Melanoma Tissue Volumes — Microscopy Analysis Dashboard",
    period: { start: "09.2025", end: "02.2026" },
    link: "https://github.com/Yugesh-reddy/Melanoma-Tissue-Volumes",
    skills: [
      "React 18",
      "Three.js",
      "Vite",
      "WebGL",
      "CyCIF",
    ],
    description: `An interactive 3D visualization and analysis dashboard for **cyclic immunofluorescence (CyCIF)** microscopy of biopsy tissue, built for the Visual Data Science graduate course at UIC.

- **GPU-accelerated 3D rendering.** Tissue volumes render in WebGL with full camera control and level-of-detail (LOD) optimization so large multi-channel volumes stay interactive in the browser.
- **Multi-channel biomarker analysis.** Multiple biomarker channels are visualized and compared simultaneously, with per-channel color, opacity, and threshold controls updating in real time.
- **Region selection & statistics.** 3D selection boxes isolate arbitrary regions, surfacing cell counts, density, and intensity distributions.
- **Statistical visualization suite.** Bar charts, co-expression heatmaps, violin plots, and a directional/spatial-orientation view of biomarker layout.`,
    logo: "/icons/melanoma.svg",
    isExpanded: false,
  },
  {
    id: "fleet",
    title: "Fleet — Flutter Road-Trip Planner & Destination Discovery",
    period: { start: "01.2023", end: "10.2023" },
    link: "https://github.com/Yugesh-reddy/Fleet--Flutter-Travel-App",
    skills: [
      "Flutter / Dart",
      "Firebase",
      "Google Maps API",
      "Google Places API",
    ],
    description: `A cross-platform **Flutter** road-trip planning app that acts as a digital co-pilot — destination discovery, cost estimation, and personalized recommendations in one interface.

- **Destination discovery & trip cost estimation.** Curated, filterable destination lists plus real-time travel-cost estimates from live distance/route data via the Google Maps API.
- **Nearby lodging & dining.** Up-to-date hotel and restaurant options for each stop, with ratings and distance, served through the Google Places API.
- **Cloud backend & realtime sync.** Plans, discoveries, and preferences persist in the cloud with secure auth; recommendations adapt to the user's travel style and history.`,
    logo: "/icons/fleet.svg",
    isExpanded: false,
  },
]
