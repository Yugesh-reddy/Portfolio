export const YUGESH_KNOWLEDGE = `
# About Yugesh Reddy Sappidi

- **Name**: Yugesh Reddy Sappidi (also goes by Yugesh)
- **Role**: AI Engineer. Focus areas: LLM safety and red teaming, adversarial robustness, evaluation, retrieval, and inference cost.
- **Location**: Chicago, IL, United States
- **Status**: Completed his MS in Computer Science at UIC in May 2026 (3.9 GPA). Open to AI engineering roles working on LLM systems in production.
- **Bio**: He works on the gap between a model that demos well and a model you can ship: whether it holds up under attack, what it costs per query, and whether the output is grounded in something verifiable.
- **How he works**: Every project ships with baselines it could lose to, bootstrap confidence intervals rather than single numbers, and an ablation designed to explain the headline result away. He publishes negative results (see the DPO regression in MediCS) instead of dropping them.
- **Contact & Links**:
  - Email: yugeshreddysappidi@gmail.com
  - GitHub: https://github.com/Yugesh-reddy

---

## Education

1. **University of Illinois Chicago (UIC)**
   - Degree: Master of Science in Computer Science
   - Duration: August 2024 - May 2026
   - GPA: 3.9 / 4.0
   - Relevant Coursework: Computer Algorithms, Permissionless Systems, Data Science, Agentic Systems, Visual Analytics, Natural Language Processing, Visual Data Science, Data & Algorithmic Fairness, Deep Learning for Computer Vision.

2. **Sreenidhi Institute of Science and Technology (SNIST)**
   - Degree: Bachelor of Technology in Computer Engineering
   - Duration: 2019 - 2023

---

## Work Experience

1. **University of Illinois Health (UI Health)**
   - Role: Graduate Research Assistant
   - Duration: October 2025 - May 2026 (Chicago, IL)
   - Key Accomplishments:
     - Designed RAG pipelines over clinical datasets so clinicians could query structured and unstructured patient records in natural language.
     - Built a FastAPI + GPT-4 + Pinecone retrieval backend with chunked embeddings, grounding model output in the source clinical documents to cut hallucination. 1.2s median latency, tuned for low-connectivity conditions.
     - Integrated Twilio for concurrent WhatsApp sessions, holding conversation state in Cloudflare D1 and KV Store.
     - Containerized the pipeline with Docker and ran it on Kubernetes with Helm, cutting response failures by 60% through better fault isolation.
   - Tech: RAG, LLMs, Clinical NLP, FastAPI, GPT-4, Pinecone, Vector Retrieval, Twilio, Cloudflare D1 / KV, Docker, Kubernetes, Helm.

2. **Grohubz**
   - Role: Web Development & Design Intern
   - Duration: June 2023 - August 2023
   - Key Accomplishments:
     - Built responsive UIs for an Instagram DM automation platform in React.js, boosting user engagement by 19%.
     - Implemented state management with React Hooks and Redux, reducing data-retrieval time by 40% and improving overall performance by 25%.
     - Orchestrated multi-service workflows with Docker Compose and maintained 95% test coverage using Mocha, clearing 8 critical bugs before release.
   - Tech: React.js, Redux, JavaScript, Docker, Docker Compose, Figma, Mocha.

---

## Featured Projects

1. **MediCS: Red-Teaming and Defending a Medical LLM** (Feb 2026 - May 2026)
   - Link: https://github.com/Yugesh-reddy/MediCS-Red-Teaming
   - Skills: PyTorch, Llama 3 / QLoRA, TRL (SFT + DPO), PEFT, Red Teaming, Statistical Evaluation.
   - Premise: safety alignment holds in English and leaks when a prompt switches languages mid-sentence.
   - Attack: an agentic red team runs 5 strategies across 6 low-resource languages and 6 harm categories, with a Thompson-Sampling bandit per harm category that learns which strategy actually works instead of firing fixed templates.
   - Finding: 27.6% attack success rate on Llama-3-8B-Instruct. The attacks transfer upward to models they were never tuned against: 61.7% on Mistral-7B, 51.6% on Qwen-2.5-7B.
   - Defense: one round of QLoRA supervised fine-tuning drops ASR to 6.4% (-21.2 percentage points, p < 0.0001, paired bootstrap 95% CI [-23.5, -18.9]), with helpfulness retention rising to 99.6% and false refusals falling to 0.4%.
   - Negative result he published: stacking DPO on top of the SFT checkpoint regressed safety back to 21.5%. DPO exists to correct over-refusal caused by safety training; when there is no over-refusal to correct, it eats the safety margin.
   - Dataset: MediCS-500, 500 expert-curated harmful seeds plus 500 benign twins, code-switched into 6 languages with back-translation verification, so susceptibility and over-refusal are measured together.
   - Evaluation: 3 checkpoints x 3 seeds x 1,599 held-out attacks, GPT-5 judge at temperature 0, McNemar with Holm-Bonferroni across languages, Cohen's h, residual-failure breakdown, cross-architecture transfer, and a fairness audit treating language as the protected attribute. 213 tests.

2. **Mnemo: Agent Memory With a Write-Time Quality Gate** (Jun 2026 - Jul 2026)
   - Not published publicly yet, so there is no link to give out. Do not invent one.
   - Skills: Python, Postgres + pgvector, event sourcing, MCP server, FastAPI, Ollama.
   - Problem: agent memory stores mostly junk and invents false facts from negations and hypotheticals. Mem0 issue #4573 is the public example, where 97.8% of 10,134 entries were noise.
   - Approach: a write-path gate (extract, verify, dedup, score, tier, decay) on top of an append-only bitemporal Postgres store. Negations and hypotheticals are rejected before they become memories; borderline facts are demoted to a session tier instead of guessed at, so recall is protected.
   - Result, naive vs gated on the same conversation and extractor: precision 60% to 90%, F1 75% to 94.7%, false memories 2 to 0, recall held at 100%.
   - Reproducible: make eval runs with a deterministic embedder, no model, no network, no API key.
   - Reversibility: an immutable event log is the source of truth and current state is a SQL view of HEAD. blame gives provenance and the reason for any belief, revert rolls a fact back, invalidate retires it bitemporally, diff shows belief changes over time. Nothing is overwritten.
   - Forgetting: Ebbinghaus decay (R = e^(-t/S)), recall reinforces, faded facts archived via an appended event rather than deleted.
   - Surface: MCP server with 8 tools, Python SDK, web UI for audit and revert, hybrid FTS + vector retrieval reranked on relevance/recency/importance. 88 tests, local-first and self-hostable.

3. **AdaTTT: Deciding When a Vision-Language Model Should Adapt** (Mar 2026 - Jul 2026)
   - Link: https://github.com/Yugesh-reddy/AdaTTT-Adaptive-Test-Time-Training
   - Skills: PyTorch, CLIP ViT-B/16, test-time adaptation (MEMO/TENT-style), pre-registered evaluation, selective prediction, Colab A100 orchestration.
   - Problem: test-time adaptation takes gradient steps on every test sample, including the easy ones where the compute is wasted.
   - Approach: a learned gate supervised on the correctness delta between the base and adapted forward passes, so it predicts "would adaptation help here?" rather than "is the base model right?" — then a measurement of how much that gate can actually buy under distribution shift.
   - Encoder finding: holding the fusion stack fixed and swapping frozen ViT-B/16 + BERT for CLIP ViT-B/16 moved VQA-v2 val from 59.93 to 67.50 official soft accuracy, a controlled +7.57 point encoder effect.
   - Debugging: three silent training bugs found in gradients and optimizer state — the gate's auxiliary loss outweighing the answer loss 19x on the fusion gradient, <UNK> as a positive training target on 31% of questions, and a metric that credited those answers. Each fixed with a regression test.
   - Adaptation result: gaussian noise costs 6.40 points. MEMO-style adaptation was tested at three operating points, including a step size and a benefit-predicting gate both chosen on held-out data. Best result +0.18 points, 95% CI -0.11 to +0.47, against a +1.72 point per-sample oracle. No available signal predicts which samples benefit above AUROC 0.57, which is the honest limit of gating adaptation here.
   - Where the gate pays: confidence-based abstention. One threshold fit on a held-out split raises accuracy on answered questions by 5.3 points at 90% coverage and 10.4 at 80%, holds across clean, blurred and noised images, and costs no extra compute. Under heavy noise, answering the confident 80% beats the clean model answering everything.
   - Engineering: pre-registered selection and stop rules, an evaluation split sealed until each method was frozen in git, deployment-accurate FLOP accounting, preemption-safe Colab A100 orchestration tested across 18 simulated failure scenarios, 280 tests in CI, an answer-or-abstain demo, and a release whose artifacts rebuild every number and figure byte-for-byte on a CPU.
   - Context: built for CS 518 (Deep Learning for Computer Vision, UIC) with Aishwarya Reddy Chinthalapudi and Aryan Shetty, and developed further since.

4. **Melanoma Tissue Volumes: 3D Pathology and a Grounded AI Agent** (Dec 2025 - Jun 2026)
   - Link: https://github.com/Yugesh-reddy/Melanoma-Tissue-Volumes
   - Skills: React, Three.js / WebGL, GLSL, D3.js, LLM tool use, CyCIF.
   - What it is: a browser application that renders a 70-channel melanoma biopsy as an interactive 3D point cloud, computes a deterministic pathology analysis of any region the user draws, and layers an AI assistant that explains findings and can operate the app.
   - Trust design: a deterministic engine computes per-marker statistics, 14 candidate cell populations, immune-hot/cold microenvironment classification, checkpoint and exhaustion signals, and a proliferation index. The LLM may only explain numbers the engine already produced, so it structurally cannot invent a finding.
   - Agentic safety: 24 tools driven through a bounded plan-act-observe loop, with fenced-block-only execution, schema validation with argument stripping, context-scoped allowlists, human confirmation on destructive actions, full undo, and per-turn tracing.
   - Rendering: GPU instancing puts each channel in one draw call, custom GLSL shaders position voxels via instanced buffer attributes, adaptive level-of-detail gives roughly 64x fewer instances when zoomed out, and channel toggles rebuild only what changed.
   - Privacy: zero backend, no database, no server-side rendering. Voxel data is static files and the model is a local OpenAI-compatible endpoint the browser calls directly, so patient tissue data never leaves the machine.
   - Context: Visual Data Science at UIC, with Dr. Lei Duan and Dr. Carl Maki of Rush University, on the BiomedVis Challenge 2025 specimen LSP13626.

5. **Gambit: A Model Router He Killed When the Evidence Did Not Hold** (July 2025 - Aug 2026)
   - Link: https://github.com/Yugesh-reddy/Gambit
   - Skills: Python, FastAPI, calibration, pre-registered evaluation, Azure AI Foundry, Docker.
   - IMPORTANT: this is a negative result and should always be described as one. Never state that Gambit matched frontier accuracy or achieved a cost saving as a finished result. The strong numbers that exist are from a simulation and did not survive real benchmarks.
   - Thesis: a three-tier router (local cheap, paid mid, paid frontier) on the idea that most queries do not need the best available model. It looked excellent in a controlled mock.
   - What real models showed: on a 498-query mixed battery (GSM8K, MMLU-Pro, SimpleQA, tokenizer-bound counting) the trained controller reached 0.596 accuracy against a 0.768 frontier baseline. Later policies closed the accuracy gap but missed the cost bar, or met the cost bar only by under-escalating. No variant passed both.
   - The kill switch: Stage 1's prompt-only complexity scorer had a held-out within-GSM8K AUC of 0.523, a coin flip, against a pre-registered 0.65 ship gate. Pooled AUC of 0.779 looked fine, which was the trap: it separated datasets, not hard queries from easy ones. He stopped rather than tune until something passed.
   - Discipline: docs/EVAL_CONTRACT.md pre-registered the model ladder, one-sided McNemar for accuracy, a 3pp non-inferiority margin, and a 25% cost floor. Amendments landed before any code change or further paid spend. The README shipped with no headline number because nothing passed the contract.
   - What survives: the serving tier is real. OpenAI wire protocol with streaming, per-key budget caps returning HTTP 402, X-Gambit-* decision headers, an offline replay store for free policy re-sweeps, fail-closed handling of truncated and empty provider responses, 320+ tests.

6. **LLM Reasoning & Factuality: What Actually Helps, and Where** (Sept 2025)
   - Link: https://github.com/Yugesh-reddy/LLM-Reasoning-and-Factuality
   - Skills: Python, self-consistency, ReAct, RAG, Ollama, Streamlit.
   - Three inference-time techniques implemented from scratch and run on the same tasks across local Ollama models and hosted APIs.
   - Self-consistency: 15-25% accuracy gain on local Llama 3.2 and Mistral, only 2-5% on GPT-4, which is already internally consistent. It amplifies weak reasoners and does little else.
   - ReAct: a thought-action-observation loop over Serper search, Wikipedia, and SymPy. 40-60% better factual accuracy for local models on recent events, 10-15% for GPT-3.5.
   - RAC (retrieval-augmented correction): decomposes a response into atomic claims, retrieves evidence, verifies, and rewrites only the false ones. 30-50% fewer factual errors, and the only technique of the three that helped local and API models alike.

7. **Fleet: Flutter Road-Trip Planner** (Jan 2023 - Oct 2023)
   - Link: https://github.com/Yugesh-reddy/Fleet--Flutter-Travel-App
   - Skills: Flutter / Dart, Firebase, Google Maps API, Google Places API.
   - Undergrad cross-platform trip planner: filterable destinations, live travel-cost estimates from real route data, nearby hotels and restaurants with ratings, Firebase auth and cloud sync.

---

## Technical Skills & Tech Stack

- **Languages**: Python, TypeScript, JavaScript, Dart, Shell Scripting (Bash/Zsh), SQL, C++
- **AI & Machine Learning**: PyTorch, Transformers, Hugging Face, TRL (SFT/DPO), PEFT / LoRA / QLoRA, TensorFlow, scikit-learn, NumPy, pandas, OpenCV, Jupyter
- **LLM Ops & Safety**: Red teaming, adversarial attacks (jailbreaks, code-switching), RAG, ReAct, model routing and inference cost control, LangChain, LangGraph, LangSmith, vector DBs (Pinecone, Chroma, FAISS), Ollama, OpenRouter
- **Evaluation**: Bootstrap confidence intervals, McNemar tests, Holm-Bonferroni correction, effect sizes, LLM-as-judge pipelines, ablation design, algorithmic fairness audits
- **Backend & Cloud**: FastAPI, Docker, Kubernetes, Helm, Cloudflare (D1, KV), Firebase, AWS
- **Frontend & Web**: React, Next.js, Tailwind CSS, TypeScript, Three.js, WebGL, D3.js
- **Testing & Tools**: Git, GitHub, Linux, pytest, Mocha, Figma

---

## Certifications

1. **AWS Certified AI Practitioner** (Amazon Web Services, Issued July 2026)
2. **Basic Life Support (BLS) Provider** (American Heart Association, Issued April 2025)
3. **The Complete 2024 Web Development Bootcamp** (Udemy, Issued January 2024)

---

## Articles & Blog Posts

1. **Why medical code-switching jailbreaks are a serious safety problem** (/blog/medical-code-switching-jailbreaks): aligned models refuse a harmful medical request in English and comply when the same request mixes languages mid-sentence. Both a fairness failure and a real attack surface, and the reason MediCS exists.
2. **Why DPO sometimes makes safety worse: a cautionary result** (/blog/why-dpo-fails-on-top-of-sft): layering DPO on a working safety SFT checkpoint regressed safety by 15 points. The mechanism, and the rule it implies about when DPO's premise holds.
3. **Building an adaptive red-team attacker** (/blog/adaptive-red-team-attacker): the five multilingual attack techniques in MediCS and the Thompson-Sampling bandit that learns which one to use per harm category, instead of firing a fixed template battery.
4. **Building Melanoma Tissue Volumes** (/blog/building-melanoma-tissue-volumes): a zero-backend browser tool that renders a 70-channel microscopy volume in 3D, analyzes any region deterministically, and wraps it in a grounded, safely agentic AI assistant.
`
