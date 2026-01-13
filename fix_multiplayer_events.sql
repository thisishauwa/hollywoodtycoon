-- MULTIPLAYER EVENTS FIX
-- Run this in Supabase SQL Editor to fix the events system
-- This script should be run BEFORE add_event_read_tracking.sql

-- =============================================
-- 1. ENSURE SCHEMA IS CORRECT
-- =============================================

-- Add is_global column if missing
ALTER TABLE game_events
ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT false;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_events_is_global ON game_events(is_global);
CREATE INDEX IF NOT EXISTS idx_game_events_month_year ON game_events(month, year);
CREATE INDEX IF NOT EXISTS idx_game_events_global_month ON game_events(month, year) WHERE is_global = true;

-- =============================================
-- 2. DEDUPLICATE EXISTING EVENTS
-- =============================================

-- Remove exact duplicate events (same description, month, year) keeping the first one
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY month, year, description
           ORDER BY created_at ASC
         ) as row_num
  FROM game_events
)
DELETE FROM game_events
WHERE id IN (
  SELECT id FROM duplicates WHERE row_num > 1
);

-- =============================================
-- 3. MARK WORLD NEWS AS GLOBAL
-- =============================================

-- Mark market events, lifecycle events, and industry news as global
UPDATE game_events
SET is_global = true
WHERE is_global = false
  AND (
    -- Market events
    description ILIKE '%BOX OFFICE%'
    OR description ILIKE '%STREAMING%'
    OR description ILIKE '%TAX INCENTIVE%'
    OR description ILIKE '%POLICY%'
    OR description ILIKE '%STRIKE%'
    OR description ILIKE '%SCANDAL%'
    OR description ILIKE '%PIRACY%'
    -- Actor lifecycle events
    OR description ILIKE '%GOSSIP:%'
    OR description ILIKE '% signs %contract%'
    OR description ILIKE '% has died%'
    OR description ILIKE '% married %'
    OR description ILIKE '% divorce%'
    -- Studio activities that should be visible to all
    OR description ILIKE '%GREENLIT:%'
    OR description ILIKE '%ACQUISITION:%'
    OR description ILIKE '%CASTING:%'
    OR description ILIKE '%AWARDS:%'
    -- Script acquisitions
    OR description ILIKE '%has acquired rights%'
  );

-- =============================================
-- 4. LIMIT TO 3 GLOBAL EVENTS PER MONTH
-- =============================================

-- For months with more than 3 global events, unmark the excess (keep first 3)
WITH ranked_global AS (
  SELECT id,
         month,
         year,
         ROW_NUMBER() OVER (
           PARTITION BY month, year
           ORDER BY created_at ASC
         ) as row_num
  FROM game_events
  WHERE is_global = true
)
UPDATE game_events
SET is_global = false
WHERE id IN (
  SELECT id FROM ranked_global WHERE row_num > 3
);

-- =============================================
-- 5. VERIFY RESULTS
-- =============================================

-- Show event counts per month after cleanup
SELECT
  month,
  year,
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE is_global = true) as global_events,
  COUNT(*) FILTER (WHERE is_global = false) as player_events
FROM game_events
GROUP BY month, year
ORDER BY year DESC, month DESC
LIMIT 12;

-- =============================================
-- 6. UPDATE RLS POLICIES
-- =============================================

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view their own events" ON game_events;
DROP POLICY IF EXISTS "Users can read own events" ON game_events;
DROP POLICY IF EXISTS "Users can read own or global events" ON game_events;
DROP POLICY IF EXISTS "Users can insert own events" ON game_events;
DROP POLICY IF EXISTS "Users can update own events" ON game_events;
DROP POLICY IF EXISTS "Users can delete own events" ON game_events;

-- Enable RLS
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can read their own events OR global events
CREATE POLICY "Users can read own or global events"
ON game_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR is_global = true);

-- INSERT: Users can only insert events with their own user_id
CREATE POLICY "Users can insert own events"
ON game_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own events
CREATE POLICY "Users can update own events"
ON game_events
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- DELETE: Users can only delete their own events
CREATE POLICY "Users can delete own events"
ON game_events
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =============================================
-- DONE!
-- =============================================
-- Next: Run add_event_read_tracking.sql to enable
-- per-user read tracking for global events
