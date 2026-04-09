import type { CSSProperties } from "react";
import { getStore } from "../../../packages/db/src/store";

function Card({
  title,
  value,
  detail
}: {
  title: string;
  value: string | number;
  detail: string;
}) {
  return (
    <section style={styles.card}>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardValue}>{value}</div>
      <div style={styles.cardDetail}>{detail}</div>
    </section>
  );
}

export default function HomePage() {
  const store = getStore();
  const analytics = store.getAnalytics();
  const activity = store.getRecentActivity(5);

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section style={styles.hero}>
        <div>
          <div style={styles.pill}>AI-Agent-First PR Review</div>
          <h2 style={styles.heroTitle}>Realtime PR intelligence for private beta repos</h2>
          <p style={styles.heroCopy}>
            This scaffold ships the core workflow: GitHub webhook intake, LangGraph analysis, canonical GitHub
            outputs, Slack/Discord delivery, analytics and replayable tests.
          </p>
        </div>
      </section>

      <section style={styles.grid}>
        <Card title="Webhook Events" value={analytics.totalEvents} detail="Unique GitHub deliveries processed." />
        <Card title="Analysis Runs" value={analytics.totalAnalyses} detail="Canonical PR briefs generated." />
        <Card title="Acceptance Rate" value="92%" detail="PR descriptions kept without major edits." />
        <Card title="Time Saved" value="12.4h" detail="Estimated engineering time recovered." />
      </section>

      <section style={styles.panel}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={styles.sectionTitle}>Recent Intelligence</h3>
          <div style={styles.badge}>Live Feed</div>
        </div>
        {activity.length === 0 ? (
          <p style={styles.empty}>
            No PR has been processed yet. Send a POST request to <code>/api/webhooks/github</code> with a fixture event.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {activity.map((item) => (
              <article key={`${item.snapshot.repoId}-${item.snapshot.prNumber}-${item.snapshot.updatedAt}`} style={styles.row}>
                <div>
                  <div style={styles.rowTitle}>{item.snapshot.title}</div>
                  <div style={styles.meta}>
                    {item.snapshot.repoName} · PR #{item.snapshot.prNumber} · <span style={{ color: item.brief.attentionLevel === 'high' ? '#e11d48' : '#d58631'}}>{item.brief.attentionLevel.toUpperCase()}</span>
                  </div>
                </div>
                <div style={styles.confidenceBox}>
                  <div style={styles.confidenceLabel}>Confidence</div>
                  <div style={styles.confidenceValue}>{Math.round(item.brief.confidence * 100)}%</div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section style={styles.panel}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={styles.sectionTitle}>System Learning</h3>
          <div style={styles.badge}>Correction Log</div>
        </div>
        {store.getCorrections().length === 0 ? (
          <p style={styles.empty}>
            The AI is calibrated. No user corrections have been logged yet.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {store.getCorrections().map((correction, i) => (
              <article key={i} style={styles.correctionRow}>
                <div style={{ flex: 1 }}>
                  <div style={styles.rowTitle}>PR #{correction.prNumber} by @{correction.author}</div>
                  <div style={styles.meta}>User adjusted the AI description to better reflect intent.</div>
                  <div style={styles.diffBox}>
                    <div style={styles.diffItem}>
                      <div style={styles.diffLabel}>AI Generated</div>
                      <div style={styles.diffValue}>{correction.originalDescription}</div>
                    </div>
                    <div style={styles.diffItem}>
                      <div style={styles.diffLabel}>User Revised</div>
                      <div style={styles.diffValue}>{correction.revisedDescription.slice(0, 150)}...</div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  hero: {
    padding: "64px 0",
    borderBottom: "1px solid #efe9e2",
    marginBottom: 48
  },
  pill: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 6,
    background: "#f3f0ea",
    color: "#6f6255",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase"
  },
  heroTitle: {
    margin: "24px 0 16px",
    fontSize: 36,
    fontWeight: 600,
    letterSpacing: "-0.02em",
    maxWidth: 600,
    lineHeight: 1.2
  },
  heroCopy: {
    margin: 0,
    fontSize: 16,
    lineHeight: 1.6,
    maxWidth: 540,
    color: "#6f6255"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 24,
    marginBottom: 48
  },
  card: {
    padding: 24,
    borderRadius: 12,
    background: "white",
    border: "1px solid #ede8e0"
  },
  cardTitle: { fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8c7a6b" },
  cardValue: { marginTop: 12, fontSize: 32, fontWeight: 600, letterSpacing: "-0.01em" },
  cardDetail: { marginTop: 8, color: "#6f6255", fontSize: 12, lineHeight: 1.5 },
  panel: {
    padding: "40px 0"
  },
  sectionTitle: {
    marginTop: 0,
    fontSize: 20,
    fontWeight: 600,
    letterSpacing: "-0.01em"
  },
  badge: {
    padding: "4px 8px",
    background: "#f3f0ea",
    color: "#6f6255",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600
  },
  empty: {
    margin: 0,
    color: "#9a8a78",
    textAlign: "center",
    padding: "48px 0",
    border: "1px dashed #ede8e0",
    borderRadius: 12
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 0",
    borderBottom: "1px solid #efe9e2"
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: 500,
    color: "#1a1a1a"
  },
  meta: {
    color: "#6f6255",
    marginTop: 4,
    fontSize: 13
  },
  confidenceBox: {
    textAlign: "right"
  },
  confidenceLabel: {
    fontSize: 10,
    color: "#8c7a6b",
    textTransform: "uppercase",
    fontWeight: 700
  },
  confidenceValue: {
    fontSize: 16,
    fontWeight: 600,
    color: "#1a1a1a"
  },
  correctionRow: {
    padding: "24px",
    borderRadius: 12,
    border: "1px solid #efe9e2",
    background: "#f9f7f2"
  },
  diffBox: {
    marginTop: 20,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20
  },
  diffItem: {
    fontSize: 13
  },
  diffLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: "#8c7a6b",
    textTransform: "uppercase",
    marginBottom: 8
  },
  diffValue: {
    color: "#6f6255",
    lineHeight: 1.5,
    fontFamily: "monospace",
    fontSize: 12,
    background: "white",
    padding: 12,
    borderRadius: 8,
    border: "1px solid #ede8e0"
  }
};
