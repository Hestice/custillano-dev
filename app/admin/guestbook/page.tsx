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

const PAGE_SIZE = 20;

async function getEntries(page: number) {
  const supabase = createServiceClient();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const [entriesResult, countResult] = await Promise.all([
    supabase
      .from("guestbook_entries")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to),
    supabase
      .from("guestbook_entries")
      .select("*", { count: "exact", head: true }),
  ]);

  if (entriesResult.error) {
    console.error("Admin fetch error:", entriesResult.error);
    return { entries: [] as GuestbookEntryAdmin[], total: 0 };
  }

  return {
    entries: entriesResult.data as GuestbookEntryAdmin[],
    total: countResult.count ?? 0,
  };
}

export default async function AdminGuestbookPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; page?: string }>;
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

  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const { entries, total } = await getEntries(page);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Guestbook Moderation</h1>
          <span className="text-sm text-muted-foreground">
            {total} total entries
          </span>
        </div>
        <AdminGuestbookClient
          initialEntries={entries}
          page={page}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}
