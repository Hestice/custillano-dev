import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { filterContent } from "@/lib/guestbook/content-filter";

const RATE_LIMIT_WINDOW_MINUTES = 1;
const RATE_LIMIT_MAX = 3;

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

async function isRateLimited(
  supabase: ReturnType<typeof createServiceClient>,
  ip: string
): Promise<boolean> {
  if (ip === "unknown") return false;

  const { count, error } = await supabase
    .from("guestbook_entries")
    .select("*", { count: "exact", head: true })
    .eq("ip_address", ip)
    .gte(
      "created_at",
      new Date(
        Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60_000
      ).toISOString()
    );

  if (error) {
    console.error("Rate limit check error:", error);
    return false;
  }

  return (count ?? 0) >= RATE_LIMIT_MAX;
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

function randomHslColor(): string {
  const h = Math.floor(Math.random() * 360);
  const s = 60 + Math.floor(Math.random() * 20); // 60-80%
  const l = 50 + Math.floor(Math.random() * 20); // 50-70%
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function randomPlanetSize(): number {
  return +(0.2 + Math.random() * 0.3).toFixed(2); // 0.20 - 0.50
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY not configured");
    return false;
  }

  const res = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret,
      response: token,
      remoteip: ip,
    }),
  });

  const data = await res.json();
  return data.success === true;
}

export async function GET() {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("guestbook_entries")
      .select("id, name, message, planet_color, planet_size, likes, created_at")
      .not("approved_at", "is", null)
      .is("deleted_at", null)
      .is("hidden_at", null)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Guestbook fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch entries" },
        { status: 500 }
      );
    }

    return NextResponse.json({ entries: data });
  } catch (error) {
    console.error("Guestbook GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const supabase = createServiceClient();

    if (await isRateLimited(supabase, ip)) {
      return NextResponse.json(
        { error: "Too many entries. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, message, _honey, turnstileToken } = body;

    // Honeypot: if filled, silently return fake success
    if (_honey) {
      return NextResponse.json({
        success: true,
        id: crypto.randomUUID(),
        pending: true,
      });
    }

    // Verify Turnstile
    if (!turnstileToken || typeof turnstileToken !== "string") {
      return NextResponse.json(
        { error: "Bot verification failed. Please try again." },
        { status: 400 }
      );
    }

    const turnstileValid = await verifyTurnstile(turnstileToken, ip);
    if (!turnstileValid) {
      return NextResponse.json(
        { error: "Bot verification failed. Please try again." },
        { status: 403 }
      );
    }

    // Validate
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }
    if (name.trim().length > 50) {
      return NextResponse.json(
        { error: "Name must be 50 characters or less" },
        { status: 400 }
      );
    }
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }
    if (message.trim().length > 500) {
      return NextResponse.json(
        { error: "Message must be 500 characters or less" },
        { status: 400 }
      );
    }

    // Content filter
    const filterResult = filterContent(name.trim(), message.trim());
    if (filterResult.blocked) {
      return NextResponse.json(
        { error: filterResult.reason },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("guestbook_entries")
      .insert({
        name: name.trim(),
        message: message.trim(),
        ip_address: ip !== "unknown" ? ip : null,
        planet_color: randomHslColor(),
        planet_size: randomPlanetSize(),
      })
      .select("id")
      .single();

    if (error) {
      console.error("Guestbook insert error:", error);
      return NextResponse.json(
        { error: "Failed to save entry" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data.id, pending: true });
  } catch (error) {
    console.error("Guestbook POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
