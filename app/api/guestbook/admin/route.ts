import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { validateAdmin } from "@/lib/guestbook/validate-admin";

const PAGE_SIZE = 20;

type StatusFilter = "all" | "pending" | "approved" | "deleted";

export async function GET(request: Request) {
  try {
    const isAdmin = await validateAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const status = (url.searchParams.get("status") || "all") as StatusFilter;
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const supabase = createServiceClient();

    let entriesQuery = supabase
      .from("guestbook_entries")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);

    let countQuery = supabase
      .from("guestbook_entries")
      .select("*", { count: "exact", head: true });

    if (status === "pending") {
      entriesQuery = entriesQuery.is("approved_at", null).is("deleted_at", null);
      countQuery = countQuery.is("approved_at", null).is("deleted_at", null);
    } else if (status === "approved") {
      entriesQuery = entriesQuery.not("approved_at", "is", null).is("deleted_at", null);
      countQuery = countQuery.not("approved_at", "is", null).is("deleted_at", null);
    } else if (status === "deleted") {
      entriesQuery = entriesQuery.not("deleted_at", "is", null);
      countQuery = countQuery.not("deleted_at", "is", null);
    }

    const [entriesResult, countResult] = await Promise.all([
      entriesQuery,
      countQuery,
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
