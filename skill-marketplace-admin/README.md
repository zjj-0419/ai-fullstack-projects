# Skill Marketplace Admin

Skill Marketplace Admin is a fullstack operations console for reviewing, approving, experimenting with, and monitoring AI Skills before marketplace rollout.

## Features

- Marketplace dashboard with approval queue and quality metrics.
- Review detail panel with safety checklist and rollout plan.
- Status mutation API for approving or moving Skills into experiments.
- Publishing experiment tracker for product iteration.

## Run

```bash
npm install
npm run dev
```

Frontend: `http://127.0.0.1:5177`  
API: `http://127.0.0.1:4005`

## Interview Talking Points

- Aligns with Skill publishing, product operations, and AI safety review.
- Shows practical backend state mutation rather than only static mock data.
- Demonstrates how marketplace quality gates can connect product, engineering, and review workflows.
