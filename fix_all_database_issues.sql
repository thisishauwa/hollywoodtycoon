-- COMPREHENSIVE DATABASE CLEANUP SCRIPT
-- Run this to fix all duplicate and data integrity issues

-- 1. Remove duplicate projects (keep earliest created)
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

-- 2. Remove duplicate owned scripts (keep earliest acquired)
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

-- 3. Reset actor salaries to realistic ranges
UPDATE actors
SET salary = CASE
  WHEN tier = 'A-List' THEN 
    200000 + (reputation * 15000) + (skill * 10000) + (RANDOM() * 500000)::INTEGER
  WHEN tier = 'Rising Star' THEN
    150000 + (reputation * 8000) + (skill * 5000) + (RANDOM() * 300000)::INTEGER
  WHEN tier = 'Indie Darling' THEN
    100000 + (reputation * 5000) + (skill * 3000) + (RANDOM() * 200000)::INTEGER
  WHEN tier = 'Character Actor' THEN
    80000 + (reputation * 3000) + (skill * 2000) + (RANDOM() * 150000)::INTEGER
  WHEN tier = 'Newcomer' THEN
    40000 + (reputation * 1000) + (skill * 500) + (RANDOM() * 50000)::INTEGER
  ELSE salary
END
WHERE tier IN ('A-List', 'Rising Star', 'Indie Darling', 'Character Actor', 'Newcomer');

-- 4. Cap any remaining excessive salaries
UPDATE actors
SET salary = 10000000
WHERE salary > 10000000;

-- 5. Remove duplicate events (keep earliest created)
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

-- 6. Verification queries
SELECT 'Duplicate Projects Check' as check_name, COUNT(*)::TEXT as result
FROM (
  SELECT studio_id, title, COUNT(*) as count
  FROM projects
  GROUP BY studio_id, title
  HAVING COUNT(*) > 1
) t

UNION ALL

SELECT 'Duplicate Scripts Check', COUNT(*)::TEXT
FROM (
  SELECT user_id, script_id, COUNT(*) as count
  FROM owned_scripts
  GROUP BY user_id, script_id
  HAVING COUNT(*) > 1
) t

UNION ALL

SELECT 'High Salary Actors', COUNT(*)::TEXT
FROM actors
WHERE salary > 10000000;

-- Separate query for salary distribution
SELECT 
  tier,
  '$' || MIN(salary)::TEXT || ' - $' || MAX(salary)::TEXT as salary_range
FROM actors
GROUP BY tier
ORDER BY MAX(salary) DESC;
