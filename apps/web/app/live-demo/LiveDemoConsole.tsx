"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import type { AnalysisResult, CanonicalBrief } from "../../../../packages/shared/src/index";

interface DemoResponse {
  brief?: CanonicalBrief;
  snapshot?: AnalysisResult["snapshot"];
  error?: string;
}

const STEPS = [
  "Authenticating with GitHub App...",
  "Fetching PR diff & metadata...",
  "Masking sensitive tokens...",
  "Synthesizing technical & management summaries...",
  "Dispatching notifications..."
];

export function LiveDemoConsole() {
  const [form, setForm] = useState({
    owner: "",
    repo: "",
    pullNumber: "",
    installationId: ""
  });
  const [result, setResult] = useState<DemoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  async function run(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    setCurrentStep(0);

    // Simulated progress steps for better UX
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1500);

    try {
      const response = await fetch("/api/demo/analyze-pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: form.owner,
          repo: form.repo,
          pullNumber: Number(form.pullNumber),
          installationId: Number(form.installationId)
        })
      });
      clearInterval(interval);
      setCurrentStep(STEPS.length - 1);
      setResult((await response.json()) as DemoResponse);
    } catch (e) {
      clearInterval(interval);
      setResult({ error: "Network error during analysis." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 48 }}>
      <section style={heroStyle}>
        <div style={eyebrowStyle}>Diagnostic Tool</div>
        <h2 style={heroTitleStyle}>Live Run Console</h2>
        <p style={heroCopyStyle}>
          Trigger the full PR Intelligence pipeline manually. This workflow authenticates as your GitHub App, analyzes
          the diff, and broadcasts to configured webhooks.
        </p>
      </section>

      <div style={layoutStyle}>
        <form onSubmit={run} style={panelStyle}>
          <h3 style={sectionTitleStyle}>Target Details</h3>
          <p style={subtextStyle}>Identify the PR you wish to process.</p>
          <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
            <Field label="Owner" value={form.owner} onChange={(value) => setForm({ ...form, owner: value })} />
            <Field label="Repository" value={form.repo} onChange={(value) => setForm({ ...form, repo: value })} />
            <Field label="PR Number" value={form.pullNumber} onChange={(value) => setForm({ ...form, pullNumber: value })} />
            <Field
              label="Installation ID"
              value={form.installationId}
              onChange={(value) => setForm({ ...form, installationId: value })}
            />
          </div>
          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? "Processing..." : "Trigger Analysis"}
          </button>
        </form>

        <section style={panelStyle}>
          <h3 style={sectionTitleStyle}>Runtime Output</h3>
          <div style={{ marginTop: 24 }}>
            {loading && (
              <div style={{ display: "grid", gap: 12 }}>
                <div style={loaderStyle}>
                  <div style={{ ...progressStyle, width: `${((currentStep + 1) / STEPS.length) * 100}%` }} />
                </div>
                <div style={{ fontSize: 13, color: "#1a1a1a", fontWeight: 500 }}>{STEPS[currentStep]}</div>
              </div>
            )}

            {!loading && !result && (
              <div style={emptyStateStyle}>
                <p>Waiting for manual trigger. Ensure GitHub App is installed on the target repository.</p>
              </div>
            )}

            {result?.error && <div style={errorStyle}>{result.error}</div>}

            {result?.analysis?.brief && (
              <div style={{ display: "grid", gap: 32 }}>
                <div style={resultHeaderStyle}>
                  <div>
                    <div style={resultTitleStyle}>{result.analysis.brief.title}</div>
                    <div style={resultMetaStyle}>
                      {result.analysis.brief.attentionLevel.toUpperCase()} LEVEL ·{" "}
                      {Math.round(result.analysis.brief.confidence * 100)}% CONFIDENCE
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 24 }}>
                  <ResultSection title="Abstract" items={result.analysis.brief.whatChanged} />
                  <ResultSection title="Technical Focus" items={result.analysis.brief.reviewerFocus} />
                  
                  <section style={{ marginTop: 12 }}>
                    <h4 style={sectionHeadingStyle}>Management Summary</h4>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#1a1a1a" }}>
                      {result.analysis.brief.managementSummary}
                    </p>
                  </section>

                  <section style={{ marginTop: 12, padding: 16, background: "#f9f7f2", borderRadius: 8, border: "1px solid #efe9e2" }}>
                    <h4 style={{ ...sectionHeadingStyle, color: "#8c7a6b" }}>🛠️ Technical Summary</h4>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#453d35", fontFamily: "monospace" }}>
                      {result.analysis.brief.technicalSummary}
                    </p>
                  </section>
                </div>

                <div style={deliveryBoxStyle}>
                  <h4 style={deliveryTitleStyle}>Notification Delivery Status</h4>
                  <div style={{ display: "grid", gap: 12, marginTop: 8 }}>
                    {result.deliveries?.map((delivery: any) => (
                      <div key={delivery.channel} style={{ 
                        ...deliveryItemStyle, 
                        borderLeft: `4px solid ${delivery.status === 'sent' ? '#2d7e49' : '#8a3a26'}`,
                        background: delivery.status === 'sent' ? '#f0f9f4' : '#fef4f2',
                        padding: '12px 16px',
                        borderRadius: '0 8px 8px 0'
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 600, textTransform: "uppercase", fontSize: 12 }}>{delivery.channel}</span>
                          <span style={{ 
                            fontSize: 11, 
                            fontWeight: 700, 
                            color: delivery.status === "sent" ? "#2d7e49" : "#8a3a26" 
                          }}>
                            ● {delivery.status.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: "#666", marginTop: 4, fontStyle: "italic" }}>
                           {delivery.message}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function ResultSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h4 style={sectionHeadingStyle}>{title}</h4>
      <ul style={listStyle}>
        {items.map((item, i) => (
          <li key={i} style={listItemStyle}>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={fieldLabelStyle}>{label}</span>
      <input
        placeholder="..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={inputStyle}
      />
    </label>
  );
}

const heroStyle: CSSProperties = { padding: "48px 0", borderBottom: "1px solid #efe9e2" };
const eyebrowStyle: CSSProperties = {
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: 6,
  background: "#f3f0ea",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#6f6255"
};
const heroTitleStyle: CSSProperties = { margin: "20px 0 12px", fontSize: 32, fontWeight: 600, letterSpacing: "-0.01em" };
const heroCopyStyle: CSSProperties = { margin: 0, maxWidth: 540, lineHeight: 1.6, fontSize: 15, color: "#6f6255" };

const layoutStyle: CSSProperties = { display: "grid", gridTemplateColumns: "320px 1fr", gap: 64 };
const panelStyle: CSSProperties = { borderRadius: 0, background: "transparent" };
const sectionTitleStyle: CSSProperties = { marginTop: 0, fontSize: 20, fontWeight: 600, marginBottom: 8 };
const subtextStyle: CSSProperties = { margin: 0, color: "#9a8a78", fontSize: 14 };

const fieldLabelStyle: CSSProperties = { fontSize: 12, fontWeight: 600, color: "#8c7a6b", textTransform: "uppercase" };
const inputStyle: CSSProperties = {
  width: "100%",
  borderRadius: 8,
  border: "1px solid #ede8e0",
  padding: "10px 12px",
  font: "inherit",
  fontSize: 14,
  background: "white",
  boxSizing: "border-box"
};

const buttonStyle: CSSProperties = {
  marginTop: 24,
  width: "100%",
  border: "1px solid #ede8e0",
  borderRadius: 8,
  padding: "12px",
  font: "inherit",
  fontSize: 14,
  fontWeight: 600,
  color: "#1a1a1a",
  background: "white",
  cursor: "pointer",
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
};

const loaderStyle: CSSProperties = { height: 4, background: "#f3f0ea", borderRadius: 2, overflow: "hidden" };
const progressStyle: CSSProperties = { height: "100%", background: "#8c7a6b", transition: "width 0.4s ease" };

const emptyStateStyle: CSSProperties = {
  padding: "48px",
  border: "1px dashed #ede8e0",
  borderRadius: 12,
  textAlign: "center",
  color: "#9a8a78",
  fontSize: 14
};

const errorStyle: CSSProperties = { color: "#8a3a26", fontSize: 14, fontWeight: 500 };

const resultHeaderStyle: CSSProperties = {
  paddingBottom: 24,
  borderBottom: "1px solid #efe9e2"
};
const resultTitleStyle: CSSProperties = { fontSize: 24, fontWeight: 600, color: "#1a1a1a" };
const resultMetaStyle: CSSProperties = { marginTop: 8, fontSize: 11, fontWeight: 700, color: "#8c7a6b", letterSpacing: "0.05em" };

const sectionHeadingStyle: CSSProperties = { fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#8c7a6b", marginBottom: 12 };
const listStyle: CSSProperties = { margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 10 };
const listItemStyle: CSSProperties = { fontSize: 15, color: "#4a4138", paddingLeft: 16, position: "relative" };

const deliveryBoxStyle: CSSProperties = { padding: 20, background: "#f9f7f2", borderRadius: 8, border: "1px solid #efe9e2" };
const deliveryTitleStyle: CSSProperties = { marginTop: 0, fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#8c7a6b", marginBottom: 16 };
const deliveryItemStyle: CSSProperties = { display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 500 };
