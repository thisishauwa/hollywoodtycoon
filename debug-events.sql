-- Check if game_events table exists and its structure
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'game_events'
ORDER BY ordinal_position;

-- Check recent events
SELECT * FROM game_events 
ORDER BY created_at DESC 
LIMIT 10;

-- Check if there are any events with type 'GOOD' from movie releases
SELECT * FROM game_events 
WHERE description LIKE '%Box office%' OR description LIKE '%revenue%'
ORDER BY created_at DESC
LIMIT 5;
