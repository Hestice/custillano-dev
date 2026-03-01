import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!resendKey || !adminEmail) {
      return NextResponse.json(
        { error: "Missing RESEND_API_KEY or ADMIN_EMAIL" },
        { status: 500 }
      );
    }

    const supabase = createServiceClient();

    const { data: pending, error: fetchError } = await supabase
      .from("guestbook_entries")
      .select("id, name, message, created_at")
      .is("approved_at", null)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Digest fetch error:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch pending entries" },
        { status: 500 }
      );
    }

    if (!pending || pending.length === 0) {
      return NextResponse.json({ message: "No pending entries", sent: false });
    }

    const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://custillano.dev"}/admin/guestbook?status=pending`;

    // Build HTML email
    const entriesHtml = pending
      .map(
        (e) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            <strong>${escapeHtml(e.name)}</strong>
            <br/>
            <span style="color: #666;">${escapeHtml(e.message)}</span>
            <br/>
            <small style="color: #999;">${new Date(e.created_at).toLocaleString("en-US")}</small>
          </td>
        </tr>`
      )
      .join("");

    const html = `
      <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Guestbook: ${pending.length} Pending ${pending.length === 1 ? "Entry" : "Entries"}</h2>
        <p style="color: #666;">The following guestbook entries are awaiting your review:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          ${entriesHtml}
        </table>
        <p>
          <a href="${adminUrl}" style="display: inline-block; padding: 10px 20px; background: #333; color: #fff; text-decoration: none; border-radius: 6px;">
            Review in Admin Panel
          </a>
        </p>
      </div>`;

    // Build plain text
    const entriesText = pending
      .map(
        (e) =>
          `- ${e.name}: ${e.message} (${new Date(e.created_at).toLocaleString("en-US")})`
      )
      .join("\n");

    const text = `Guestbook: ${pending.length} Pending ${pending.length === 1 ? "Entry" : "Entries"}\n\n${entriesText}\n\nReview: ${adminUrl}`;

    // Send via Resend
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Guestbook <onboarding@resend.dev>",
        to: [adminEmail],
        subject: `Guestbook: ${pending.length} pending ${pending.length === 1 ? "entry" : "entries"}`,
        html,
        text,
      }),
    });

    if (!emailRes.ok) {
      const errBody = await emailRes.text();
      console.error("Resend error:", errBody);
      return NextResponse.json(
        { error: "Failed to send digest email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Digest sent with ${pending.length} entries`,
      sent: true,
    });
  } catch (error) {
    console.error("Cron digest error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
