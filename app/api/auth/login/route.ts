import { NextResponse } from "next/server";
import { createAnonClient } from "@/lib/supabase/client";

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

    const supabase = createAnonClient();

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

    return NextResponse.json({ success: true, message: "Magic link sent" });
  } catch (error) {
    console.error("Auth login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
