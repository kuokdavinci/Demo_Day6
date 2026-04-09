import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getStore } from "../../../../../../packages/db/src/store";
import { verifySession, getSessionCookieName } from "../../../../../../packages/shared/src/auth";
import type { IntegrationCredentialsInput } from "../../../../../../packages/shared/src/index";

export async function GET() {
  const store = getStore();
  const cookieStore = await cookies();
  const session = verifySession(cookieStore.get(getSessionCookieName())?.value);
  
  const allConfigs = store.getAllConfigs();
  // Lọc ra danh sách Repo thuộc về User hiện tại (owner/repo)
  const repos = session ? allConfigs.filter(c => c.repoName.startsWith(`${session.login}/`)) : [];

  return NextResponse.json({
    status: store.getCredentialsStatus(),
    repos: repos.map(r => ({
      repoId: r.repoId,
      repoName: r.repoName,
      hasSlack: !!r.slackWebhookUrl,
      hasDiscord: !!r.discordWebhookUrl
    }))
  });
}

export async function POST(request: Request) {
  const store = getStore();
  const payload = await request.json();

  if (payload.repoId) {
    // Phase 2: Cập nhật Webhook cho từng Repo
    store.updateConfig(payload.repoId, {
      slackWebhookUrl: payload.slackWebhookUrl,
      discordWebhookUrl: payload.discordWebhookUrl
    });
  }

  return NextResponse.json({
    ok: true,
    status: store.getCredentialsStatus()
  });
}

