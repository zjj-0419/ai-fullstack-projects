import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const checks = [
  "Clear trigger scenarios",
  "Defines required inputs",
  "Includes validation steps",
  "Has publishing notes"
];

app.post("/api/skills/draft", (req, res) => {
  const { product = "VoiceMe", audience = "creator", goal = "publish a skill" } = req.body;
  const score = Math.min(98, 58 + product.length + audience.length + goal.length);
  res.json({
    title: `${product} ${audience} Skill`,
    score,
    readme: `# ${product} ${audience} Skill\n\nUse this skill when a ${audience} needs to ${goal}.\n\n## Workflow\n1. Capture intent\n2. Generate a draft\n3. Validate edge cases\n4. Publish with review notes`,
    checklist: checks.map((label, index) => ({ label, passed: index < Math.ceil(score / 25) })),
    publishPlan: ["Draft metadata", "Run quality review", "Create release notes", "Submit for approval"]
  });
});

app.listen(4001, () => console.log("Skill Forge API running on http://127.0.0.1:4001"));
