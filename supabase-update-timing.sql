-- Update game timing to 6 hours per month
-- Run this in your Supabase SQL Editor to update the existing clock

UPDATE global_game_clock
SET advance_interval_hours = 6
WHERE id = 1;

-- Verify the update
SELECT 
  month,
  year,
  advance_interval_hours,
  last_advanced_at,
  EXTRACT(EPOCH FROM (NOW() - last_advanced_at)) / 3600 as hours_since_last_advance,
  GREATEST(0, advance_interval_hours - EXTRACT(EPOCH FROM (NOW() - last_advanced_at)) / 3600) as hours_until_next_advance
FROM global_game_clock
WHERE id = 1;
