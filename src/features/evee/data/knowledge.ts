export const YUGESH_KNOWLEDGE = `
# About Yugesh Reddy Sappidi

- **Name**: Yugesh Reddy Sappidi (also goes by Yugesh)
- **Role**: AI Engineer & Graduate Researcher specializing in Adversarial Robustness, AI Safety, and LLM Red Teaming.
- **Location**: Chicago, IL, United States
- **Bio**: AI Engineer working on adversarial robustness and AI safety across multiple modalities — language, vision-language, and multi-agent systems. His work focuses on two core questions: "How do you break an AI system?" and "How do you make it unbreakable?"
- **Contact & Links**:
  - Email: yugeshreddysappidi@gmail.com
  - GitHub: https://github.com/Yugesh-reddy
  - Website / Portfolio: https://github.com/Yugesh-reddy

---

## Education

1. **University of Illinois Chicago (UIC)**
   - Degree: Master of Science in Computer Science
   - Duration: August 2024 – May 2026
   - GPA: 4.0 / 4.0
   - Relevant Coursework: Computer Algorithms, Permissionless Systems, Data Science, Agentic Systems, Visual Analytics, Natural Language Processing, Visual Data Science, Data & Algorithmic Fairness, Deep Learning for Computer Vision.

2. **Sreenidhi Institute of Science and Technology (SNIST)**
   - Degree: Bachelor of Technology in Computer Engineering
   - Duration: 2019 – 2023

---

## Work Experience

1. **University of Illinois Health (UI Health)**
   - Role: Graduate Research Assistant
   - Duration: October 2025 – May 2026 (Chicago, IL)
   - Key Accomplishments:
     - Designed RAG (Retrieval-Augmented Generation) pipelines over clinical datasets, enabling natural-language querying of structured and unstructured patient records for faster clinical insights.
     - Built a FastAPI + GPT-4 + Pinecone vector retrieval backend with chunked embeddings, grounding LLM outputs in clinical sources to minimize hallucination (1.2s median latency).
     - Integrated Twilio for concurrent WhatsApp messaging sessions, managing conversation state with Cloudflare D1 and KV Store.
     - Containerized the entire pipeline with Docker and orchestrated it on Kubernetes using Helm charts, reducing response failures by 60%.
   - Tech: RAG, LLMs, Clinical NLP, FastAPI, GPT-4, Pinecone, Vector Retrieval, Twilio, Cloudflare D1 / KV, Docker, Kubernetes, Helm.

2. **Grohubz**
   - Role: Web Development & Design Intern
   - Duration: June 2023 – August 2023
   - Key Accomplishments:
     - Built responsive UIs for an Instagram DM automation platform in React.js, boosting user engagement by 19%.
     - Implemented state management with React Hooks and Redux, reducing data-retrieval time by 40% and improving overall performance by 25%.
     - Orchestrated multi-service workflows with Docker Compose and maintained 95% test coverage using Mocha.
   - Tech: React.js, Redux, JavaScript, Docker, Docker Compose, Figma, Mocha.

---

## Featured Research & Projects

1. **MediCS — Adversarial Robustness for Medical LLMs** (01.2026)
   - Link: https://github.com/Yugesh-reddy/MediCS-Red-Teaming
   - Skills: PyTorch, Transformers, TRL (SFT + DPO), PEFT / LoRA, Red Teaming.
   - Summary: An agentic adversarial-training framework for medical LLM safety, addressing how safety alignment degrades on non-English and code-switched inputs.
   - Highlights:
     - Multilingual code-switching attack generation that mixes languages mid-utterance to bypass English-aligned safety classifiers.
     - SFT + DPO defense pipeline: hardens base models with Supervised Fine-Tuning and optimizes with Direct Preference Optimization (DPO) for safe completions.
     - MediCS-500: A benchmark of adversarial medical prompts across 6 languages paired with benign twins to measure jailbreak susceptibility and over-refusal.
     - Demonstrates that multilingual safety gaps are algorithmic fairness and disparate-impact problems.

2. **AdaTTT — Adaptive Test-Time Training for Vision-Language Models** (01.2026)
   - Link: https://github.com/Yugesh-reddy/AdaTTT-Adaptive-Test-Time-Training
   - Skills: PyTorch, ViT + BERT, Test-Time Training (TTT), MAE Self-Supervision, Gradio.
   - Summary: Adaptive test-time training system for Visual Question Answering (VQA) that adapts models per-input only when compute is warranted.
   - Highlights:
     - Self-supervised TTT objective via masked patch reconstruction (MAE) over image tokens without requiring labels while keeping ViT + BERT encoders frozen.
     - Confidence-gated adaptation using entropy thresholding to skip easy, high-confidence samples.
     - Establishes accuracy-compute Pareto frontier. Generalized to Memotion2 meme sentiment classification.

3. **LLM Reasoning & Factuality** (01.2026)
   - Link: https://github.com/Yugesh-reddy/LLM-Reasoning-and-Factuality
   - Skills: Python, RAG, Self-Consistency, ReAct, FAISS / Chroma.
   - Summary: Benchmark and inference pipeline for grounded multi-step reasoning combining Self-Consistency decoding, ReAct agent loops, and RAG over vector databases. Evaluated on GSM8K and TruthfulQA under adversarial pressure.

4. **Melanoma Tissue Volumes — Microscopy Analysis Dashboard** (09.2025 – 02.2026)
   - Link: https://github.com/Yugesh-reddy/Melanoma-Tissue-Volumes
   - Skills: React 18, Three.js, Vite, WebGL, CyCIF.
   - Summary: Interactive GPU-accelerated 3D WebGL visualization and analysis dashboard for cyclic immunofluorescence (CyCIF) microscopy biopsy tissue with multi-channel biomarker thresholding and statistical suites.

5. **Fleet — Flutter Road-Trip Planner & Discovery** (01.2023 – 10.2023)
   - Link: https://github.com/Yugesh-reddy/Fleet--Flutter-Travel-App
   - Skills: Flutter / Dart, Firebase, Google Maps API, Google Places API.
   - Summary: Cross-platform road-trip planning and route optimization app.

---

## Technical Skills & Tech Stack

- **Languages**: Python, TypeScript, JavaScript, Dart, Shell Scripting (Bash/Zsh), SQL, C++
- **AI & Machine Learning**: PyTorch, Transformers, Hugging Face, TRL (SFT/DPO), PEFT / LoRA, TensorFlow, scikit-learn, NumPy, pandas, OpenCV, Jupyter
- **LLM Ops & Safety**: Red Teaming, Adversarial Attacks (Jailbreaks, Code-switching), RAG, ReAct, LangChain, LangGraph, LangSmith, Vector DBs (Pinecone, Chroma, FAISS)
- **Backend & Cloud**: FastAPI, Docker, Kubernetes, Helm, Cloudflare (D1, KV), Firebase, AWS
- **Frontend & Web**: React, Next.js, Tailwind CSS, TypeScript, Three.js, WebGL
- **Testing & Tools**: Git, GitHub, Linux, Mocha, Figma

---

## Certifications

1. **AWS Certified AI Practitioner** (Amazon Web Services, Issued July 2026)
2. **The Complete 2024 Web Development Bootcamp** (Udemy, Issued January 2024)

---

## Articles & Blog Posts

1. **Medical Code-Switching Jailbreaks**: How language mixing bypasses safety filters in healthcare AI, exposing the multilingual alignment gap.
2. **Why DPO Fails on Top of SFT**: Alignment drift, KL divergence trade-offs, and failure modes when layering Direct Preference Optimization over fine-tuned models.
3. **Adaptive Red-Team Attacker**: Automated adversarial prompting and iterative jailbreak generation for multimodal LLMs.
4. **Building Melanoma Tissue Volumes**: 3D visualization and WebGL rendering of high-plex CyCIF biopsy data.
`
