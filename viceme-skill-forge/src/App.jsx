import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { WandSparkles, Rocket, CheckCircle2 } from "lucide-react";
import "./styles.css";

function App() {
  const [form, setForm] = useState({ product: "VoiceMe", audience: "podcast creator", goal: "turn raw voice ideas into reusable creation skills" });
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(false);

  async function generateDraft() {
    setLoading(true);
    const response = await fetch("http://127.0.0.1:4001/api/skills/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setDraft(await response.json());
    setLoading(false);
  }

  return (
    <main className="shell">
      <section className="toolbar">
        <div>
          <p className="eyebrow">AI Skill Builder</p>
          <h1>VoiceMe Skill Forge</h1>
        </div>
        <button onClick={generateDraft} disabled={loading}>
          <WandSparkles size={18} /> {loading ? "Generating" : "Generate"}
        </button>
      </section>
      <section className="grid">
        <form className="panel" onSubmit={(event) => event.preventDefault()}>
          {Object.entries(form).map(([key, value]) => (
            <label key={key}>
              <span>{key}</span>
              <textarea value={value} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
            </label>
          ))}
        </form>
        <section className="panel result">
          {draft ? (
            <>
              <div className="score"><Rocket /> Publish readiness {draft.score}</div>
              <h2>{draft.title}</h2>
              <pre>{draft.readme}</pre>
              <div className="checks">
                {draft.checklist.map((item) => (
                  <span className={item.passed ? "pass" : ""} key={item.label}><CheckCircle2 size={16} />{item.label}</span>
                ))}
              </div>
            </>
          ) : (
            <p className="empty">Generate a Skill draft to see README, quality gates, and publish plan.</p>
          )}
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
