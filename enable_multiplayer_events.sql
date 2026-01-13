-- Add is_global column to game_events if it doesn't exist
ALTER TABLE game_events 
ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT false;

-- Create an index for performance
CREATE INDEX IF NOT EXISTS idx_game_events_is_global ON game_events(is_global);

-- Remove duplicate owned scripts (keep the one with highest ID, assuming newer)
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY user_id, script_id 
           ORDER BY id DESC
         ) as row_num
  FROM owned_scripts
)
DELETE FROM owned_scripts
WHERE id IN (
  SELECT id FROM duplicates WHERE row_num > 1
);

-- Clean up duplicate "Script Acquired" events (keep newest by ID)
WITH duplicate_events AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY user_id, title, description, month, year
           ORDER BY id DESC
         ) as row_num
  FROM game_events
  WHERE title = 'SCRIPT ACQUIRED'
)
DELETE FROM game_events
WHERE id IN (
  SELECT id FROM duplicate_events WHERE row_num > 1
);
