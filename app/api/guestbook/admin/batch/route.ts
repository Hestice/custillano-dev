import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { validateAdmin } from "@/lib/guestbook/validate-admin";

export async function POST(request: Request) {
  try {
    const isAdmin = await validateAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids, action } = body as { ids: string[]; action: string };

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No entries selected" },
        { status: 400 }
      );
    }

    if (ids.length > 100) {
      return NextResponse.json(
        { error: "Maximum 100 entries per batch" },
        { status: 400 }
      );
    }

    if (action !== "approve" && action !== "delete") {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const updateData =
      action === "approve"
        ? { approved_at: new Date().toISOString() }
        : { deleted_at: new Date().toISOString() };

    const { error } = await supabase
      .from("guestbook_entries")
      .update(updateData)
      .in("id", ids);

    if (error) {
      console.error("Batch update error:", error);
      return NextResponse.json(
        { error: "Failed to update entries" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, count: ids.length });
  } catch (error) {
    console.error("Batch POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
