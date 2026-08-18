# Voice Agent Studio

Voice Agent Studio is a fullstack console for routing voice transcripts into AI actions, planning tool calls, and reviewing quality guardrails before automation runs.

## Features

- Session inbox with intent, confidence, latency, and review status.
- Detail view with transcript timeline, tool plan, and QA guidance.
- Live transcript analyzer that classifies intent and returns next actions.
- Node/Express API with validation, route-level data, and deterministic mock AI.

## Run

```bash
npm install
npm run dev
```

Frontend: `http://127.0.0.1:5176`  
API: `http://127.0.0.1:4004`

## Interview Talking Points

- Demonstrates voice product thinking beyond a static chat UI.
- Shows how AI output can be routed through tool planning and human review.
- Clear place to replace mock routing with a real LLM, speech-to-text provider, or workflow engine.
