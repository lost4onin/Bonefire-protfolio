---
project: LUMIO
summary: AI-powered early attention detection and learning support. Tracks student focus in real time and gives evidence-grounded guidance.
role: Co-founder, AI and full-stack # TODO(Akrem): confirm exact role
team: TODO # TODO(Akrem): team size
period: '2025' # TODO(Akrem): confirm
stack: [MediaPipe WASM, XGBoost, Ensemble models, LangChain, FAISS, RAG, n8n, JavaScript, Python]
links: {} # TODO(Akrem): live / repo / demo video
relicName: Lantern of Focus
lore: >-
  A lantern that burns brighter when the mind is present and dims when it wanders.
  Forged for those who learn differently, so that no student is lost in the fog unseen.
skill:
  name: Vigil
  text: Watches attention in real time through the camera, entirely in the browser, and calls upon three counsellors who answer only from trusted scrolls.
scaling:
  - { attr: Computer Vision, grade: A }
  - { attr: Machine Learning, grade: A }
  - { attr: RAG, grade: B }
  - { attr: Automation, grade: B }
image: /images/relics/lumio.webp # TODO: add image
order: 1
featured: true
boss: sight-day
---

<!-- TRIAL CASE STUDY. Keep the five H2s in this exact order. Replace every TODO with Akrem's real words. -->

## The Foe

Early attention difficulties are often noticed late, after a student has already fallen behind. Teachers and parents need signals that are early, objective, and explained, not a black-box score.

<!-- TODO(Akrem): who exactly is the user? what triggered the project? any numbers on the problem? -->

## The Arms

- **In-browser vision:** MediaPipe WASM tracks face and gaze signals on the student's device. No video leaves the machine. <!-- TODO: confirm privacy claim -->
- **Classification:** XGBoost and ensemble models turn those signals into focus / distraction states.
- **Guidance:** three AI assistants built on a LangChain + FAISS RAG engine, grounded in evidence.
- **Orchestration:** every workflow runs through n8n, so it is transparent and auditable.

<!-- TODO(Akrem): architecture diagram (export as /images/relics/lumio-architecture.webp) -->

## The Battle

<!-- TODO(Akrem): the 2–3 hardest problems (e.g. real-time performance in WASM, labelling data, avoiding hallucinated advice) and the decision you made for each. -->

## Victory

- **1st place, Sight Day Congress Technical Challenge** (LUMIO and cognitive diseases).

<!-- TODO(Akrem): metrics — accuracy, latency, users tested, startup status -->

## Spoils

<!-- TODO(Akrem): what you learned; what you would do differently. -->
