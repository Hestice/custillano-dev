-- Add hidden_at column (NULL = visible)
ALTER TABLE guestbook_entries ADD COLUMN IF NOT EXISTS hidden_at TIMESTAMPTZ;

-- Update RLS policy: exclude hidden entries from public view
DROP POLICY IF EXISTS "Public can read approved entries" ON guestbook_entries;
CREATE POLICY "Public can read approved entries" ON guestbook_entries
  FOR SELECT USING (approved_at IS NOT NULL AND deleted_at IS NULL AND hidden_at IS NULL);

-- Update partial index for public queries (approved + not deleted + not hidden)
DROP INDEX IF EXISTS idx_guestbook_entries_approved_active;
CREATE INDEX IF NOT EXISTS idx_guestbook_entries_approved_active
  ON guestbook_entries(created_at DESC)
  WHERE approved_at IS NOT NULL AND deleted_at IS NULL AND hidden_at IS NULL;

-- Partial index for hidden entries
CREATE INDEX IF NOT EXISTS idx_guestbook_entries_hidden
  ON guestbook_entries(created_at DESC)
  WHERE hidden_at IS NOT NULL AND deleted_at IS NULL;

-- Update increment_likes to also check hidden_at IS NULL
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
      AND hidden_at IS NULL
  RETURNING likes INTO new_count;

  IF new_count IS NULL THEN
    RAISE EXCEPTION 'Entry not found or not approved';
  END IF;

  RETURN new_count;
END;
$$;
