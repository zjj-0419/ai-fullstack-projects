import express from "express";
import cors from "cors";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
app.use(cors());
app.use(express.json());

const dataFile = join(dirname(fileURLToPath(import.meta.url)), "data", "sessions.json");

const tools = {
  create_skill: ["extract goal", "draft skill.md", "run publish checklist"],
  summarize_and_assign: ["summarize transcript", "detect owners", "create task payload"],
  publish_review: ["scan metadata", "score safety", "generate release notes"]
};

const intentRules = [
  { intent: "publish_review", keywords: ["publish", "safe", "review", "checklist"] },
  { intent: "summarize_and_assign", keywords: ["assign", "task", "team", "workspace", "summary"] },
  { intent: "create_skill", keywords: ["skill", "voice note", "creator", "reusable"] }
];

async function loadSessions() {
  return JSON.parse(await readFile(dataFile, "utf8"));
}

async function saveSessions(sessions) {
  await writeFile(dataFile, `${JSON.stringify(sessions, null, 2)}\n`);
}

function analyzeTranscript(transcript) {
  const words = transcript.toLowerCase();
  const ranked = intentRules
    .map((rule) => ({
      intent: rule.intent,
      hits: rule.keywords.filter((keyword) => words.includes(keyword)).length
    }))
    .sort((a, b) => b.hits - a.hits);
  const intent = ranked[0].hits > 0 ? ranked[0].intent : "create_skill";
  const confidence = Math.min(0.97, 0.72 + ranked[0].hits * 0.07);
  const risks = [
    ...(words.includes("safe") || words.includes("publish") ? ["requires publish policy check"] : []),
    ...(words.includes("assign") ? ["requires workspace permission"] : []),
    ...(transcript.length < 80 ? ["limited context"] : [])
  ];
  return {
    intent,
    confidence,
    sentiment: words.includes("urgent") ? "urgent" : words.includes("safe") ? "careful" : "focused",
    latency: 320 + transcript.length,
    toolPlan: tools[intent],
    risks: risks.length ? risks : ["missing success metric"],
    response: `Detected ${intent}. Next step: ${tools[intent][0]}.`
  };
}

function buildTimeline(session) {
  return [
    { step: "Speech captured", detail: "Streaming transcript normalized" },
    { step: "Intent routed", detail: `${session.intent} at ${Math.round(session.confidence * 100)}% confidence` },
    { step: "Tools planned", detail: tools[session.intent].join(" -> ") },
    { step: "QA result", detail: session.status === "review" ? "Human review recommended" : "Ready for automation" }
  ];
}

function buildQa(session) {
  const analysis = analyzeTranscript(session.transcript);
  const blockers = [
    ...(analysis.risks.includes("requires workspace permission") ? ["Confirm workspace permission before creating tasks."] : []),
    ...(analysis.risks.includes("requires publish policy check") ? ["Run publish safety checklist before release."] : [])
  ];
  return {
    hallucinationRisk: session.status === "review" || blockers.length ? "medium" : "low",
    blockers,
    missingContext: session.status === "review" ? ["owner confirmation", "target workspace"] : [],
    suggestedReply: `I can help with ${session.intent.replaceAll("_", " ")}. I will confirm the output before publishing or taking action.`
  };
}

