-- Reset A-list actor salaries to realistic range ($200K - $3M)
-- Stagger based on reputation and skill

UPDATE actors
SET salary = CASE
  -- A-list actors (tier = 'A-List')
  WHEN tier = 'A-List' THEN 
    200000 + (reputation * 15000) + (skill * 10000) + (RANDOM() * 500000)::INTEGER
  
  -- Rising Star actors
  WHEN tier = 'Rising Star' THEN
    150000 + (reputation * 8000) + (skill * 5000) + (RANDOM() * 300000)::INTEGER
  
  -- Indie Darling actors  
  WHEN tier = 'Indie Darling' THEN
    100000 + (reputation * 5000) + (skill * 3000) + (RANDOM() * 200000)::INTEGER
  
  -- Character Actor
  WHEN tier = 'Character Actor' THEN
    80000 + (reputation * 3000) + (skill * 2000) + (RANDOM() * 150000)::INTEGER
  
  -- Newcomer actors
  WHEN tier = 'Newcomer' THEN
    40000 + (reputation * 1000) + (skill * 500) + (RANDOM() * 50000)::INTEGER
  
  ELSE salary -- Keep existing salary for other tiers
END
WHERE tier IN ('A-List', 'Rising Star', 'Indie Darling', 'Character Actor', 'Newcomer');

-- Verify the new salary distribution
SELECT 
  tier,
  COUNT(*) as count,
  MIN(salary) as min_salary,
  AVG(salary)::INTEGER as avg_salary,
  MAX(salary) as max_salary
FROM actors
GROUP BY tier
ORDER BY avg_salary DESC;
