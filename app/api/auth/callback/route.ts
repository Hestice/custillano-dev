import { NextResponse } from "next/server";
import { createAnonClient } from "@/lib/supabase/client";

export async function POST(request: Request) {
  try {
    const { access_token } = await request.json();

    if (!access_token || typeof access_token !== "string") {
      return NextResponse.json(
        { error: "Missing access token" },
        { status: 400 }
      );
    }

    // Validate the token with Supabase
    const supabase = createAnonClient();
    const { data, error } = await supabase.auth.getUser(access_token);

    if (error || !data.user) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // Validate email matches admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (
      !adminEmail ||
      data.user.email?.toLowerCase() !== adminEmail.toLowerCase()
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Set HTTP-only session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });

    return response;
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
