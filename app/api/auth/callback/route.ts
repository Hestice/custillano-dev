import { NextResponse } from "next/server";
import { createAnonClient } from "@/lib/supabase/client";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");

  if (!token_hash || !type) {
    return NextResponse.redirect(new URL("/admin/guestbook", url.origin));
  }

  const supabase = createAnonClient();

  const { data, error } = await supabase.auth.verifyOtp({
    token_hash,
    type: type as "email",
  });

  if (error || !data.session) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(
      new URL("/admin/guestbook?error=auth_failed", url.origin)
    );
  }

  // Validate email matches admin
  const adminEmail = process.env.ADMIN_EMAIL;
  if (
    !adminEmail ||
    data.session.user.email?.toLowerCase() !== adminEmail.toLowerCase()
  ) {
    return NextResponse.redirect(
      new URL("/admin/guestbook?error=unauthorized", url.origin)
    );
  }

  // Set HTTP-only session cookie
  const response = NextResponse.redirect(
    new URL("/admin/guestbook", url.origin)
  );
  response.cookies.set("admin_token", data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });

  return response;
}
