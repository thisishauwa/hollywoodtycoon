-- Fix duplicate active contracts if they exist
-- This script will keep the most recent active contract for each actor
-- and expire the older ones

-- First, let's see what we're dealing with
SELECT 
  actor_id, 
  COUNT(*) as count,
  array_agg(id ORDER BY created_at DESC) as contract_ids
FROM actor_contracts 
WHERE status = 'active'
GROUP BY actor_id
HAVING COUNT(*) > 1;

-- Now fix them: expire all but the most recent active contract per actor
WITH ranked_contracts AS (
  SELECT 
    id,
    actor_id,
    ROW_NUMBER() OVER (PARTITION BY actor_id ORDER BY created_at DESC) as rn
  FROM actor_contracts
  WHERE status = 'active'
),
duplicate_contracts AS (
  SELECT id FROM ranked_contracts WHERE rn > 1
)
UPDATE actor_contracts
SET status = 'expired'
WHERE id IN (SELECT id FROM duplicate_contracts);

-- Verify the fix
SELECT 
  actor_id, 
  COUNT(*) as active_contracts
FROM actor_contracts 
WHERE status = 'active'
GROUP BY actor_id
HAVING COUNT(*) > 1;

-- This should return 0 rows if successful
