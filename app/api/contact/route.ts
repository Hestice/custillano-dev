import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Server-side environment variables (no NEXT_PUBLIC prefix needed in API routes)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

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
      
      // Try to extract error details from the response
      let errorDetails = error.message || "Failed to send email";
      let errorHint = null;
      
      // If there's a context with a response, try to read the body
      if (error.context?.response) {
        try {
          const errorBody = await error.context.response.json();
          errorDetails = errorBody.error || errorDetails;
          errorHint = errorBody.hint || errorBody.details;
        } catch (e) {
          // If JSON parsing fails, try text
          try {
            const errorText = await error.context.response.text();
            errorDetails = errorText || errorDetails;
          } catch (e2) {
            // Ignore parsing errors
          }
        }
      }
      
      return NextResponse.json(
        { 
          error: errorDetails,
          hint: errorHint,
          type: "function_error"
        },
        { status: 500 }
      );
    }

    if (!data || !data.success) {
      console.error("Function returned error:", data);
      return NextResponse.json(
        { 
          error: data?.error || "Failed to send email",
          details: data?.details,
          hint: data?.hint,
          type: "function_response_error"
        },
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
