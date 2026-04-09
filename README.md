# PR Intelligence Agent Platform

AI-agent-first scaffold for GitHub pull request monitoring, risk triage and realtime delivery. The implementation in this repository is optimized for a free-tier private beta: it boots a Next.js admin console, runs a LangGraphJS analysis workflow, emits canonical GitHub outputs, sends Slack/Discord-compatible payloads through adapters, ships a replayable tester and includes production-oriented documentation.

## What is implemented
- Next.js admin console in [`apps/web`](./apps/web)
- LangGraphJS multi-agent PR analysis graph in [`packages/ai-graph`](./packages/ai-graph)
- AI utilities and heuristic Groq-compatible provider in [`packages/ai-core`](./packages/ai-core)
- Webhook orchestration and delivery workflow in [`packages/workflows`](./packages/workflows)
- Fake GitHub, Slack and Discord adapters for local development in [`packages/integrations`](./packages/integrations)
- Memory-backed persistence plus Prisma schema scaffold in [`packages/db`](./packages/db)
- Full-system harness in [`packages/test-harness`](./packages/test-harness)

## Quick start
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Start the web app:
   ```bash
   npm run dev
   ```
4. Run automated tests:
   ```bash
   npm test
   npm run test:harness
   ```
5. For live demo mode, fill the real credentials in `.env` and choose:
   ```bash
   AI_PROVIDER_MODE=groq
   ```

## Live demo mode
The repository now supports two real-data entry paths:

- `POST /api/webhooks/github`
  Use this when you have a real GitHub App webhook pointed at the app. The route verifies the signature, fetches PR files from GitHub, runs the agent workflow and syncs results back to GitHub, Slack and Discord.
- `POST /api/demo/analyze-pr`
  Use this when you want to trigger a real PR analysis manually without waiting for a webhook. Provide `owner`, `repo`, `pullNumber`, and `installationId`.

Example manual demo request:

```bash
curl -X POST http://localhost:3000/api/demo/analyze-pr \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "your-org",
    "repo": "your-repo",
    "pullNumber": 123,
    "installationId": 456789
  }'
```

## UI flow
- `/api/auth/github/login`
  real GitHub OAuth entrypoint for operator sign-in
- `/integrations`
  web UI for showing system credential status and saving workspace Slack/Discord credentials
- `/live-demo`
  web UI for selecting a real repository + pull request and running the end-to-end agent workflow

## Current runtime model
- Local runtime uses an in-memory store so the whole system can be exercised without external services.
- Prisma schema is present and the data model is already aligned with a Supabase/Postgres upgrade path.
- The default AI provider is a deterministic heuristic provider that mirrors the interface expected by a future Groq integration.
- Slack/Discord/GitHub adapters are mocked for local development but already respect the final delivery contracts.

## Important limits
- GitHub OAuth UI, GitHub App install UI and Slack/Discord OAuth UI are still not implemented. Live demo mode is env-driven, not dashboard-driven.
- Prisma client generation and Supabase wiring are documented but not active in the default runtime.
- BYOK remains intentionally disabled.

## Docs 111
- [Architecture](./docs/architecture.md)
- [AI Agents](./docs/ai-agents.md)
- [Integrations](./docs/integrations.md)
- [Security](./docs/security.md)
- [Testing](./docs/testing.md)
- [Ops](./docs/ops.md)
- [Product](./docs/product.md)
- [API](./docs/api.md)
