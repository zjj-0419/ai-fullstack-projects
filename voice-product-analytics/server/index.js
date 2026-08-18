import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/api/dashboard", (_req, res) => {
  const segments = [
    { name: "New creators", activation: 68, retention: 42, aiLift: 17 },
    { name: "Skill publishers", activation: 84, retention: 61, aiLift: 28 },
    { name: "Team workspaces", activation: 73, retention: 55, aiLift: 22 }
  ];
  res.json({
    summary: { sessions: 12840, publishRate: 36, avgLatency: 420, nps: 48 },
    segments,
    recommendations: [
      "Move Skill publish checklist earlier in onboarding.",
      "Add streaming feedback while voice drafts are converted into structured Skills.",
      "Create a retention experiment for creators who publish at least two Skills."
    ]
  });
});

app.listen(4003, () => console.log("Voice analytics API running on http://127.0.0.1:4003"));
