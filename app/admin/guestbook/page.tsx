import { cookies } from "next/headers";
import { createAnonClient, createServiceClient } from "@/lib/supabase/client";
import type { GuestbookEntryAdmin } from "@/lib/guestbook/types";
import { AdminGuestbookClient, LoginForm } from "./client";

async function getAuthenticatedAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return false;

  const supabase = createAnonClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return false;

  return data.user.email?.toLowerCase() === adminEmail.toLowerCase();
}

async function getEntries(): Promise<GuestbookEntryAdmin[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("guestbook_entries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin fetch error:", error);
    return [];
  }
  return data as GuestbookEntryAdmin[];
}

export default async function AdminGuestbookPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const isAdmin = await getAuthenticatedAdmin();

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold">Admin Login</h1>
            <p className="text-sm text-muted-foreground">
              Sign in with your admin email to moderate the guestbook.
            </p>
          </div>
          {params.error && (
            <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {params.error === "auth_failed"
                ? "Authentication failed. Please try again."
                : params.error === "unauthorized"
                  ? "Unauthorized email address."
                  : "An error occurred."}
            </div>
          )}
          <LoginForm />
        </div>
      </div>
    );
  }

  const entries = await getEntries();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Guestbook Moderation</h1>
          <span className="text-sm text-muted-foreground">
            {entries.length} total entries
          </span>
        </div>
        <AdminGuestbookClient initialEntries={entries} />
      </div>
    </div>
  );
}
