-- Check for duplicate events in the database
SELECT 
  description,
  month,
  year,
  COUNT(*) as occurrences
FROM game_events
WHERE description LIKE '%entered%phase%'
GROUP BY description, month, year
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- Remove duplicate events (keep the earliest created)
DELETE FROM game_events
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY user_id, description, month, year
             ORDER BY created_at ASC
           ) as rn
    FROM game_events
  ) t
  WHERE rn > 1
);

-- Verify cleanup
SELECT COUNT(*) as total_events FROM game_events;
SELECT 
  description,
  COUNT(*) as count
FROM game_events
WHERE description LIKE '%entered%phase%'
GROUP BY description
ORDER BY COUNT(*) DESC
LIMIT 10;
