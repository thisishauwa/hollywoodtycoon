-- Optional schema enhancements for the new event system
-- The new event services work with the existing game_events table,
-- but these additions improve categorization and tracking

-- Add event_category column (if it doesn't exist)
ALTER TABLE game_events 
ADD COLUMN IF NOT EXISTS event_category TEXT DEFAULT 'user_action';

-- Add priority column (if it doesn't exist)
ALTER TABLE game_events 
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

-- Add related_entity fields for better tracking (if they don't exist)
ALTER TABLE game_events 
ADD COLUMN IF NOT EXISTS related_entity_id UUID,
ADD COLUMN IF NOT EXISTS related_entity_type TEXT;

-- Add index for faster queries by month/year
CREATE INDEX IF NOT EXISTS idx_game_events_month_year 
ON game_events(user_id, year, month);

-- View current schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'game_events'
ORDER BY ordinal_position;
