import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Bot, Gauge, ListChecks, Mic2, PlayCircle, ShieldCheck } from "lucide-react";
import "./styles.css";

function App() {
  const [dashboard, setDashboard] = useState(null);
  const [selectedId, setSelectedId] = useState("call_1048");
  const [detail, setDetail] = useState(null);
  const [draft, setDraft] = useState("Turn this voice note into a reusable Skill for publishing episode highlights.");
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:4004/api/sessions").then((response) => response.json()).then(setDashboard);
  }, []);

  useEffect(() => {
    fetch(`http://127.0.0.1:4004/api/sessions/${selectedId}`).then((response) => response.json()).then(setDetail);
  }, [selectedId]);

  async function analyze() {
    const response = await fetch("http://127.0.0.1:4004/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: draft })
    });
    setAnalysis(await response.json());
  }

  if (!dashboard || !detail) return <main className="loading">Loading voice console</main>;

  return (
    <main>
      <header>
        <div>
          <p>VoiceMe Agent Ops</p>
          <h1>Voice Agent Studio</h1>
        </div>
        <button onClick={analyze}><PlayCircle size={18} /> Analyze voice note</button>
      </header>

      <section className="metrics">
        <Metric icon={<Mic2 />} label="Sessions" value={dashboard.metrics.total} />
        <Metric icon={<Gauge />} label="Confidence" value={`${dashboard.metrics.avgConfidence}%`} />
        <Metric icon={<Bot />} label="Latency" value={`${dashboard.metrics.avgLatency}ms`} />
        <Metric icon={<ShieldCheck />} label="Review queue" value={dashboard.metrics.reviewQueue} />
      </section>

      <section className="layout">
        <aside>
          {dashboard.sessions.map((session) => (
            <button className={session.id === selectedId ? "session active" : "session"} key={session.id} onClick={() => setSelectedId(session.id)}>
              <strong>{session.speaker}</strong>
              <span>{session.intent}</span>
            </button>
          ))}
        </aside>

        <section className="panel">
          <div className="panelHeader">
            <h2>{detail.session.speaker}</h2>
            <span>{detail.session.status}</span>
          </div>
          <p className="transcript">{detail.session.transcript}</p>
          <div className="timeline">
            {detail.timeline.map((item) => (
              <article key={item.step}>
                <ListChecks size={18} />
                <div><b>{item.step}</b><p>{item.detail}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel qa">
          <h2>Live analyzer</h2>
          <textarea value={draft} onChange={(event) => setDraft(event.target.value)} />
          {analysis && (
            <div className="analysis">
              <strong>{analysis.intent}</strong>
              <p>{analysis.response}</p>
              <div>{analysis.toolPlan.map((tool) => <span key={tool}>{tool}</span>)}</div>
            </div>
          )}
          <h2>QA guardrails</h2>
          <p>Risk: {detail.qa.hallucinationRisk}</p>
          <p>{detail.qa.suggestedReply}</p>
        </section>
      </section>
    </main>
  );
}

function Metric({ icon, label, value }) {
  return <article className="metric">{icon}<span>{label}</span><strong>{value}</strong></article>;
}

createRoot(document.getElementById("root")).render(<App />);
