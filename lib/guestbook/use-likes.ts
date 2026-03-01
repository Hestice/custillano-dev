"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "guestbook_likes";

function getLikedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveLikedIds(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

export function useLikes() {
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLikedIds(getLikedIds());
  }, []);

  const isLiked = useCallback(
    (entryId: string) => likedIds.has(entryId),
    [likedIds]
  );

  const toggleLike = useCallback(
    async (entryId: string): Promise<number | null> => {
      if (likedIds.has(entryId)) return null;

      // Optimistic update
      const next = new Set(likedIds);
      next.add(entryId);
      setLikedIds(next);
      saveLikedIds(next);

      try {
        const res = await fetch(`/api/guestbook/${entryId}/like`, {
          method: "POST",
        });

        if (!res.ok) {
          // Rollback
          next.delete(entryId);
          setLikedIds(new Set(next));
          saveLikedIds(next);
          return null;
        }

        const data = await res.json();
        return data.likes as number;
      } catch {
        // Rollback
        next.delete(entryId);
        setLikedIds(new Set(next));
        saveLikedIds(next);
        return null;
      }
    },
    [likedIds]
  );

  return { isLiked, toggleLike };
}
