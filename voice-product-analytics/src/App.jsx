import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Activity, BarChart3 } from "lucide-react";
import "./styles.css";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:4003/api/dashboard").then((response) => response.json()).then(setData);
  }, []);

  if (!data) return <main className="loading">Loading product signals</main>;

  return (
    <main>
      <header>
        <div>
          <p>VoiceMe Product Ops</p>
          <h1>AI Voice Analytics</h1>
        </div>
        <Activity size={28} />
      </header>
      <section className="metrics">
        {Object.entries(data.summary).map(([key, value]) => (
          <article key={key}><span>{key}</span><strong>{value}</strong></article>
        ))}
      </section>
      <section className="segments">
        {data.segments.map((segment) => (
          <article key={segment.name}>
            <h2>{segment.name}</h2>
            {["activation", "retention", "aiLift"].map((metric) => (
              <div className="bar" key={metric}>
                <label>{metric}</label>
                <div><i style={{ width: `${segment[metric]}%` }} /></div>
                <b>{segment[metric]}%</b>
              </div>
            ))}
          </article>
        ))}
      </section>
      <section className="recommendations">
        <h2><BarChart3 size={20} /> AI recommendations</h2>
        {data.recommendations.map((item) => <p key={item}>{item}</p>)}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
