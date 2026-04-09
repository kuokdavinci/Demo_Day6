# 🎬 PR Intelligence Platform: Demo Guide

Follow this guide to showcase the full power of the AI PR Assistant.

## 🛠 Step 1: Preparation (Pre-Demo)

1.  **Environment Setup:**
    - Ensure `.env` is configured with `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, and `GROQ_API_KEY`.
    - Set `AI_PROVIDER_MODE=groq` for the best AI results.
2.  **Local Tunnel:**
    - Run `ngrok http 3000` and update your GitHub App's **Webhook URL** to `{ngrok_url}/api/webhooks/github`.
3.  **Start the Platform:**
    - Run `npm run dev`.
    - Open [http://localhost:3000](http://localhost:3000).

---

## 🚀 Step 2: The "Golden Path" (The Magic Moment)

1.  **Create a PR:** Go to your target repository and open a new Pull Request.
    - Leave the **Description empty** (or just a title).
    - Tip: Use a PR with meaningful code changes (e.g., adding a feature or fixing a bug).
2.  **Watch the Auto-fill:**
    - Wait ~5-10 seconds. 
    - Refresh the GitHub PR page. 
    - **Boom!** The description is now filled with an **AI Summary**, **Technical Breakdown**, and **Attention Level**.
3.  **Check Notifications:**
    - Show the **Slack/Discord** channel.
    - Point out the interactive buttons and the color-coded status bars (Red for high risk, Blue for low).

---

## 🧠 Step 3: Human-in-the-loop (The "System Learning")

1.  **Modify the PR:**
    - On the GitHub PR page, manually edit the description.
    - Change part of the summary (e.g., "Actually, this also affects the billing module").
2.  **Show the Dashboard:**
    - Go back to the Dashboard [Overview](http://localhost:3000).
    - Scroll down to the **System Learning / Correction Log**.
    - Show the entry capturing your edit. Explain that the AI has now flagged the "billing" module as **High Risk** for this repo based on your feedback.

---

## 🛠 Step 4: The Live Run Console (The Diagnostic Tool)

1.  **Navigate to [Live Demo](http://localhost:3000/live-demo).**
2.  **Manual Trigger:**
    - Input the PR details manually.
    - Click **"Trigger Analysis"**.
3.  **Visual Progress:**
    - Show the step-by-step progress bar (Authenticating -> Masking -> Synthesizing).
    - Explain that this transparency helps developers trust the AI's "brain" process.

---

## 📊 Step 5: Wrap Up (Analytics)

1.  **Show the Analytics Cards:**
    - Point out the **Acceptance Rate** and **Time Saved**.
    - Mention how this platform scales PR reviews for large teams without losing technical depth.

---

> [!TIP]
> **Pro-Tip:** If the AI makes a mistake during the demo, edit the PR on the fly! It actually strengthens the demo by showing the **Correction Log** in action.
