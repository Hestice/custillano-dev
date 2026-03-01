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

    const updateMap: Record<string, Record<string, string | null>> = {
      approve: { approved_at: new Date().toISOString() },
      delete: { deleted_at: new Date().toISOString() },
      hide: { hidden_at: new Date().toISOString() },
      unhide: { hidden_at: null },
    };

    const updateData = updateMap[action];
    if (!updateData) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("guestbook_entries")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error(`Guestbook ${action} error:`, error);
      return NextResponse.json(
        { error: `Failed to ${action} entry` },
        { status: 500 }
      );
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
