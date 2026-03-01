import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { createAnonClient } from "@/lib/supabase/client";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");

  let session;

  if (code) {
    // PKCE flow: exchange authorization code + code verifier for session
    const cookieStore = await cookies();
    const codeVerifier = cookieStore.get("pkce_code_verifier")?.value;

    if (!codeVerifier) {
      console.error("Auth callback: missing PKCE code verifier cookie");
      return NextResponse.redirect(
        new URL("/admin/guestbook?error=auth_failed", url.origin)
      );
    }

    // Create a client with custom storage seeded with the code verifier
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        auth: {
          flowType: "pkce",
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false,
          storage: {
            getItem: (key) =>
              key.includes("code-verifier") ? codeVerifier : null,
            setItem: () => {},
            removeItem: () => {},
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session) {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(
        new URL("/admin/guestbook?error=auth_failed", url.origin)
      );
    }

    session = data.session;
  } else if (token_hash && type) {
    // Token hash flow (fallback for custom email templates)
    if (type !== "magiclink" && type !== "email") {
      return NextResponse.redirect(
        new URL("/admin/guestbook?error=auth_failed", url.origin)
      );
    }

    const supabase = createAnonClient();
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });

    if (error || !data.session) {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(
        new URL("/admin/guestbook?error=auth_failed", url.origin)
      );
    }

    session = data.session;
  } else {
    return NextResponse.redirect(
      new URL("/admin/guestbook?error=auth_failed", url.origin)
    );
  }

  // Validate email matches admin
  const adminEmail = process.env.ADMIN_EMAIL;
  if (
    !adminEmail ||
    session.user.email?.toLowerCase() !== adminEmail.toLowerCase()
  ) {
    return NextResponse.redirect(
      new URL("/admin/guestbook?error=unauthorized", url.origin)
    );
  }

  // Set HTTP-only session cookie and clean up PKCE verifier
  const response = NextResponse.redirect(
    new URL("/admin/guestbook", url.origin)
  );
  response.cookies.set("admin_token", session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });
  response.cookies.delete("pkce_code_verifier");

  return response;
}
