import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_API_URL = "https://api.resend.com/emails";
const RECIPIENT_EMAIL = "custillano@gmail.com";

interface EmailSubmission {
  name: string;
  email: string;
  body: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Parse request body
    const body: EmailSubmission = await req.json();

    // Validate input
    if (!body.name || !body.email || !body.body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, email, body" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check for Resend API key
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Resend API key not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store submission in database first
    const { data: submission, error: dbError } = await supabase
      .from("email_submissions")
      .insert({
        name: body.name,
        email: body.email,
        body: body.body,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to store submission" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Format plain text email
    const emailText = `From: ${body.name} <${body.email}>
To: ${RECIPIENT_EMAIL}
Subject: Contact Form Submission from ${body.name}

${body.body}

---
Submitted via custillano.dev`;

    // Send email via Resend
    const resendResponse = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Contact Form <onboarding@resend.dev>",
        to: RECIPIENT_EMAIL,
        reply_to: body.email,
        subject: `Contact Form Submission from ${body.name}`,
        text: emailText,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      console.error("Resend API error:", errorData);

      // Update submission with error (sent_at remains null)
      await supabase
        .from("email_submissions")
        .update({ sent_at: null })
        .eq("id", submission.id);

      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Update submission with sent timestamp
    await supabase
      .from("email_submissions")
      .update({ sent_at: new Date().toISOString() })
      .eq("id", submission.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        id: submission.id,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
