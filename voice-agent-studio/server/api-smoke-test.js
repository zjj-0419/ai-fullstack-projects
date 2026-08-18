const baseUrl = "http://127.0.0.1:4004";

async function request(path, options) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = await response.json();
  if (!response.ok) {
    throw new Error(`${path} failed: ${JSON.stringify(body)}`);
  }
  return body;
}

const created = await request("/api/sessions", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    speaker: "Smoke test",
    transcript: "Please publish this voice idea as a safe Skill and include a checklist."
  })
});

await request(`/api/sessions/${created.session.id}/run`, { method: "POST" });
await request(`/api/sessions/${created.session.id}/status`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ status: "approved", note: "API smoke test approved this session." })
});

const report = await request(`/api/sessions/${created.session.id}/report`);
if (!report.markdown.includes("Smoke test")) {
  throw new Error("Report did not include the created session.");
}

console.log("API smoke test passed");
