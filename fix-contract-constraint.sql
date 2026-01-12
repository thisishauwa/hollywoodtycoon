-- Fix for the unique_active_contract constraint
-- The original constraint was incorrectly defined and applies to ALL statuses
-- This causes errors when actors have multiple expired contracts
-- 
-- Solution: Drop the constraint and replace with a partial unique index
-- that only applies when status = 'active'

-- Drop the problematic constraint
ALTER TABLE actor_contracts
DROP CONSTRAINT IF EXISTS unique_active_contract;

-- Create a partial unique index that only applies to active contracts
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_contract
ON actor_contracts (actor_id)
WHERE status = 'active';

-- This ensures:
-- 1. An actor can only have ONE active contract at a time ✓
-- 2. An actor can have multiple expired/terminated contracts ✓
-- 3. No duplicate key violations when contracts expire ✓
