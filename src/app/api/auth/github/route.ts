import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: process.env.AUTH_GITHUB_ID!,
    redirect_uri: `${origin}/api/auth/callback`,
    scope: "read:user repo",
    state,
  });

  const response = Response.redirect(
    `https://github.com/login/oauth/authorize?${params.toString()}`
  );

  response.headers.append(
    "Set-Cookie",
    `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`
  );

  return response;
}
