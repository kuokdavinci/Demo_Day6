import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionCookieName, getStateCookieName, signSession } from "../../../../../../../packages/shared/src/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(getStateCookieName())?.value;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const appUrl = rawAppUrl.endsWith("/") ? rawAppUrl.slice(0, -1) : rawAppUrl;

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(`${appUrl}/integrations?auth=failed`);
  }
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/integrations?auth=missing-client`);
  }

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code
    })
  });
  if (!tokenResponse.ok) {
    return NextResponse.redirect(`${appUrl}/integrations?auth=token-error`);
  }
  const tokenData = (await tokenResponse.json()) as { access_token?: string };
  if (!tokenData.access_token) {
    return NextResponse.redirect(`${appUrl}/integrations?auth=no-token`);
  }

  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${tokenData.access_token}`,
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });
  if (!userResponse.ok) {
    return NextResponse.redirect(`${appUrl}/integrations?auth=user-error`);
  }
  const user = (await userResponse.json()) as {
    id: number;
    login: string;
    name?: string;
    avatar_url?: string;
  };

  const response = NextResponse.redirect(`${appUrl}/integrations?auth=ok`);
  response.cookies.set(getSessionCookieName(), signSession({
    githubId: String(user.id),
    login: user.login,
    name: user.name,
    avatarUrl: user.avatar_url
  }), {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/"
  });
  response.cookies.delete(getStateCookieName());
  return response;
}
