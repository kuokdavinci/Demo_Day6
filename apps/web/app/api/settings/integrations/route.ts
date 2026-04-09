import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getStore } from "../../../../../../packages/db/src/store";
import { verifySession, getSessionCookieName } from "../../../../../../packages/shared/src/auth";
import type { IntegrationCredentialsInput } from "../../../../../../packages/shared/src/index";

export async function GET() {
  const store = getStore();
  const cookieStore = await cookies();
  const session = verifySession(cookieStore.get(getSessionCookieName())?.value);
  
  if (!session) {
    return NextResponse.json({ status: store.getCredentialsStatus(), repos: [] });
  }

  // 1. Lấy danh sách Repo từ bộ nhớ Local (đã cấu hình Webhook)
  const allConfigs = store.getAllConfigs();
  const localRepos = allConfigs.filter(c => c.repoName.startsWith(`${session.login}/`));

  // 2. (Opt-in) Nếu bạn muốn hiện cả những Repo "chờ cấu hình" 
  // Chúng ta sẽ coi localRepos là danh sách chính để quản lý config.
  // Để repo xuất hiện ở đây, bạn chỉ cần chạy Live Demo 1 lần cho repo đó
  // HOẶC tôi sẽ trả về chính xác danh sách repo từ Store.
  
  return NextResponse.json({
    status: store.getCredentialsStatus(),
    repos: localRepos.map(r => ({
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
    // Cài đặt cho từng Repo cụ thể
    store.updateConfig(payload.repoId, {
      slackWebhookUrl: payload.slackWebhookUrl,
      discordWebhookUrl: payload.discordWebhookUrl
    });
  } else {
    // Cài đặt TOÀN CỤC (Global) - Lưu vào credentials chung
    store.saveCredentials({
      slackWebhookUrl: payload.slackWebhookUrl,
      discordWebhookUrl: payload.discordWebhookUrl
    });
  }

  return NextResponse.json({
    ok: true,
    status: store.getCredentialsStatus()
  });
}

