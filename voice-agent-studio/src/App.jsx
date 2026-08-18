import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Bot,
  CheckCircle2,
  Download,
  Gauge,
  ListChecks,
  Mic2,
  PlayCircle,
  Plus,
  ShieldCheck,
  XCircle
} from "lucide-react";
import "./styles.css";

const api = "http://127.0.0.1:4004";

function App() {
  const [dashboard, setDashboard] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [draft, setDraft] = useState("Turn this voice note into a reusable Skill for publishing episode highlights.");
  const [speaker, setSpeaker] = useState("Live creator");
  const [analysis, setAnalysis] = useState(null);
  const [report, setReport] = useState("");
  const [message, setMessage] = useState("");

  async function loadDashboard(nextId = selectedId) {
    const response = await fetch(`${api}/api/sessions`);
    const data = await response.json();
    setDashboard(data);
    const id = nextId || data.sessions[0]?.id;
    setSelectedId(id);
    return id;
  }

  async function loadDetail(id = selectedId) {
    if (!id) return;
    const response = await fetch(`${api}/api/sessions/${id}`);
    setDetail(await response.json());
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    loadDetail(selectedId);
  }, [selectedId]);

  async function analyze() {
    const response = await fetch(`${api}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: draft })
    });
    setAnalysis(await response.json());
  }

  async function createSession() {
    const response = await fetch(`${api}/api/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ speaker, transcript: draft })
    });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error);
      return;
    }
    setAnalysis(body.analysis);
    const id = await loadDashboard(body.session.id);
    await loadDetail(id);
    setMessage("Session created and persisted to server/data/sessions.json");
  }

  async function runTools() {
    const response = await fetch(`${api}/api/sessions/${selectedId}/run`, { method: "POST" });
    const body = await response.json();
    await loadDashboard(selectedId);
    await loadDetail(selectedId);
    setMessage(body.run.status === "blocked" ? "Run blocked by QA guardrails" : "Tool chain completed");
  }

  async function updateStatus(status) {
    await fetch(`${api}/api/sessions/${selectedId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note: `Reviewer changed status to ${status}` })
    });
    await loadDashboard(selectedId);
    await loadDetail(selectedId);
    setMessage(`Status updated to ${status}`);
  }

  async function exportReport() {
    const response = await fetch(`${api}/api/sessions/${selectedId}/report`);
    const body = await response.json();
    setReport(body.markdown);
    setMessage("Markdown report generated from backend");
  }

  const latestRun = useMemo(() => detail?.session.runs?.[0], [detail]);

  if (!dashboard || !detail) return <main className="loading">Loading voice console</main>;

  return (
    <main>
      <header>
        <div>
          <p>VoiceMe Agent Ops</p>
          <h1>Voice Agent Studio</h1>
        </div>
        <div className="headerActions">
          <button onClick={analyze}><PlayCircle size={18} /> Analyze</button>
          <button onClick={createSession}><Plus size={18} /> Save session</button>
        </div>
      </header>

      {message && <div className="toast">{message}</div>}

      <section className="metrics">
        <Metric icon={<Mic2 />} label="Sessions" value={dashboard.metrics.total} />
        <Metric icon={<Gauge />} label="Confidence" value={`${dashboard.metrics.avgConfidence}%`} />
        <Metric icon={<Bot />} label="Latency" value={`${dashboard.metrics.avgLatency}ms`} />
        <Metric icon={<ShieldCheck />} label="Review queue" value={dashboard.metrics.reviewQueue} />
      </section>

      <section className="layout">
        <aside>
          <h2>Session inbox</h2>
          {dashboard.sessions.map((session) => (
            <button className={session.id === selectedId ? "session active" : "session"} key={session.id} onClick={() => setSelectedId(session.id)}>
              <strong>{session.speaker}</strong>
              <span>{session.intent} · {session.status}</span>
            </button>
          ))}
        </aside>

        <section className="panel">
          <div className="panelHeader">
            <h2>{detail.session.speaker}</h2>
            <span>{detail.session.status}</span>
          </div>
          <p className="transcript">{detail.session.transcript}</p>

          <div className="actionsRow">
            <button onClick={runTools}><PlayCircle size={17} /> Run tools</button>
            <button onClick={() => updateStatus("approved")}><CheckCircle2 size={17} /> Approve</button>
            <button className="danger" onClick={() => updateStatus("blocked")}><XCircle size={17} /> Block</button>
            <button className="secondary" onClick={exportReport}><Download size={17} /> Export</button>
          </div>

          <div className="timeline">
            {detail.timeline.map((item) => (
              <article key={item.step}>
                <ListChecks size={18} />
                <div><b>{item.step}</b><p>{item.detail}</p></div>
              </article>
            ))}
          </div>

          {latestRun && (
            <section className="run">
              <h2>Latest tool run: {latestRun.status}</h2>
              {latestRun.steps.map((step) => (
                <article key={step.name}>
                  <b>{step.name}</b>
                  <span>{step.status}</span>
                  <p>{step.output}</p>
                </article>
              ))}
            </section>
          )}
        </section>

        <section className="panel qa">
          <h2>Create or analyze a voice note</h2>
          <label>
            Speaker
            <input value={speaker} onChange={(event) => setSpeaker(event.target.value)} />
          </label>
          <label>
            Transcript
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} />
          </label>
          {analysis && (
            <div className="analysis">
              <strong>{analysis.intent} · {Math.round(analysis.confidence * 100)}%</strong>
              <p>{analysis.response}</p>
              <div>{analysis.toolPlan.map((tool) => <span key={tool}>{tool}</span>)}</div>
              <p>Risks: {analysis.risks.join(", ")}</p>
            </div>
          )}
          <h2>QA guardrails</h2>
          <p>Risk: {detail.qa.hallucinationRisk}</p>
          {detail.qa.blockers.map((blocker) => <p className="blocker" key={blocker}>{blocker}</p>)}
          <p>{detail.qa.suggestedReply}</p>
        </section>
      </section>

      {report && (
        <section className="report">
          <div className="panelHeader">
            <h2>Generated report</h2>
            <button className="secondary" onClick={() => navigator.clipboard.writeText(report)}>Copy markdown</button>
          </div>
          <pre>{report}</pre>
        </section>
      )}
    </main>
  );
}

function Metric({ icon, label, value }) {
  return <article className="metric">{icon}<span>{label}</span><strong>{value}</strong></article>;
}

createRoot(document.getElementById("root")).render(<App />);
