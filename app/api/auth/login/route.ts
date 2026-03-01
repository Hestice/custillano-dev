import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      return NextResponse.json(
        { error: "Admin not configured" },
        { status: 500 }
      );
    }

    // Only send magic link if email matches admin
    if (email.toLowerCase() !== adminEmail.toLowerCase()) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Use PKCE flow so the redirect sends a ?code= query param (readable server-side)
    // instead of an implicit #access_token= fragment (invisible to server routes)
    const codeVerifierStore: Record<string, string> = {};
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
            getItem: (key) => codeVerifierStore[key] ?? null,
            setItem: (key, value) => {
              codeVerifierStore[key] = value;
            },
            removeItem: (key) => {
              delete codeVerifierStore[key];
            },
          },
        },
      }
    );

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/api/auth/callback`,
      },
    });

    if (error) {
      console.error("Magic link error:", error);
      return NextResponse.json(
        { error: "Failed to send login link" },
        { status: 500 }
      );
    }

    // Extract the PKCE code verifier and persist it in a cookie so the
    // callback route can pair it with the authorization code
    const codeVerifier = Object.values(codeVerifierStore).find(Boolean);

    const response = NextResponse.json({
      success: true,
      message: "Magic link sent",
    });

    if (codeVerifier) {
      response.cookies.set("pkce_code_verifier", codeVerifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 10, // 10 minutes
      });
    }

    return response;
  } catch (error) {
    console.error("Auth login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