function createRun(session) {
  const qa = buildQa(session);
  const blocked = qa.blockers.length > 0 && session.status !== "approved";
  return {
    id: `run_${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: blocked ? "blocked" : "completed",
    steps: tools[session.intent].map((name, index) => ({
      name,
      status: blocked && index === tools[session.intent].length - 1 ? "blocked" : "completed",
      output: blocked && index === tools[session.intent].length - 1
        ? qa.blockers.join(" ")
        : `${name} completed for ${session.speaker}.`
    }))
  };
}

app.get("/api/sessions", async (_req, res) => {
  const sessions = await loadSessions();
  res.json({
    sessions,
    metrics: {
      total: sessions.length,
      avgConfidence: Math.round(sessions.reduce((sum, session) => sum + session.confidence, 0) / sessions.length * 100),
      avgLatency: Math.round(sessions.reduce((sum, session) => sum + session.latency, 0) / sessions.length),
      reviewQueue: sessions.filter((session) => session.status === "review").length
    }
  });
});

app.post("/api/sessions", async (req, res) => {
  const { speaker = "", transcript = "" } = req.body;
  if (speaker.trim().length < 2) return res.status(400).json({ error: "Speaker is required" });
  if (transcript.trim().length < 12) return res.status(400).json({ error: "Transcript is too short" });
  const analysis = analyzeTranscript(transcript);
  const session = {
    id: `call_${Date.now()}`,
    speaker: speaker.trim(),
    transcript: transcript.trim(),
    intent: analysis.intent,
    confidence: analysis.confidence,
    sentiment: analysis.sentiment,
    latency: analysis.latency,
    status: analysis.risks.some((risk) => risk.startsWith("requires")) ? "review" : "ready",
    createdAt: new Date().toISOString(),
    runs: [],
    notes: []
  };
  const sessions = await loadSessions();
  sessions.unshift(session);
  await saveSessions(sessions);
  res.status(201).json({ session, analysis });
});

app.get("/api/sessions/:id", async (req, res) => {
  const sessions = await loadSessions();
  const session = sessions.find((item) => item.id === req.params.id);
  if (!session) return res.status(404).json({ error: "Session not found" });
  res.json({
    session,
    timeline: buildTimeline(session),
    qa: buildQa(session)
  });
});

app.patch("/api/sessions/:id/status", async (req, res) => {
  const { status, note = "" } = req.body;
  if (!["ready", "review", "approved", "blocked"].includes(status)) return res.status(400).json({ error: "Invalid status" });
  const sessions = await loadSessions();
  const index = sessions.findIndex((session) => session.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Session not found" });
  sessions[index] = {
    ...sessions[index],
    status,
    notes: note.trim() ? [...sessions[index].notes, note.trim()] : sessions[index].notes
  };
  await saveSessions(sessions);
  res.json({ session: sessions[index], qa: buildQa(sessions[index]) });
});

app.post("/api/sessions/:id/run", async (req, res) => {
  const sessions = await loadSessions();
  const index = sessions.findIndex((session) => session.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Session not found" });
  const run = createRun(sessions[index]);
  sessions[index] = {
    ...sessions[index],
    status: run.status === "blocked" ? "review" : "approved",
    runs: [run, ...sessions[index].runs]
  };
  await saveSessions(sessions);
  res.json({ run, session: sessions[index] });
});

app.get("/api/sessions/:id/report", async (req, res) => {
  const sessions = await loadSessions();
  const session = sessions.find((item) => item.id === req.params.id);
  if (!session) return res.status(404).json({ error: "Session not found" });
  const qa = buildQa(session);
  res.json({
    markdown: [
      `# Voice Agent Report: ${session.speaker}`,
      "",
      `- Intent: ${session.intent}`,
      `- Confidence: ${Math.round(session.confidence * 100)}%`,
      `- Status: ${session.status}`,
      `- Transcript: ${session.transcript}`,
      "",
      "## QA",
      `- Risk: ${qa.hallucinationRisk}`,
      ...qa.blockers.map((blocker) => `- Blocker: ${blocker}`),
      "",
      "## Runs",
      ...(session.runs.length ? session.runs.map((run) => `- ${run.id}: ${run.status}`) : ["- No runs yet"])
    ].join("\n")
  });
});

app.post("/api/analyze", (req, res) => {
  const { transcript = "" } = req.body;
  if (transcript.trim().length < 12) return res.status(400).json({ error: "Transcript is too short" });
  res.json(analyzeTranscript(transcript));
});

app.listen(4004, () => console.log("Voice Agent Studio API running on http://127.0.0.1:4004"));
