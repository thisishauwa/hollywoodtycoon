-- Clean up duplicate projects (keep the earliest created)
DELETE FROM projects
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY studio_id, title, script_id
             ORDER BY created_at ASC
           ) as rn
    FROM projects
  ) t
  WHERE rn > 1
);

-- Verify cleanup
SELECT studio_id, title, COUNT(*) as count
FROM projects
GROUP BY studio_id, title
HAVING COUNT(*) > 1;
