import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let skills = [
  { id: "skill_growth_notes", name: "Growth Notes Writer", owner: "Creator Tools", category: "writing", status: "review", installs: 1280, rating: 4.6, risk: "low" },
  { id: "skill_voice_brief", name: "Voice Brief Builder", owner: "VoiceMe Lab", category: "voice", status: "approved", installs: 3420, rating: 4.8, risk: "low" },
  { id: "skill_auto_publish", name: "Auto Publish Planner", owner: "Workflow Team", category: "operations", status: "review", installs: 920, rating: 4.3, risk: "medium" },
  { id: "skill_meeting_to_tasks", name: "Meeting To Tasks", owner: "Team Spaces", category: "productivity", status: "experiment", installs: 2180, rating: 4.5, risk: "low" }
];

function scoreSkill(skill) {
  const adoption = Math.min(35, Math.round(skill.installs / 120));
  const quality = Math.round(skill.rating * 10);
  const riskPenalty = skill.risk === "medium" ? 12 : 0;
  return Math.min(98, adoption + quality - riskPenalty);
}

app.get("/api/marketplace", (_req, res) => {
  const reviewed = skills.filter((skill) => skill.status === "approved").length;
  res.json({
    metrics: {
      totalSkills: skills.length,
      approved: reviewed,
      reviewQueue: skills.filter((skill) => skill.status === "review").length,
      avgRating: 4.55
    },
    skills: skills.map((skill) => ({ ...skill, score: scoreSkill(skill) })),
    experiments: [
      { name: "Voice creator onboarding", variant: "publish checklist first", lift: 18, status: "running" },
      { name: "Skill cards ranking", variant: "quality weighted sort", lift: 11, status: "ready" }
    ]
  });
});

app.get("/api/skills/:id/review", (req, res) => {
  const skill = skills.find((item) => item.id === req.params.id);
  if (!skill) return res.status(404).json({ error: "Skill not found" });
  res.json({
    skill: { ...skill, score: scoreSkill(skill) },
    checklist: [
      { label: "Clear user trigger", passed: true },
      { label: "No secret collection", passed: true },
      { label: "Fallback path defined", passed: skill.risk === "low" },
      { label: "Release notes included", passed: skill.status !== "review" }
    ],
    recommendation: skill.risk === "medium" ? "Request changes before rollout." : "Approve for staged rollout.",
    rollout: ["5% creators", "25% active teams", "100% marketplace listing"]
  });
});

app.post("/api/skills/:id/status", (req, res) => {
  const { status } = req.body;
  if (!["review", "approved", "experiment", "rejected"].includes(status)) return res.status(400).json({ error: "Invalid status" });
  skills = skills.map((skill) => skill.id === req.params.id ? { ...skill, status } : skill);
  res.json({ ok: true, skill: skills.find((skill) => skill.id === req.params.id) });
});

app.listen(4005, () => console.log("Skill Marketplace Admin API running on http://127.0.0.1:4005"));
