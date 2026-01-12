-- Diagnostic queries to find why the clock isn't advancing

-- 1. Check current clock state
SELECT 
  month, 
  year, 
  last_advanced_at,
  advance_interval_hours,
  EXTRACT(EPOCH FROM (NOW() - last_advanced_at)) / 3600 as hours_since_last_advance,
  EXTRACT(EPOCH FROM (NOW() - last_advanced_at)) / 3600 >= advance_interval_hours as should_advance
FROM global_game_clock WHERE id = 1;

-- 2. Check for duplicate active contracts (the constraint violation issue)
SELECT 
  actor_id, 
  COUNT(*) as active_contract_count,
  array_agg(id) as contract_ids
FROM actor_contracts 
WHERE status = 'active'
GROUP BY actor_id
HAVING COUNT(*) > 1;

-- 3. Check all active contracts
SELECT 
  ac.id,
  ac.actor_id,
  a.name as actor_name,
  ac.studio_id,
  ac.status,
  ac.start_month,
  ac.start_year,
  ac.duration_months,
  ac.created_at
FROM actor_contracts ac
JOIN actors a ON a.id = ac.actor_id
WHERE ac.status = 'active'
ORDER BY ac.actor_id;

-- 4. Try to manually advance the clock
SELECT * FROM advance_global_clock();

-- 5. If step 4 fails, check what process_monthly_contracts would do
SELECT * FROM process_monthly_contracts(
  (SELECT month FROM global_game_clock WHERE id = 1),
  (SELECT year FROM global_game_clock WHERE id = 1)
);
