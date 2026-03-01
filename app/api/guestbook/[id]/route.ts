import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { validateAdmin } from "@/lib/guestbook/validate-admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await validateAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const action = (body as { action?: string }).action ?? "delete";

    const supabase = createServiceClient();

    if (action === "approve") {
      const { error } = await supabase
        .from("guestbook_entries")
        .update({ approved_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        console.error("Guestbook approve error:", error);
        return NextResponse.json(
          { error: "Failed to approve entry" },
          { status: 500 }
        );
      }
    } else {
      const { error } = await supabase
        .from("guestbook_entries")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        console.error("Guestbook delete error:", error);
        return NextResponse.json(
          { error: "Failed to delete entry" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Guestbook PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
