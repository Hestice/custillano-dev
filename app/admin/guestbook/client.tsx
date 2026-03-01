"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GuestbookEntryAdmin } from "@/lib/guestbook/types";

type StatusFilter = "all" | "pending" | "approved" | "deleted";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ entry }: { entry: GuestbookEntryAdmin }) {
  if (entry.deleted_at) {
    return (
      <span className="inline-flex items-center rounded-full border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
        Deleted
      </span>
    );
  }
  if (!entry.approved_at) {
    return (
      <span className="inline-flex items-center rounded-full border border-yellow-500/40 bg-yellow-500/10 px-2 py-0.5 text-[10px] font-medium text-yellow-600 dark:text-yellow-400">
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
      Approved
    </span>
  );
}

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Deleted", value: "deleted" },
];

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
  status,
}: {
  initialEntries: GuestbookEntryAdmin[];
  page: number;
  totalPages: number;
  status: StatusFilter;
}) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === entries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(entries.map((e) => e.id)));
    }
  };

  const handleAction = async (id: string, action: "approve" | "delete") => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/guestbook/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || `Failed to ${action}`);
        return;
      }
      setEntries((prev) =>
        prev.map((e) => {
          if (e.id !== id) return e;
          if (action === "approve") {
            return { ...e, approved_at: new Date().toISOString() };
          }
          return { ...e, deleted_at: new Date().toISOString() };
        })
      );
    } catch {
      alert(`Failed to ${action} entry`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBatchAction = async (action: "approve" | "delete") => {
    if (selectedIds.size === 0) return;
    setBatchLoading(true);
    try {
      const res = await fetch("/api/guestbook/admin/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...selectedIds], action }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || `Failed to ${action}`);
        return;
      }
      setEntries((prev) =>
        prev.map((e) => {
          if (!selectedIds.has(e.id)) return e;
          if (action === "approve") {
            return { ...e, approved_at: new Date().toISOString() };
          }
          return { ...e, deleted_at: new Date().toISOString() };
        })
      );
      setSelectedIds(new Set());
    } catch {
      alert(`Batch ${action} failed`);
    } finally {
      setBatchLoading(false);
    }
  };

  const navigateWithStatus = (newStatus: StatusFilter) => {
    const params = new URLSearchParams();
    if (newStatus !== "all") params.set("status", newStatus);
    const qs = params.toString();
    router.push(`/admin/guestbook${qs ? `?${qs}` : ""}`);
  };

  const navigateToPage = (newPage: number) => {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (newPage > 1) params.set("page", String(newPage));
    const qs = params.toString();
    router.push(`/admin/guestbook${qs ? `?${qs}` : ""}`);
  };

  return (
    <div className="space-y-4">
      {/* Status filter tabs */}
      <div className="flex gap-1 rounded-lg border border-border p-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => navigateWithStatus(tab.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              status === tab.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-accent/50 p-3">
          <span className="text-sm font-medium">
            {selectedIds.size} selected
          </span>
          <button
            onClick={() => handleBatchAction("approve")}
            disabled={batchLoading}
            className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Approve Selected
          </button>
          <button
            onClick={() => handleBatchAction("delete")}
            disabled={batchLoading}
            className="rounded-md border border-destructive/30 px-3 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
          >
            Delete Selected
          </button>
        </div>
      )}

      {/* Select all toggle */}
      {entries.length > 0 && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedIds.size === entries.length && entries.length > 0}
            onChange={toggleSelectAll}
            className="size-4 rounded border-border"
          />
          <span className="text-xs text-muted-foreground">
            {selectedIds.size === entries.length ? "Deselect all" : "Select all"}
          </span>
        </div>
      )}

      {/* Entry list */}
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`rounded-lg border p-4 space-y-2 ${
            entry.deleted_at
              ? "border-destructive/30 bg-destructive/5 opacity-60"
              : !entry.approved_at
                ? "border-yellow-500/30 bg-yellow-500/5"
                : "border-border"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <input
                type="checkbox"
                checked={selectedIds.has(entry.id)}
                onChange={() => toggleSelect(entry.id)}
                className="size-4 shrink-0 rounded border-border"
              />
              <div
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: entry.planet_color }}
              />
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-sm truncate">
                    {entry.name}
                  </span>
                  <StatusBadge entry={entry} />
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
              {!entry.deleted_at && !entry.approved_at && (
                <button
                  onClick={() => handleAction(entry.id, "approve")}
                  disabled={actionLoading === entry.id}
                  className="rounded px-2 py-1 text-xs text-primary hover:bg-primary/10 disabled:opacity-50"
                >
                  {actionLoading === entry.id ? "..." : "Approve"}
                </button>
              )}
              {!entry.deleted_at && (
                <button
                  onClick={() => handleAction(entry.id, "delete")}
                  disabled={actionLoading === entry.id}
                  className="rounded px-2 py-1 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50"
                >
                  {actionLoading === entry.id ? "..." : "Delete"}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
      {entries.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No {status === "all" ? "" : status} guestbook entries.
        </p>
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => navigateToPage(page - 1)}
            disabled={page <= 1}
            className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-30 disabled:pointer-events-none"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => navigateToPage(page + 1)}
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
