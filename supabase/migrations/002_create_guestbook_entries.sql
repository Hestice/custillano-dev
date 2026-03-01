CREATE TABLE guestbook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  ip_address INET,
  planet_color TEXT NOT NULL DEFAULT '#888888',
  planet_size REAL NOT NULL DEFAULT 0.3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ  -- null = visible, set = soft-deleted
);

-- Query performance: most recent entries first
CREATE INDEX idx_guestbook_entries_created_at ON guestbook_entries(created_at DESC);

-- Rate limiting lookups by IP
CREATE INDEX idx_guestbook_entries_ip_address ON guestbook_entries(ip_address);

-- Partial index for public queries (only non-deleted entries)
CREATE INDEX idx_guestbook_entries_active ON guestbook_entries(created_at DESC)
  WHERE deleted_at IS NULL;

-- Row Level Security
ALTER TABLE guestbook_entries ENABLE ROW LEVEL SECURITY;

-- Public can read non-deleted entries (excludes ip_address via API select, but RLS adds defense-in-depth)
CREATE POLICY "Public can read non-deleted entries" ON guestbook_entries
  FOR SELECT USING (deleted_at IS NULL);

-- Block direct inserts/updates/deletes from anon key — force through API with service role
CREATE POLICY "Service role full access" ON guestbook_entries
  FOR ALL USING (auth.role() = 'service_role');
