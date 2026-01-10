-- Migration: Add contract support and fix status constraint
-- Run this in your Supabase SQL Editor

-- 1. Drop and recreate the status constraint to include 'On Hiatus'
ALTER TABLE actors DROP CONSTRAINT IF EXISTS actors_status_check;
ALTER TABLE actors ADD CONSTRAINT actors_status_check
  CHECK (status IN ('Available', 'In Production', 'Retired', 'Deceased', 'On Hiatus'));

-- 2. Update RLS policy to allow updating actors being hired
DROP POLICY IF EXISTS "Users can hire available actors" ON actors;
CREATE POLICY "Users can hire available actors" ON actors
  FOR UPDATE USING (
    status = 'Available'
    OR status = 'On Hiatus'
    OR hired_by = auth.uid()
  )
  WITH CHECK (
    -- Can only set to these statuses
    status IN ('Available', 'In Production', 'On Hiatus')
  );

-- 3. Create the actor_contracts table if it doesn't exist
CREATE TABLE IF NOT EXISTS actor_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
  studio_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_month INTEGER NOT NULL,
  start_year INTEGER NOT NULL,
  duration_months INTEGER NOT NULL CHECK (duration_months IN (3, 6, 12)),
  monthly_salary INTEGER NOT NULL,
  signing_bonus INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated', 'bought_out')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Add indexes for contracts
CREATE INDEX IF NOT EXISTS idx_contracts_actor ON actor_contracts(actor_id);
CREATE INDEX IF NOT EXISTS idx_contracts_studio ON actor_contracts(studio_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON actor_contracts(status);

-- 5. Enable RLS on contracts
ALTER TABLE actor_contracts ENABLE ROW LEVEL SECURITY;

-- 6. Contracts policies
DROP POLICY IF EXISTS "Anyone can view contracts" ON actor_contracts;
CREATE POLICY "Anyone can view contracts" ON actor_contracts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own contracts" ON actor_contracts;
CREATE POLICY "Users can create their own contracts" ON actor_contracts
  FOR INSERT WITH CHECK (auth.uid() = studio_id);

DROP POLICY IF EXISTS "Users can update their own contracts" ON actor_contracts;
CREATE POLICY "Users can update their own contracts" ON actor_contracts
  FOR UPDATE USING (auth.uid() = studio_id);

-- 7. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_contracts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS contracts_updated_at ON actor_contracts;
CREATE TRIGGER contracts_updated_at
  BEFORE UPDATE ON actor_contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_contracts_updated_at();

-- 8. Contract expiration function (safe for in-production actors)
-- Drop existing function first to change return type
DROP FUNCTION IF EXISTS check_contract_expiration(INTEGER, INTEGER);
CREATE OR REPLACE FUNCTION check_contract_expiration(current_month INTEGER, current_year INTEGER)
RETURNS TABLE(expired_contracts UUID[], extended_contracts UUID[]) AS $$
DECLARE
  contract_record RECORD;
  actor_record RECORD;
  total_start_months INTEGER;
  total_current_months INTEGER;
  total_end_months INTEGER;
  expired_ids UUID[] := '{}';
  extended_ids UUID[] := '{}';
BEGIN
  FOR contract_record IN
    SELECT * FROM actor_contracts WHERE status = 'active'
  LOOP
    total_start_months := (contract_record.start_year * 12) + contract_record.start_month;
    total_end_months := total_start_months + contract_record.duration_months;
    total_current_months := (current_year * 12) + current_month;

    IF total_current_months >= total_end_months THEN
      SELECT * INTO actor_record FROM actors WHERE id = contract_record.actor_id;

      IF actor_record.status = 'In Production' THEN
        UPDATE actor_contracts
        SET duration_months = duration_months + 1
        WHERE id = contract_record.id;
        extended_ids := array_append(extended_ids, contract_record.id);
      ELSE
        UPDATE actor_contracts
        SET status = 'expired'
        WHERE id = contract_record.id;

        UPDATE actors
        SET hired_by = NULL, status = 'Available'
        WHERE id = contract_record.actor_id;
        expired_ids := array_append(expired_ids, contract_record.id);
      END IF;
    END IF;
  END LOOP;

  RETURN QUERY SELECT expired_ids, extended_ids;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Enable realtime for contracts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'actor_contracts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE actor_contracts;
  END IF;
END $$;

-- Done! Run this migration to enable contracts.
