import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { CheckCircle2, ClipboardCheck, FlaskConical, PackageCheck, ShieldAlert } from "lucide-react";
import "./styles.css";

function App() {
  const [data, setData] = useState(null);
  const [selectedId, setSelectedId] = useState("skill_growth_notes");
  const [review, setReview] = useState(null);

  async function load() {
    const response = await fetch("http://127.0.0.1:4005/api/marketplace");
    setData(await response.json());
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    fetch(`http://127.0.0.1:4005/api/skills/${selectedId}/review`).then((response) => response.json()).then(setReview);
  }, [selectedId]);

  async function updateStatus(status) {
    await fetch(`http://127.0.0.1:4005/api/skills/${selectedId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    await load();
    const response = await fetch(`http://127.0.0.1:4005/api/skills/${selectedId}/review`);
    setReview(await response.json());
  }

  if (!data || !review) return <main className="loading">Loading marketplace admin</main>;

  return (
    <main>
      <header>
        <div>
          <p>Skill Operations</p>
          <h1>Marketplace Admin</h1>
        </div>
        <div className="actions">
          <button onClick={() => updateStatus("approved")}><CheckCircle2 size={18} /> Approve</button>
          <button className="secondary" onClick={() => updateStatus("experiment")}><FlaskConical size={18} /> Experiment</button>
        </div>
      </header>

      <section className="metrics">
        <Metric label="Total skills" value={data.metrics.totalSkills} icon={<PackageCheck />} />
        <Metric label="Approved" value={data.metrics.approved} icon={<CheckCircle2 />} />
        <Metric label="Queue" value={data.metrics.reviewQueue} icon={<ClipboardCheck />} />
        <Metric label="Avg rating" value={data.metrics.avgRating} icon={<ShieldAlert />} />
      </section>

      <section className="workspace">
        <section className="table">
          <div className="row head"><span>Name</span><span>Status</span><span>Score</span><span>Risk</span></div>
          {data.skills.map((skill) => (
            <button className={skill.id === selectedId ? "row active" : "row"} key={skill.id} onClick={() => setSelectedId(skill.id)}>
              <span>{skill.name}<small>{skill.owner}</small></span>
              <span>{skill.status}</span>
              <span>{skill.score}</span>
              <span>{skill.risk}</span>
            </button>
          ))}
        </section>

        <aside className="review">
          <h2>{review.skill.name}</h2>
          <p className="recommendation">{review.recommendation}</p>
          {review.checklist.map((item) => (
            <div className={item.passed ? "check pass" : "check"} key={item.label}>
              <CheckCircle2 size={17} />
              <span>{item.label}</span>
            </div>
          ))}
          <h3>Rollout plan</h3>
          {review.rollout.map((item) => <p className="rollout" key={item}>{item}</p>)}
        </aside>
      </section>

      <section className="experiments">
        <h2>Publishing experiments</h2>
        {data.experiments.map((experiment) => (
          <article key={experiment.name}>
            <strong>{experiment.name}</strong>
            <span>{experiment.variant}</span>
            <b>+{experiment.lift}%</b>
          </article>
        ))}
      </section>
    </main>
  );
}

function Metric({ icon, label, value }) {
  return <article className="metric">{icon}<span>{label}</span><strong>{value}</strong></article>;
}

createRoot(document.getElementById("root")).render(<App />);
