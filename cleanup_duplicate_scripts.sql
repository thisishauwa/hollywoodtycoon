-- Clean up duplicate owned scripts
-- Keep only the earliest acquired script for each script_id per user

DELETE FROM owned_scripts
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY user_id, script_id 
             ORDER BY acquired_at ASC
           ) as rn
    FROM owned_scripts
  ) t
  WHERE rn > 1
);

-- Verify cleanup
SELECT user_id, script_id, title, COUNT(*) as count
FROM owned_scripts
GROUP BY user_id, script_id, title
HAVING COUNT(*) > 1;
