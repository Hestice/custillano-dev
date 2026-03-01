import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";

// In-memory rate limiter: IP -> timestamps
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  rateLimitMap.set(ip, recent);
  return recent.length >= RATE_LIMIT_MAX;
}

function recordRequest(ip: string) {
  const timestamps = rateLimitMap.get(ip) || [];
  timestamps.push(Date.now());
  rateLimitMap.set(ip, timestamps);
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

export async function GET() {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("guestbook_entries")
      .select("id, name, message, planet_color, planet_size, created_at")
      .is("deleted_at", null)
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

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many entries. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, message, _honey } = body;

    // Honeypot: if filled, silently return fake success
    if (_honey) {
      return NextResponse.json({ success: true, id: crypto.randomUUID() });
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

    const supabase = createServiceClient();

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

    recordRequest(ip);

    return NextResponse.json({ success: true, id: data.id });
  } catch (error) {
    console.error("Guestbook POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
