-- Add year field to game_events table for proper chronological sorting
ALTER TABLE game_events 
ADD COLUMN IF NOT EXISTS year INTEGER;

-- Update existing events to use the current year (or estimate based on month)
-- This is a best-effort migration for existing data
UPDATE game_events 
SET year = (
  SELECT year FROM global_game_clock LIMIT 1
)
WHERE year IS NULL;

-- Create index for better sorting performance
CREATE INDEX IF NOT EXISTS idx_game_events_year_month ON game_events(year DESC, month DESC);
