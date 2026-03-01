"use client";

import { useState, useEffect, useCallback } from "react";
import type { GuestbookEntry } from "./types";

export function useGuestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch("/api/guestbook");
      if (!res.ok) throw new Error("Failed to fetch entries");
      const data = await res.json();
      setEntries(data.entries);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch entries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const submitEntry = useCallback(
    async (name: string, message: string, honey?: string) => {
      setSubmitting(true);
      setError(null);

      // Optimistic prepend
      const optimistic: GuestbookEntry = {
        id: crypto.randomUUID(),
        name,
        message,
        planet_color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        planet_size: 0.2 + Math.random() * 0.3,
        created_at: new Date().toISOString(),
      };
      setEntries((prev) => [optimistic, ...prev]);

      try {
        const res = await fetch("/api/guestbook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, message, _honey: honey }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to submit");
        }

        // Refetch to get server-generated values
        await fetchEntries();
      } catch (err) {
        // Rollback optimistic update
        setEntries((prev) => prev.filter((e) => e.id !== optimistic.id));
        setError(err instanceof Error ? err.message : "Failed to submit");
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchEntries]
  );

  return { entries, loading, error, submitting, submitEntry, refetch: fetchEntries };
}
