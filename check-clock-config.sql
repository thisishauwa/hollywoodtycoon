-- Check global clock configuration
SELECT 
    id, 
    month, 
    year, 
    advance_interval_hours,
    last_advanced_at,
    EXTRACT(EPOCH FROM (NOW() - last_advanced_at)) / 3600 as hours_since_last_advance
FROM global_game_clock 
WHERE id = 1;
