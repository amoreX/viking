import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = request.cookies.get("oauth_state")?.value;

  if (!code || !state || state !== storedState) {
    return Response.redirect(`${origin}/?auth=error&reason=invalid_state`);
  }

  try {
    // Exchange code for token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: process.env.AUTH_GITHUB_ID!,
        client_secret: process.env.AUTH_GITHUB_SECRET!,
        code,
      }),
    });

    const { access_token: token } = await tokenRes.json();
    if (!token) return Response.redirect(`${origin}/?auth=error&reason=no_token`);

    // Fetch GitHub profile
    const profileRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!profileRes.ok) return Response.redirect(`${origin}/?auth=error&reason=profile_failed`);
    const profile = await profileRes.json();

    // Upsert user in Supabase
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("github_id", profile.id)
      .single();

    let userId: string;

    if (existing) {
      userId = existing.id;
      await supabase.from("users").update({
        username: profile.login,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        access_token: token,
      }).eq("id", userId);
    } else {
      const { data: newUser, error } = await supabase.from("users").insert({
        github_id: profile.id,
        username: profile.login,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        access_token: token,
      }).select("id").single();

      if (error || !newUser) return Response.redirect(`${origin}/?auth=error&reason=db_error`);
      userId = newUser.id;
    }

    const redirectUrl = new URL("/", origin);
    redirectUrl.searchParams.set("auth", "success");
    redirectUrl.searchParams.set("userId", userId);
    redirectUrl.searchParams.set("username", profile.login);
    redirectUrl.searchParams.set("avatar", profile.avatar_url);
    redirectUrl.searchParams.set("bio", profile.bio || "");
    redirectUrl.searchParams.set("token", token);

    const response = Response.redirect(redirectUrl.toString());
    response.headers.append("Set-Cookie", "oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return Response.redirect(`${origin}/?auth=error&reason=server_error`);
  }
}
