import type { Project } from "../types/projects"

export const PROJECTS: Project[] = [
  {
    id: "mnemo",
    title: "Mnemo: One Shared, Versioned Memory for Coding Agents",
    period: { start: "06.2026" },
    link: "https://github.com/Yugesh-reddy/Mnemo",
    skills: [
      "Python",
      "Postgres + pgvector",
      "MCP Server",
      "Event Sourcing",
      "Claude Code + Codex",
      "Agent Evaluation",
    ],
    description: `Claude Code and Codex forget everything between sessions, and neither knows what the other learned. Mnemo is one local memory both use over MCP, scoped to your repository, with every change attributed to an agent and reversible.

- **Where it started.** A write-time quality gate: extract facts from conversations, then verify, dedupe and score each one before storing it, because agent memory fills up with junk. On an 18-turn scripted test, precision rose from 60% to 90.9%.
- **Real conversations did not hold up.** Over eleven cycles with frozen protocols, small local extractors scored 1.41% strict precision on a 200-turn conversation. I wrote up each failure instead of tuning around it, and changed direction.
- **The pivot.** A coding agent already knows what mattered in its own session, so I parked extraction and let the agent decide what to save through six guarded MCP tools. History and undo exist elsewhere, so I competed on guarantees.
- **Guarantees in the database.** Postgres triggers reject edits to past events, updates must name the revision they read, and each change commits with an idempotency receipt, so stale writes fail and retries never apply twice.
- **Shared, with attribution.** At first Codex could not see what Claude Code saved, because reads were filtered by agent ID. Now each agent writes under its own name, into a project scope keyed by the git remote plus a global scope.
- **Measured with the real agents.** Ten scenarios drive 23 real Claude Code and Codex sessions. The baseline passed 4 of 10 because Codex never saved anything it was told. A short memory policy in its instructions took both agents to 10 of 10.
- **Installable by someone else.** \`uv tool install\`, then \`mnemo up\` and \`mnemo install\`. The installer checks dependencies, shows every config change before making it and uninstalls cleanly. Nothing leaves the machine. 450+ tests.
- **What's next.** Harder evals on real repositories and long sessions, with repeated runs reported as rates rather than single passes. Then more of the git layer: grouped undo, undoing a creation, and branching and merging memory.`,
    logo: "/icons/mnemo.svg",
    isExpanded: true,
  },
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
    id: "adattt",
    title: "AdaTTT: Deciding When a Vision-Language Model Should Adapt",
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
    description: `Test-time adaptation takes a few gradient steps on each test sample before answering, including on the easy ones where the compute is wasted. AdaTTT puts a learned gate in front of that decision, then asks how much the gate can actually buy: under real distribution shift, on frozen encoders, with every number defended.

- **The gate learns the right question.** It is supervised on the correctness *delta* between the base and adapted forward passes, so it predicts "would adaptation help here?" rather than "is the base model right?". Every later result is a measurement of how far that question can be pushed.
- **The encoder turned out to be the ceiling.** Holding the fusion stack fixed and swapping frozen ViT-B/16 + BERT for CLIP ViT-B/16 moved VQA-v2 val from 59.93 to 67.50 official soft accuracy, a controlled +7.57 point encoder effect that dwarfed anything adaptation was doing.
- **Three silent training bugs, found in the gradients.** A run that looked plausible was not: the gate's auxiliary loss outweighed the answer loss 19× on the fusion gradient, \`<UNK>\` was a positive training target on 31% of questions, and the logged metric credited those answers. Each fix shipped with a regression test.
- **Adaptation, measured honestly under shift.** Gaussian noise costs 6.40 points. MEMO-style adaptation was tested at three operating points, including a step size and a benefit-predicting gate both chosen on held-out data. Best result: +0.18 points, 95% CI −0.11 to +0.47, against a per-sample oracle of +1.72. The headroom is real; no available signal predicts who benefits above AUROC 0.57, which is the honest limit of gating adaptation here.
- **Where the gate pays: knowing when not to answer.** The same confidence signal, thresholded on a held-out split, raises accuracy on answered questions by 5.3 points at 90% coverage and 10.4 at 80%, holds across clean, blurred and noised images, and costs nothing extra. Under heavy noise, answering the confident 80% beats the clean model answering everything.
- **Built to be checked.** Pre-registered selection and stop rules, an evaluation split sealed until each method was frozen in git, FLOPs counted as a served request would pay them, preemption-safe Colab A100 orchestration tested across 18 simulated failure scenarios, 280 tests in CI, an answer-or-abstain demo, and a release whose artifacts rebuild every number and figure byte-for-byte on a CPU.`,
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
