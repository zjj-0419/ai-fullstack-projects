import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const sessions = [
  {
    id: "call_1048",
    speaker: "Creator onboarding",
    transcript: "I want to turn my three minute voice note into a reusable publishing skill.",
    intent: "create_skill",
    confidence: 0.94,
    sentiment: "focused",
    latency: 386,
    status: "ready"
  },
  {
    id: "call_1051",
    speaker: "Team workspace",
    transcript: "Can you summarize this voice brainstorm and assign tasks to the product team?",
    intent: "summarize_and_assign",
    confidence: 0.88,
    sentiment: "busy",
    latency: 442,
    status: "review"
  },
  {
    id: "call_1057",
    speaker: "Skill publisher",
    transcript: "Check whether this Skill is safe to publish and tell me what is missing.",
    intent: "publish_review",
    confidence: 0.91,
    sentiment: "careful",
    latency: 413,
    status: "ready"
  }
];

const tools = {
  create_skill: ["extract goal", "draft skill.md", "run publish checklist"],
  summarize_and_assign: ["summarize transcript", "detect owners", "create task payload"],
  publish_review: ["scan metadata", "score safety", "generate release notes"]
};

function analyzeTranscript(transcript) {
  const words = transcript.toLowerCase();
  const intent = words.includes("publish") ? "publish_review" : words.includes("assign") ? "summarize_and_assign" : "create_skill";
  return {
    intent,
    confidence: intent === "create_skill" ? 0.93 : 0.89,
    toolPlan: tools[intent],
    risks: words.includes("safe") ? ["needs policy checklist", "verify user consent"] : ["missing success metric"],
    response: `Detected ${intent}. Next step: ${tools[intent][0]}.`
  };
}

app.get("/api/sessions", (_req, res) => {
  res.json({
    sessions,
    metrics: {
      total: sessions.length,
      avgConfidence: 91,
      avgLatency: 414,
      reviewQueue: sessions.filter((session) => session.status === "review").length
    }
  });
});

app.get("/api/sessions/:id", (req, res) => {
  const session = sessions.find((item) => item.id === req.params.id);
  if (!session) return res.status(404).json({ error: "Session not found" });
  res.json({
    session,
    timeline: [
      { step: "Speech captured", detail: "Streaming transcript normalized" },
      { step: "Intent routed", detail: `${session.intent} at ${Math.round(session.confidence * 100)}% confidence` },
      { step: "Tools planned", detail: tools[session.intent].join(" -> ") },
      { step: "QA result", detail: session.status === "review" ? "Human review recommended" : "Ready for automation" }
    ],
    qa: {
      hallucinationRisk: session.status === "review" ? "medium" : "low",
      missingContext: session.status === "review" ? ["assignee permissions", "workspace id"] : [],
      suggestedReply: `I can help with ${session.intent.replaceAll("_", " ")}. I will confirm the output before publishing.`
    }
  });
});

app.post("/api/analyze", (req, res) => {
  const { transcript = "" } = req.body;
  if (transcript.trim().length < 12) return res.status(400).json({ error: "Transcript is too short" });
  res.json(analyzeTranscript(transcript));
});

app.listen(4004, () => console.log("Voice Agent Studio API running on http://127.0.0.1:4004"));
