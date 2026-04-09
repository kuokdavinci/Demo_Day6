import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateOauthState, getStateCookieName } from "../../../../../../../packages/shared/src/auth";

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  console.log("Debug Login - Client ID:", clientId ? "FOUND (" + clientId.slice(0, 5) + "...)" : "MISSING");
  if (!clientId) {
    return NextResponse.json({ error: "Missing GITHUB_CLIENT_ID. Please check your .env file." }, { status: 500 });
  }
  const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  // Loại bỏ dấu / ở cuối nếu có để tránh lỗi double slash
  const appUrl = rawAppUrl.endsWith("/") ? rawAppUrl.slice(0, -1) : rawAppUrl;
  
  console.log("Debug Login - redirect_uri target:", `${appUrl}/api/auth/github/callback`);
  
  const state = generateOauthState();
  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", `${appUrl}/api/auth/github/callback`);
  authorizeUrl.searchParams.set("scope", "read:user user:email");
  authorizeUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(getStateCookieName(), state, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/"
  });
  return response;
}
