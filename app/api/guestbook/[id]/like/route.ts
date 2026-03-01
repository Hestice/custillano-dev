import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();

    const { data, error } = await supabase.rpc("increment_likes", {
      entry_id: id,
    });

    if (error) {
      console.error("Like increment error:", error);
      return NextResponse.json(
        { error: "Entry not found or not available" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, likes: data });
  } catch (error) {
    console.error("Like POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
