import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const keywords = ["React", "Node", "AI", "Skill", "JavaScript", "product", "API", "frontend"];

app.post("/api/match", (req, res) => {
  const { job = "", resume = "" } = req.body;
  const text = `${job} ${resume}`.toLowerCase();
  const hits = keywords.filter((keyword) => text.includes(keyword.toLowerCase()));
  const score = Math.round((hits.length / keywords.length) * 100);
  res.json({
    score,
    hits,
    gaps: keywords.filter((keyword) => !hits.includes(keyword)),
    bullets: [
      `Built React product flows connected to Node API services.`,
      `Used AI-assisted development to speed up feature design and iteration.`,
      `Created a Skill publishing workflow with quality gates and release notes.`
    ],
    interviewQuestions: [
      "How would you evaluate whether an AI feature improves user value?",
      "How do you keep a React product flow maintainable as experiments grow?",
      "Where would you place validation between frontend, backend, and model output?"
    ]
  });
});

app.listen(4002, () => console.log("Interview Copilot API running on http://127.0.0.1:4002"));
