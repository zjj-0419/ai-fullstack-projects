import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { FileSearch, Sparkles } from "lucide-react";
import "./styles.css";

const defaultJob = "React frontend, Node backend, AI-assisted coding, Skill creation and publishing.";
const defaultResume = "I built React dashboards, Express APIs, and AI prompt workflows for product teams.";

function App() {
  const [job, setJob] = useState(defaultJob);
  const [resume, setResume] = useState(defaultResume);
  const [match, setMatch] = useState(null);

  async function analyze() {
    const response = await fetch("http://127.0.0.1:4002/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job, resume })
    });
    setMatch(await response.json());
  }

  return (
    <main>
      <header>
        <div>
          <p>AI Career Tool</p>
          <h1>Interview Copilot</h1>
        </div>
        <button onClick={analyze}><FileSearch size={18} /> Analyze fit</button>
      </header>
      <section className="workspace">
        <textarea value={job} onChange={(event) => setJob(event.target.value)} />
        <textarea value={resume} onChange={(event) => setResume(event.target.value)} />
      </section>
      {match && (
        <section className="report">
          <div className="meter"><Sparkles /> Match score {match.score}</div>
          <div className="columns">
            <article><h2>Matched skills</h2>{match.hits.map((item) => <span key={item}>{item}</span>)}</article>
            <article><h2>Gaps to cover</h2>{match.gaps.map((item) => <span key={item}>{item}</span>)}</article>
            <article><h2>Resume bullets</h2>{match.bullets.map((item) => <p key={item}>{item}</p>)}</article>
          </div>
          <h2>Interview questions</h2>
          {match.interviewQuestions.map((item) => <p className="question" key={item}>{item}</p>)}
        </section>
      )}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
