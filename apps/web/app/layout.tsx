import { cookies } from "next/headers";
import type { CSSProperties, ReactNode } from "react";
import { getSessionCookieName, verifySession } from "../../../packages/shared/src/auth";

export const metadata = {
  title: "PR Intelligence Agent Platform",
  description: "AI-agent-first PR monitoring, summarization and notification platform."
};

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/integrations", label: "Integrations" },
  { href: "/live-demo", label: "Live Demo" },
  { href: "/repositories", label: "Repositories" },
  { href: "/analytics", label: "Analytics" }
];

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const session = verifySession(cookieStore.get(getSessionCookieName())?.value);

  return (
    <html lang="en">
      <body style={styles.body}>
        <div style={styles.shell}>
          <aside style={styles.sidebar}>
            <div>
              <div style={styles.eyebrow}>Private Beta</div>
              <h1 style={styles.brand}>PR Intelligence</h1>
              <p style={styles.copy}>GitHub App + LangGraphJS + realtime delivery for review triage.</p>
            </div>
            <div style={styles.sessionBox}>
              {session ? (
                <>
                  <div style={styles.sessionLabel}>Signed in with GitHub</div>
                  <div style={styles.sessionName}>{session.name ?? session.login}</div>
                  <div style={styles.sessionSubtle}>@{session.login}</div>
                  <a href="/api/auth/logout" style={{ ...styles.navItem, marginTop: 12, display: "inline-block" }}>
                    Log Out
                  </a>
                </>
              ) : (
                <>
                  <div style={styles.sessionLabel}>Authentication</div>
                  <div style={styles.sessionSubtle}>Connect GitHub before configuring live integrations.</div>
                  <a href="/api/auth/github/login" style={{ ...styles.navItem, display: "inline-block", marginTop: 12 }}>
                    Sign In With GitHub
                  </a>
                </>
              )}
            </div>
            <nav style={styles.nav}>
              {navItems.map((item) => (
                <a key={item.href} href={item.href} style={styles.navItem}>
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>
          <main style={styles.main}>{children}</main>
        </div>
      </body>
    </html>
  );
}

const styles: Record<string, CSSProperties> = {
  body: {
    margin: 0,
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: "#fdfcfb",
    color: "#1a1a1a",
    WebkitFontSmoothing: "antialiased"
  },
  shell: {
    display: "grid",
    minHeight: "100vh",
    gridTemplateColumns: "280px 1fr"
  },
  sidebar: {
    borderRight: "1px solid #efe9e2",
    padding: "48px 32px",
    background: "#f9f7f2",
    position: "sticky",
    top: 0,
    height: "100vh"
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#8c7a6b"
  },
  brand: {
    margin: "16px 0 20px",
    fontSize: 24,
    fontWeight: 600,
    letterSpacing: "-0.01em"
  },
  copy: {
    margin: 0,
    color: "#6f6255",
    lineHeight: 1.6,
    fontSize: 13,
    fontWeight: 400
  },
  sessionBox: {
    marginTop: 32,
    padding: "20px",
    borderRadius: 16,
    background: "white",
    border: "1px solid #ede8e0"
  },
  sessionLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#8c7a6b"
  },
  sessionName: {
    marginTop: 8,
    fontWeight: 600,
    fontSize: 14
  },
  sessionSubtle: {
    marginTop: 2,
    color: "#9a8a78",
    fontSize: 12
  },
  nav: {
    marginTop: 48,
    display: "flex",
    flexDirection: "column",
    gap: 4
  },
  navItem: {
    padding: "10px 14px",
    borderRadius: 8,
    color: "#4a4138",
    fontSize: 14,
    fontWeight: 500,
    textDecoration: "none",
    transition: "background 0.2s"
  },
  main: {
    padding: "64px 80px",
    maxWidth: 1200,
    margin: "0 auto",
    width: "100%"
  }
};
