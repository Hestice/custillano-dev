-- Add moderation and likes columns
ALTER TABLE guestbook_entries ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE guestbook_entries ADD COLUMN IF NOT EXISTS likes INTEGER NOT NULL DEFAULT 0;

-- Backfill existing non-deleted entries so they stay visible
UPDATE guestbook_entries
  SET approved_at = created_at
  WHERE deleted_at IS NULL;

-- Replace public read policy: only approved + not deleted entries visible
DROP POLICY IF EXISTS "Public can read non-deleted entries" ON guestbook_entries;
DROP POLICY IF EXISTS "Public can read approved entries" ON guestbook_entries;
CREATE POLICY "Public can read approved entries" ON guestbook_entries
  FOR SELECT USING (approved_at IS NOT NULL AND deleted_at IS NULL);

-- Replace partial index for public queries (approved + not deleted)
DROP INDEX IF EXISTS idx_guestbook_entries_active;
CREATE INDEX IF NOT EXISTS idx_guestbook_entries_approved_active
  ON guestbook_entries(created_at DESC)
  WHERE approved_at IS NOT NULL AND deleted_at IS NULL;

-- Partial index for pending moderation queue
CREATE INDEX IF NOT EXISTS idx_guestbook_entries_pending
  ON guestbook_entries(created_at DESC)
  WHERE approved_at IS NULL AND deleted_at IS NULL;

-- Atomic like increment function
CREATE OR REPLACE FUNCTION increment_likes(entry_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE guestbook_entries
    SET likes = likes + 1
    WHERE id = entry_id
      AND approved_at IS NOT NULL
      AND deleted_at IS NULL
  RETURNING likes INTO new_count;

  IF new_count IS NULL THEN
    RAISE EXCEPTION 'Entry not found or not approved';
  END IF;

  RETURN new_count;
END;
$$;
