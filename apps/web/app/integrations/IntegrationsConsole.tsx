"use client";

import type { CSSProperties, FormEvent } from "react";
import { useEffect, useState, useTransition } from "react";

type Status = {
  githubAppConfigured: boolean;
  githubOAuthConfigured: boolean;
  githubWebhookSecretConfigured: boolean;
  slackConfigured: boolean;
  discordConfigured: boolean;
  groqConfigured: boolean;
  githubApiUrl: string;
  groqModelId: string;
  aiProviderMode: "heuristic" | "groq";
};

type RepoSummary = {
  repoId: string;
  repoName: string;
  hasSlack: boolean;
  hasDiscord: boolean;
};

const initialForm = {
  slackWebhookUrl: "",
  discordWebhookUrl: ""
};

const StatusPill = ({ ok, label }: { ok: boolean; label: string }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        borderRadius: 6,
        background: ok ? "#f0f9f4" : "#fef4f2",
        border: ok ? "1px solid #e1f2e8" : "1px solid #fce8e4",
        color: ok ? "#2d7e49" : "#8a3a26",
        fontSize: 12,
        fontWeight: 600
      }}
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: ok ? "#4ade80" : "#f87171"
        }}
      />
      {label}
    </div>
  );
};

export function IntegrationsConsole() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<Status | null>(null);
  const [repos, setRepos] = useState<RepoSummary[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const fetchIntegrations = async () => {
    const response = await fetch("/api/settings/integrations");
    const data = await response.json();
    setStatus(data.status);
    setRepos(data.repos || []);
  };

  useEffect(() => {
    startTransition(() => {
      fetchIntegrations();
    });
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const payload = {
      slackWebhookUrl: form.slackWebhookUrl,
      discordWebhookUrl: form.discordWebhookUrl
    };

    const response = await fetch("/api/settings/integrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    setStatus(data.status);
    setMessage(data.ok ? "Configuration updated successfully." : "Update failed.");
    setForm({ slackWebhookUrl: "", discordWebhookUrl: "" });
  }

  return (
    <div style={{ display: "grid", gap: 48 }}>
      <section style={heroStyle}>
        <div style={heroEyebrowStyle}>Integrations</div>
        <h2 style={heroTitleStyle}>Connect your stack</h2>
        <p style={heroCopyStyle}>
          Enter your webhook URLs here. These will be used for all repository analyses and notifications.
        </p>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 40 }}>
        <div style={{ display: "grid", gap: 48 }}>
          
          <section style={panelStyle}>
            <h3 style={sectionTitleStyle}>Global Webhooks</h3>
            <p style={subtextStyle}>Destination endpoints for real-time PR analysis payloads.</p>
            
            <form onSubmit={save} style={{ display: "grid", gap: 48, marginTop: 32 }}>
              <div style={{ display: "grid", gap: 24 }}>
                <Field
                  label="Slack Webhook"
                  value={form.slackWebhookUrl}
                  onChange={(value) => setForm({ ...form, slackWebhookUrl: value })}
                  placeholder={status?.slackConfigured ? "Encrypted • Locked" : "https://hooks.slack.com/..."}
                />
                <Field
                  label="Discord Webhook"
                  value={form.discordWebhookUrl}
                  onChange={(value) => setForm({ ...form, discordWebhookUrl: value })}
                  placeholder={status?.discordConfigured ? "Encrypted • Locked" : "https://discord.com/..."}
                />
              </div>

              <section style={{ ...panelStyle, background: "#f9f7f2", padding: 24, borderRadius: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 16 }}>Save Configuration</h4>
                    <p style={{ ...subtextStyle, marginTop: 4 }}>These settings will be used globally.</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    {message ? <span style={{ fontSize: 13, color: "#2d7e49", fontWeight: 500 }}>{message}</span> : null}
                    <button type="submit" disabled={isPending} style={buttonStyle}>
                      {isPending ? "Syncing..." : "Update Runtime"}
                    </button>
                  </div>
                </div>
              </section>
            </form>
          </section>
        </div>


        <section style={sidePanelStyle}>
          <h4 style={sideTitleStyle}>System Specs</h4>
          <div style={specListStyle}>
            <div style={specItemStyle}>
              <span style={specLabelStyle}>AI Mode</span>
              <span style={specValueStyle}>{status?.aiProviderMode ?? "heuristic"}</span>
            </div>
            <div style={specItemStyle}>
              <span style={specLabelStyle}>LLM</span>
              <span style={specValueStyle}>llama-3.3-70b</span>
            </div>
            <div style={specItemStyle}>
              <span style={specLabelStyle}>API</span>
              <span style={specValueStyle}>v2022-11-28</span>
            </div>
          </div>
          <div style={sideFooterStyle}>System-level keys must be configured in your environment files.</div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label style={labelStyle}>
      <span style={fieldLabelStyle}>{label}</span>
      <input
        placeholder={placeholder ?? "https://..."}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={inputStyle}
      />
    </label>
  );
}

const heroStyle: CSSProperties = {
  padding: "48px 0",
  borderBottom: "1px solid #efe9e2"
};

const heroEyebrowStyle: CSSProperties = {
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

const panelStyle: CSSProperties = {
  borderRadius: 0,
  background: "transparent"
};

const sectionTitleStyle: CSSProperties = { marginTop: 0, fontSize: 20, fontWeight: 600, marginBottom: 8 };
const subtextStyle: CSSProperties = { margin: 0, color: "#9a8a78", fontSize: 14 };

const sidePanelStyle: CSSProperties = {
  padding: "24px",
  borderRadius: 12,
  background: "#f9f7f2",
  border: "1px solid #efe9e2",
  height: "fit-content"
};

const sideTitleStyle: CSSProperties = {
  marginTop: 0,
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#8c7a6b",
  marginBottom: 20
};
const specListStyle: CSSProperties = { display: "grid", gap: 12 };
const specItemStyle: CSSProperties = { display: "flex", justifyContent: "space-between", fontSize: 13 };
const specLabelStyle: CSSProperties = { color: "#6f6255" };
const specValueStyle: CSSProperties = { fontWeight: 500, color: "#1a1a1a" };
const sideFooterStyle: CSSProperties = { marginTop: 24, fontSize: 12, lineHeight: 1.5, color: "#9a8a78" };

const statusGridStyle: CSSProperties = { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 };
const labelStyle: CSSProperties = { display: "grid", gap: 8 };
const fieldLabelStyle: CSSProperties = { fontSize: 13, fontWeight: 500, color: "#1a1a1a" };
const inputStyle: CSSProperties = {
  width: "100%",
  borderRadius: 8,
  border: "1px solid #ede8e0",
  padding: "10px 14px",
  font: "inherit",
  fontSize: 14,
  background: "white",
  boxSizing: "border-box",
  transition: "border-color 0.2s"
};

const buttonStyle: CSSProperties = {
  border: "1px solid #ede8e0",
  borderRadius: 8,
  padding: "8px 16px",
  font: "inherit",
  fontSize: 13,
  fontWeight: 600,
  color: "#1a1a1a",
  background: "white",
  cursor: "pointer",
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
};

const repoItemStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "all 0.2s"
};

const webhookBadgeStyle: CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  padding: "4px 8px",
  borderRadius: "16px",
  background: "#e1f2e8",
  color: "#2d7e49"
};

const clearButtonStyle: CSSProperties = {
  background: "none",
  border: "none",
  padding: 0,
  fontSize: "12px",
  color: "#8a3a26",
  cursor: "pointer",
  textDecoration: "underline",
  width: "fit-content",
  textAlign: "left"
};
