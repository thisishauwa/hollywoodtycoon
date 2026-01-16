-- Fix actors with unrealistic salaries (cap at $10M)
UPDATE actors
SET salary = 10000000
WHERE salary > 10000000;

-- Verify the fix
SELECT name, tier, salary, reputation
FROM actors
WHERE salary > 5000000
ORDER BY salary DESC;
