import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServiceClient, createAnonClient } from "@/lib/supabase/client";

async function validateAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return false;

  const supabase = createAnonClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) return false;
  return data.user.email?.toLowerCase() === adminEmail.toLowerCase();
}

const PAGE_SIZE = 20;

export async function GET(request: Request) {
  try {
    const isAdmin = await validateAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const supabase = createServiceClient();

    const [entriesResult, countResult] = await Promise.all([
      supabase
        .from("guestbook_entries")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to),
      supabase
        .from("guestbook_entries")
        .select("*", { count: "exact", head: true }),
    ]);

    if (entriesResult.error) {
      console.error("Admin guestbook fetch error:", entriesResult.error);
      return NextResponse.json(
        { error: "Failed to fetch entries" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      entries: entriesResult.data,
      total: countResult.count ?? 0,
      page,
      totalPages: Math.max(1, Math.ceil((countResult.count ?? 0) / PAGE_SIZE)),
    });
  } catch (error) {
    console.error("Admin guestbook GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
