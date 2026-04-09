import { NextResponse } from "next/server";
import { getStore } from "../../../../../../packages/db/src/store";
import { buildWebhookEventFromGitHubPayload, verifyGitHubSignature } from "../../../../../../packages/integrations/src/github";
import { handleWebhookEvent } from "../../../../../../packages/workflows/src/index";
import {
  createDiscordAdapter,
  createGitHubAdapter,
  createProvider,
  createSlackAdapter
} from "../../../../../../packages/workflows/src/runtime";

export async function POST(request: Request) {
  const store = getStore();
  const rawBody = await request.text();
  const payload = JSON.parse(rawBody);
  const isInternalPayload = Boolean(payload?.snapshot && payload?.deliveryId);

  let event = payload;
  if (!isInternalPayload) {
    const configuredSecret = process.env.GITHUB_WEBHOOK_SECRET;
    if (configuredSecret) {
      const signature = request.headers.get("x-hub-signature-256");
      if (!verifyGitHubSignature(rawBody, signature, configuredSecret)) {
        return NextResponse.json({ error: "Invalid GitHub webhook signature." }, { status: 401 });
      }
    }
    const action = payload?.action;
    const deliveryId = request.headers.get("x-github-delivery") ?? crypto.randomUUID();
    event = await buildWebhookEventFromGitHubPayload(payload, action, deliveryId);
  }

  const { decryptSecret } = await import("../../../../../../packages/db/src/secrets");

  // Lấy config riêng của Repo này để móc ra đúng Webhook URL
  const snapshot = event.snapshot;
  const config = store.getConfig(snapshot.repoId, snapshot.repoName);
  
  const slackUrl = config.slackWebhookUrl ? decryptSecret(config.slackWebhookUrl) : undefined;
  const discordUrl = config.discordWebhookUrl ? decryptSecret(config.discordWebhookUrl) : undefined;

  const result = await handleWebhookEvent(event, {
    store,
    provider: createProvider(),
    github: createGitHubAdapter(),
    slack: createSlackAdapter(slackUrl, store),
    discord: createDiscordAdapter(discordUrl, store)
  });
  return NextResponse.json(result);
}
