# Project Demo Plan: AI PR Assistant (PRIntelligence)

Based on the [Notion Specification](https://www.notion.so/SPEC-SUMMARY-33ca4eb12bce806fa602cf8534ea8f45), this plan outlines the necessary steps to transition from the current scaffold to a fully functional demo that "WOWs" the target audience (Developers & Tech Leads).

## 🎯 Demo Goal
Showcase an end-to-end automation flow:
1. **Developer opens a PR** with an empty description.
2. **AI Assistant** immediately analyzes the code (filtering noise & masking secrets).
3. **GitHub Description** is auto-filled with a professional summary.
4. **Slack/Discord** receives a premium interactive notification card.
5. **Reviewer** sees a high-level risk assessment and can "one-click" to begin review.

---

## 🛠 Phase 1: Core Engine & Automation (The "Brains")
*Status: ✅ Complete*

### 1.1 Enhancing the GitHub Adapter
- [x] **PR Body Auto-fill:** Implement `updatePullRequestDescription` in `RealGitHubAdapter`.
- [x] **Technical vs. Management Drafts:** Update synthesis logic.
- [x] **Risk Level Callouts:** Highlight High Risk modules.

### 1.2 Premium Slack/Discord Notifications
- [x] **Interactive Block Kit:** Rebuild the Slack adapter to use interactive buttons (`Approve`, `View Diff`, `Contact Author`) and colorful status bars.
- [x] **Rich Formatting:** Include a mini-summary of `Files Changed` and `Attention Level` directly in the notification card.

### 1.3 Security & Filter Polish
- [x] **Regex Expansion:** Add patterns for more diverse secrets (AWS, Stripe, etc.) in `utils.ts`.
- [x] **Noise Filtering:** Verify `package-lock.json` and assets are correctly ignored to save token costs.

---

## 🎨 Phase 2: User Experience & UI (The "Wow" Factor)
*Status: ✅ Complete*

### 2.1 The "Control Center" Dashboard
- [x] **Claude-Inspired Minimalist UI:** Successfully redesigned the entire shell, sidebar, and dashboard with a paper-white, minimalist tone (sophisticated but clean).
- [x] **Integrations Status:** Sleek UI showing active GitHub Apps and Slack Webhooks with subtle status indicators.
- [x] **Analytics Overview:** Display "Acceptance Rate" and "Time Saved" metrics.
- [x] **Live Feed:** Recent activity list with risk-level colors and confidence scores.

### 2.2 Live Demo Page (`/live-demo`)
- [x] **Interaction Loop:** Implemented a manual PR analysis trigger with step-by-step progress tracking ("Fetching...", "Masking...", "Analyzing...").
- [x] **Real-time Synthesis Feedback:** Results are displayed as a "Premium Intelligence Brief".

---

## 🧪 Phase 3: Demo Script & Validation
*Status: Not Started*
### 3.1 The "Golden Path" Scenario
1. **The Setup:** Show the empty PR in a real repo.
2. **The Magic:** Switch to the PR Assistant dashboard, click "Trigger".
3. **The Result:** 
    - Show the updated PR Description on GitHub.
    - Show the "Tech Lead Summary" comment.
    - Show the Slack notification popping up with deep links.
4. **The Feedback:** Edit the PR description on GitHub, then show the "Correction Log" in the dashboard to prove the system learns.

---

## 🚀 Technical Checklist for Final Demo
- [ ] **Real LLM Integration:** Ensure Groq or Gemini API keys are configured and working (not using Heuristic mock).
- [ ] **Environment Parity:** Check `.env.example` has all fields for GitHub App keys and Slack Webhooks.
- [ ] **Deployment:** Host the `apps/web` on Vercel or Railway for a live URL.

---
**Next Immediate Step:** Implement `updatePullRequestDescription` in `RealGitHubAdapter`.
## test
