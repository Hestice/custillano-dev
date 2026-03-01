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
    async (
      name: string,
      message: string,
      honey?: string,
      turnstileToken?: string
    ) => {
      setSubmitting(true);
      setError(null);

      try {
        const res = await fetch("/api/guestbook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            message,
            _honey: honey,
            turnstileToken,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to submit");
        }

        return { pending: data.pending ?? false };
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to submit");
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  return { entries, loading, error, submitting, submitEntry, refetch: fetchEntries };
}
