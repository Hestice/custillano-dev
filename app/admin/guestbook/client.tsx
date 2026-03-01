"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GuestbookEntryAdmin } from "@/lib/guestbook/types";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push("/admin/guestbook");
      router.refresh();
    } catch {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="admin@example.com"
        required
        className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
        className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}

export function AdminGuestbookClient({
  initialEntries,
  page,
  totalPages,
}: {
  initialEntries: GuestbookEntryAdmin[];
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/guestbook/${id}`, { method: "PATCH" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete");
        return;
      }
      // Mark as soft-deleted locally
      setEntries((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, deleted_at: new Date().toISOString() } : e
        )
      );
    } catch {
      alert("Failed to delete entry");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`rounded-lg border p-4 space-y-2 ${
            entry.deleted_at
              ? "border-destructive/30 bg-destructive/5 opacity-60"
              : "border-border"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: entry.planet_color }}
              />
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-sm truncate">
                    {entry.name}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatDate(entry.created_at)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground break-words">
                  {entry.message}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {entry.ip_address && (
                <span className="text-xs text-muted-foreground font-mono">
                  {entry.ip_address}
                </span>
              )}
              {entry.deleted_at ? (
                <span className="text-xs text-destructive">Deleted</span>
              ) : (
                <button
                  onClick={() => handleDelete(entry.id)}
                  disabled={deleting === entry.id}
                  className="rounded px-2 py-1 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50"
                >
                  {deleting === entry.id ? "..." : "Delete"}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
      {entries.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No guestbook entries yet.
        </p>
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => router.push(`/admin/guestbook?page=${page - 1}`)}
            disabled={page <= 1}
            className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-30 disabled:pointer-events-none"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => router.push(`/admin/guestbook?page=${page + 1}`)}
            disabled={page >= totalPages}
            className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-30 disabled:pointer-events-none"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
