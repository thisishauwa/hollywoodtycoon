-- Add per-user read tracking for global events
-- Run this in Supabase SQL Editor

-- 1. Create a table to track which events each user has read
CREATE TABLE IF NOT EXISTS user_event_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES game_events(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id) -- Each user can only mark an event as read once
);

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_event_reads_user ON user_event_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_user_event_reads_event ON user_event_reads(event_id);

-- 3. Enable RLS
ALTER TABLE user_event_reads ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Users can read own event_reads" ON user_event_reads;
CREATE POLICY "Users can read own event_reads"
ON user_event_reads
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own event_reads" ON user_event_reads;
CREATE POLICY "Users can insert own event_reads"
ON user_event_reads
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own event_reads" ON user_event_reads;
CREATE POLICY "Users can delete own event_reads"
ON user_event_reads
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 5. Enable realtime for the new table
ALTER PUBLICATION supabase_realtime ADD TABLE user_event_reads;

-- 6. Add race condition protection: unique constraint for global monthly events
-- This prevents duplicate global events for the same month/year/description
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_global_events
ON game_events (month, year, description)
WHERE is_global = true;

-- 7. Migration: for existing global events, create read entries for users who created them
INSERT INTO user_event_reads (user_id, event_id)
SELECT ge.user_id, ge.id
FROM game_events ge
WHERE ge.is_global = true AND ge.is_read = true
ON CONFLICT (user_id, event_id) DO NOTHING;
