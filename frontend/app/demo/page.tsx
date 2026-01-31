"use client";

import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";
const USER_ID = 1;

export default function Demo() {
  const [stage, setStage] = useState("discover");
  const [universities, setUniversities] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const d = await fetch(`${API}/dashboard/${USER_ID}`).then(r => r.json());
    setStage(d.stage);
    setTasks(d.tasks || []);

    const u = await fetch(`${API}/universities/${USER_ID}`).then(r => r.json());
    setUniversities(u);
  }

  async function shortlist() {
    setLoading(true);
    await fetch(`${API}/universities/shortlist/${USER_ID}`, { method: "POST" });
    await refresh();
    setLoading(false);
  }

  async function lock(name: string) {
    setLoading(true);

    await fetch(`${API}/universities/lock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: USER_ID, university: name })
    });

    await fetch(`${API}/tasks/generate/${USER_ID}`, { method: "POST" });

    await refresh();
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 1000, margin: "auto" }}>
      <h1 style={{ fontSize: 36 }}>Student Journey</h1>

      <Progress stage={stage} />

      {stage === "discover" && (
        <button onClick={shortlist}>
          {loading ? "Analyzing profile…" : "Generate University Shortlist"}
        </button>
      )}

      {stage === "finalize" && (
        <>
          <h2>Recommended Universities</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {universities.map((u, i) => (
              <div className="card" key={i}>
                <strong>{u.name}</strong>
                <p>{u.category}</p>

                <button onClick={() => lock(u.name)}>Lock</button>
              </div>
            ))}
          </div>
        </>
      )}

      {stage === "apply" && (
        <>
          <h2>Application Tasks</h2>

          {tasks.map((t, i) => (
            <div className="card" key={i}>
              ☐ {t.title}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function Progress({ stage }: any) {
  const steps = ["discover", "finalize", "apply"];

  return (
    <div style={{ display: "flex", gap: 10, margin: "30px 0" }}>
      {steps.map(s => (
        <div
          key={s}
          style={{
            flex: 1,
            height: 8,
            borderRadius: 10,
            background:
              steps.indexOf(s) <= steps.indexOf(stage) ? "#6366f1" : "#1f2933"
          }}
        />
      ))}
    </div>
  );
}
