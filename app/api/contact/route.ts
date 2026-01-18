import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

interface EmailSubmission {
  name: string;
  email: string;
  body: string;
}

export async function POST(request: Request) {
  try {
    // Validate environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Supabase configuration missing" },
        { status: 500 }
      );
    }

    // Parse request body
    const body: EmailSubmission = await request.json();

    // Validate input
    if (!body.name || !body.email || !body.body) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, body" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke("send-email", {
      body: {
        name: body.name.trim(),
        email: body.email.trim(),
        body: body.body.trim(),
      },
    });

    if (error) {
      console.error("Supabase function error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to send email" },
        { status: 500 }
      );
    }

    if (!data || !data.success) {
      return NextResponse.json(
        { error: data?.error || "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: data.message || "Email sent successfully",
      id: data.id,
    });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
