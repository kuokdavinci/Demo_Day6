import { NextResponse } from "next/server";
import { getStore } from "../../../../../../packages/db/src/store";
import { buildWebhookEventFromGitHubPayload } from "../../../../../../packages/integrations/src/github";
import { handleWebhookEvent } from "../../../../../../packages/workflows/src/index";
import {
  createDiscordAdapter,
  createGitHubAdapter,
  createProvider,
  createSlackAdapter
} from "../../../../../../packages/workflows/src/runtime";

interface DemoRequest {
  owner: string;
  repo: string;
  pullNumber: number;
  installationId: number;
}

async function fetchPullRequestWebhookShape(input: DemoRequest) {
  const apiUrl = process.env.GITHUB_API_URL ?? "https://api.github.com";
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const resolvedApiUrl = apiUrl;
  if (!appId || !privateKey) {
    throw new Error("Missing GitHub App credentials in environment.");
  }

  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" }))
    .toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({ iat: now - 60, exp: now + 540, iss: appId })).toString("base64url");
  const sign = await import("node:crypto");
  const signer = sign.createSign("RSA-SHA256");
  signer.update(`${header}.${payload}`);
  signer.end();
  const jwt = `${header}.${payload}.${signer.sign(privateKey).toString("base64url")}`;

  const tokenResponse = await fetch(`${resolvedApiUrl}/app/installations/${input.installationId}/access_tokens`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${jwt}`,
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });
  if (!tokenResponse.ok) {
    throw new Error(`Failed to create installation token: ${tokenResponse.status}`);
  }
  const { token } = (await tokenResponse.json()) as { token: string };

  const prResponse = await fetch(`${resolvedApiUrl}/repos/${input.owner}/${input.repo}/pulls/${input.pullNumber}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });
  if (!prResponse.ok) {
    throw new Error(`Failed to fetch PR: ${prResponse.status}`);
  }
  const pr = await prResponse.json();

  return {
    action: "opened",
    installation: { id: input.installationId },
    repository: {
      id: pr.base.repo.id,
      name: input.repo,
      owner: { login: input.owner }
    },
    pull_request: {
      ...pr,
      number: input.pullNumber
    }
  };
}

export async function POST(request: Request) {
  try {
    const store = getStore();
    const body = (await request.json()) as DemoRequest;
    const fakeWebhookPayload = await fetchPullRequestWebhookShape(body);
    const event = await buildWebhookEventFromGitHubPayload(fakeWebhookPayload, "opened", crypto.randomUUID());
    const { decryptSecret } = await import("../../../../../../packages/db/src/secrets");
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
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown live demo error." },
      { status: 500 }
    );
  }
}
