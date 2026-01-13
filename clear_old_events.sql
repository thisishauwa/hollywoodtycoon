-- Clear ALL game events (no user filter)
TRUNCATE TABLE game_events;

-- Verify deletion
SELECT COUNT(*) as remaining_events FROM game_events;

-- Alternative if TRUNCATE doesn't work (delete all rows)
-- DELETE FROM game_events;
