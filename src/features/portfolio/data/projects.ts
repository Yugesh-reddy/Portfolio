import type { Project } from "../types/projects"

export const PROJECTS: Project[] = [
  {
    id: "medics",
    title: "MediCS: Red-Teaming and Defending a Medical LLM",
    period: { start: "02.2026", end: "05.2026" },
    link: "https://github.com/Yugesh-reddy/MediCS-Red-Teaming",
    skills: [
      "PyTorch",
      "Llama 3 / QLoRA",
      "TRL (SFT + DPO)",
      "PEFT",
      "Red Teaming",
      "Statistical Evaluation",
    ],
    description: `A closed-loop red-teaming and defense framework for medical LLMs, built around one uncomfortable finding: safety alignment holds in English and leaks badly the moment a prompt switches languages mid-sentence.

- **The attack.** An agentic red team runs 5 strategies across 6 low-resource languages and 6 harm categories. A Thompson-Sampling bandit per category learns which strategy actually lands, instead of firing a fixed battery of templates and reporting the total.
- **What it exposed.** 27.6% attack success rate on Llama-3-8B-Instruct. The attacks then transfer *upward* to models they were never tuned against: 61.7% on Mistral-7B, 51.6% on Qwen-2.5-7B.
- **The defense.** One round of QLoRA supervised fine-tuning on red-team output cuts ASR to 6.4% (−21.2 pp, *p* < 0.0001, paired bootstrap 95% CI [−23.5, −18.9]). Helpfulness retention goes *up* to 99.6% and false refusals drop to 0.4%, so the model did not just learn to refuse everything.
- **The negative result I shipped anyway.** Stacking DPO on the SFT checkpoint regressed safety back to 21.5%. DPO's whole premise is correcting over-refusal caused by safety training. When there is no over-refusal to correct, it eats the safety margin instead. I wrote that up rather than quietly dropping the run.
- **MediCS-500.** 500 expert-curated harmful seeds plus 500 benign twins, code-switched into 6 languages with back-translation verification, so jailbreak susceptibility and over-refusal are measured on the same benchmark.
- **Evaluation.** 3 checkpoints × 3 seeds × 1,599 held-out attacks, judged by GPT-5 at temperature 0. McNemar with Holm-Bonferroni across languages, Cohen's *h*, residual-failure breakdown, cross-architecture transfer, and a fairness audit that treats language as the protected attribute. 213 tests.`,
    logo: "/icons/medics.svg",
    isExpanded: true,
  },
  {
    id: "mnemo",
    title: "Mnemo: Agent Memory With a Write-Time Quality Gate",
    period: { start: "06.2026", end: "07.2026" },
    skills: [
      "Python",
      "Postgres + pgvector",
      "Event Sourcing",
      "MCP Server",
      "FastAPI",
      "Ollama",
    ],
    description: `Agent memory has two diseases: it stores mostly junk, and it invents false facts out of negations and hypotheticals. Mem0 issue #4573 is the clearest public example, where 97.8% of 10,134 stored entries were noise. Mnemo puts a quality gate on the write path and an append-only, bitemporal Postgres store underneath it.

- **The gate.** Every turn runs extract, verify, dedup, score, tier, decay. Negations ("I *don't* use MongoDB") and hypotheticals are rejected before they can become memories. Borderline facts get demoted to a session tier rather than guessed at, so recall is never traded for precision.
- **Measured against a naive baseline, on the same conversation and extractor.** Precision 60% to 90%, F1 75% to 94.7%, false memories 2 to 0, recall held at 100%. The gate is not just storing less; it is storing the right things.
- **You can run the number yourself.** \`make eval\` uses a deterministic embedder with no model, no network, and no API key, so the headline reproduces on any machine in one command.
- **Every decision is reversible.** An immutable event log is the source of truth and current state is just a SQL view of HEAD. \`blame\` says which turn introduced a belief and why it scored what it did; \`revert\` rolls a fact back; \`invalidate\` retires it bitemporally; \`diff\` shows how beliefs changed between two points in time. Nothing is ever overwritten.
- **Principled forgetting.** Ebbinghaus decay (R = e^(−t/S)) fades unused facts, recall reinforces them, and faded facts are archived through an appended event rather than deleted.
- **Shipped as a product surface.** MCP server with 8 tools, a Python SDK, a web UI for the audit-and-revert flow, and hybrid FTS plus vector retrieval reranked on relevance, recency, and importance. 88 tests, local-first, self-hostable.`,
    logo: "/icons/mnemo.svg",
    isExpanded: true,
  },
  {
    id: "adattt",
    title:
      "AdaTTT: Test-Time Adaptation That Did Not Pay, and the Fallback That Did",
    period: { start: "03.2026", end: "07.2026" },
    link: "https://github.com/Yugesh-reddy/AdaTTT-Adaptive-Test-Time-Training",
    skills: [
      "PyTorch",
      "CLIP ViT-B/16",
      "Test-Time Adaptation",
      "Pre-Registered Evaluation",
      "Selective Prediction",
      "Colab A100 Orchestration",
    ],
    description: `The course version put a learned gate in front of test-time training. The follow-up asked the harder question: under real distribution shift, does adaptation recover anything worth its compute, and if not, what does? Every experiment was pre-registered, and the evaluation split stayed sealed until the method was frozen in git.

- **The encoder was the ceiling, not the adaptation.** Swapping frozen ViT-B/16 + BERT for CLIP ViT-B/16, with the fusion stack held fixed, moved VQA-v2 val from 59.93 to 67.50 official soft accuracy. The +7.57 point gap is the controlled encoder effect; v1 had been tuning the wrong component.
- **Three silent bugs, found in the gradients.** The first run looked plausible and was broken: the gate's auxiliary loss outweighed the answer loss 19× on the fusion gradient, \`<UNK>\` was a positive training target on 31% of questions, and the logged metric credited those \`<UNK>\` answers. Each fix shipped with a regression test.
- **Adaptation did not pay.** Gaussian noise costs 6.40 points. MEMO-style adaptation was tested at the original step size, at a step size chosen on held-out data, and behind a gate trained to predict per-sample benefit. The best result is +0.18 points, 95% CI −0.11 to +0.47. A per-sample oracle shows +1.72 is there to recover, so the headroom is real — but nothing I logged predicts *who* benefits above AUROC 0.57. That, not the step size, is the limit.
- **The protocol was the point.** Selection and stop rules lived in code before each run, the gate specification had to be committed before the scorer would read the evaluation outcomes, and FLOPs counted what a served request actually runs, including the backward pass through every augmented view. Results reproduced exactly across sessions.
- **What did work: knowing when not to answer.** One confidence threshold, fit on a held-out split, raises accuracy on the answered questions by 5.3 points at 90% coverage and 10.4 at 80%, and holds across clean, blurred and noised images at no extra compute. Under heavy noise, answering the confident 80% beats the clean model answering everything.
- **Built to be checked.** Preemption-safe Colab A100 orchestration (token refresh, orphan-VM recovery, verified checkpoint relay, hard budget cap) tested against a simulated Colab across 18 failure scenarios, 280 tests in CI, an answer-or-abstain demo, and a published release whose artifacts rebuild every number and figure byte-for-byte on a CPU.

Began as a course project for CS 518 (Deep Learning for Computer Vision, UIC) with Aishwarya Reddy Chinthalapudi and Aryan Shetty; the follow-up study above is the solo continuation.`,
    logo: "/icons/adattt.svg",
    isExpanded: false,
  },
  {
    id: "melanoma-tissue-volumes",
    title: "Melanoma Tissue Volumes: 3D Pathology and a Grounded AI Agent",
    period: { start: "12.2025", end: "06.2026" },
    link: "https://github.com/Yugesh-reddy/Melanoma-Tissue-Volumes",
    skills: [
      "React",
      "Three.js / WebGL",
      "GLSL",
      "D3.js",
      "LLM Tool Use",
      "CyCIF",
    ],
    description: `A browser application that renders a 70-channel melanoma biopsy as an interactive 3D point cloud, computes a deterministic pathology analysis of any region you draw, and puts an AI assistant on top that can explain the findings and drive the app for you. Built on the BiomedVis Challenge 2025 specimen with Dr. Lei Duan and Dr. Carl Maki of Rush University.

- **The separation that makes it trustworthy.** A deterministic engine produces the numbers: per-marker statistics, 14 candidate cell populations, immune-hot/cold microenvironment classification, checkpoint and exhaustion signals, proliferation index. The LLM is only ever allowed to explain numbers the engine already computed, so it structurally cannot invent a finding. That is the difference between this and a chat wrapper.
- **Agentic, with an actual safety model.** A catalog of 24 tools lets the assistant toggle channels, draw selections, change views, and compare regions through a bounded plan-act-observe loop, guarded by fenced-block-only execution, schema validation with argument stripping, context-scoped allowlists, human confirmation on destructive actions, full undo, and per-turn tracing.
- **Millions of voxels at interactive framerates.** GPU instancing renders each channel in one draw call instead of millions, custom GLSL shaders position voxels from instanced buffer attributes, adaptive level-of-detail coarsens sampling with camera distance (roughly 64× fewer instances when zoomed out), and toggling a channel rebuilds only that channel.
- **Nothing leaves the machine.** No backend, no database, no server-side rendering. Voxel data is served as static files and the model is a local OpenAI-compatible endpoint the browser talks to directly, which matters when the data is patient tissue.
- **Four coordinated panels**, including a PCA-derived principal-axis view with a coherence metric, plus per-marker distributions in bar, violin, and composition form.

Course project for Visual Data Science at UIC.`,
    logo: "/icons/melanoma.svg",
    isExpanded: false,
  },
  {
    id: "gambit",
    title: "Gambit: A Model Router I Killed When the Evidence Did Not Hold",
    period: { start: "07.2025", end: "08.2026" },
    link: "https://github.com/Yugesh-reddy/Gambit",
    skills: [
      "Python",
      "FastAPI",
      "Calibration",
      "Pre-Registered Evaluation",
      "Azure AI Foundry",
      "Docker",
    ],
    description: `A three-tier LLM router (local cheap, paid mid, paid frontier) built on the thesis that most queries do not need the best model you can afford. In simulation it looked excellent. On real benchmarks it did not hold, so I shut it down. This entry is the postmortem, not a pitch.

- **What the thesis predicted.** A controlled mock with a tunable error-correlation knob showed the trained controller matching frontier accuracy at a large cost saving. That number was always labeled as simulated, and it is the reason the project ran as long as it did.
- **What real models showed.** On a 498-query mixed battery (GSM8K, MMLU-Pro, SimpleQA, tokenizer-bound counting), the trained controller reached 0.596 accuracy against a frontier baseline of 0.768. Later policies closed the accuracy gap but missed the cost bar, or hit the cost bar only by under-escalating. No variant ever passed both.
- **The kill switch, and why I built one first.** Stage 1 was a prompt-only complexity scorer. Its held-out *within-benchmark* AUC on GSM8K came out at 0.523, a coin flip, against a pre-registered ship gate of 0.65. Pooled AUC looked fine at 0.779, which is exactly the trap: it was separating datasets, not hard queries from easy ones. A band router, not a query-adaptive one. I stopped iterating rather than tune until something passed.
- **The contract came before the result.** \`docs/EVAL_CONTRACT.md\` fixed the model ladder, the accuracy test (one-sided McNemar, not a hand-picked epsilon), a non-inferiority margin of 3pp, and a 25% cost floor, all pre-registered. Every amendment landed before any code change or further paid generation. The README shipped with no headline number because nothing passed the contract.
- **What I would keep.** The serving tier is real: OpenAI wire protocol with streaming, per-key budget caps returning HTTP 402, \`X-Gambit-*\` decision headers, an offline replay store so any policy can be re-swept for free, fail-closed handling of truncated and empty provider responses, and 320+ tests.

The engineering was sound. The hypothesis was not, and a negative result you can explain is worth more than a positive one you cannot defend.`,
    logo: "/icons/gambit.svg",
    isExpanded: false,
  },
  {
    id: "llm-reasoning-factuality",
    title: "LLM Reasoning & Factuality: What Actually Helps, and Where",
    period: { start: "09.2025" },
    link: "https://github.com/Yugesh-reddy/LLM-Reasoning-and-Factuality",
    skills: [
      "Python",
      "Self-Consistency",
      "ReAct",
      "RAG",
      "Ollama",
      "Streamlit",
    ],
    description: `Three inference-time techniques for reasoning and factuality, implemented from scratch and run on the same tasks across local Ollama models and hosted APIs, so the comparison is honest rather than three separate demos.

- **Self-consistency.** Samples multiple chain-of-thought traces and aggregates by majority vote. Worth 15-25% accuracy on local Llama 3.2 and Mistral, but only 2-5% on GPT-4, which is already internally consistent. Cost scales linearly with samples, so it pays off exactly where the model is weak and nowhere else.
- **ReAct.** A thought-action-observation loop wired to Serper search, Wikipedia, and SymPy. 40-60% better factual accuracy for local models on recent events, 10-15% for GPT-3.5. Tool access is what closes the gap between a small local model and a large hosted one.
- **RAC (retrieval-augmented correction).** Decomposes a response into atomic claims, retrieves evidence for each, verifies them, and rewrites only the false ones while keeping the rest intact. 30-50% reduction in factual errors, and the only one of the three that helped local and API models alike.
- **The takeaway.** These are not interchangeable. Self-consistency amplifies weak reasoners, ReAct handles queries needing fresh information, RAC is post-hoc factuality repair. Reaching for the wrong one costs real money and buys nothing.`,
    logo: "/icons/llm-reasoning.svg",
    isExpanded: false,
  },
  {
    id: "fleet",
    title: "Fleet: Flutter Road-Trip Planner",
    period: { start: "01.2023", end: "10.2023" },
    link: "https://github.com/Yugesh-reddy/Fleet--Flutter-Travel-App",
    skills: [
      "Flutter / Dart",
      "Firebase",
      "Google Maps API",
      "Google Places API",
    ],
    description: `A cross-platform road-trip planner from my undergrad years: pick where you are going, find out what the trip actually costs, and see where to stay and eat along the way.

- Curated, filterable destinations with live travel-cost estimates computed from real distance and route data through the Google Maps API.
- Nearby hotels and restaurants for each stop with ratings and distance, via Google Places.
- Firebase auth and cloud sync so plans persist across devices, with recommendations that shift based on previous trips.`,
    logo: "/icons/fleet.svg",
    isExpanded: false,
  },
]
