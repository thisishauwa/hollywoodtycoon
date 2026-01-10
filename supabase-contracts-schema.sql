-- Actor Contracts table for studio roster management
CREATE TABLE IF NOT EXISTS actor_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
  studio_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Contract terms
  start_month INTEGER NOT NULL,
  start_year INTEGER NOT NULL,
  duration_months INTEGER NOT NULL CHECK (duration_months IN (3, 6, 12)),
  monthly_salary INTEGER NOT NULL,
  signing_bonus INTEGER NOT NULL DEFAULT 0,

  -- Contract status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated', 'bought_out')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one active contract per actor
  CONSTRAINT unique_active_contract UNIQUE (actor_id, status)
    DEFERRABLE INITIALLY DEFERRED
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_contracts_actor ON actor_contracts(actor_id);
CREATE INDEX IF NOT EXISTS idx_contracts_studio ON actor_contracts(studio_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON actor_contracts(status);

-- Enable RLS
ALTER TABLE actor_contracts ENABLE ROW LEVEL SECURITY;

-- Everyone can view contracts (for transparency in multiplayer)
CREATE POLICY "Anyone can view contracts" ON actor_contracts
  FOR SELECT USING (true);

-- Users can create contracts for themselves
CREATE POLICY "Users can create their own contracts" ON actor_contracts
  FOR INSERT WITH CHECK (auth.uid() = studio_id);

-- Users can update their own contracts
CREATE POLICY "Users can update their own contracts" ON actor_contracts
  FOR UPDATE USING (auth.uid() = studio_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contracts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contracts_updated_at
  BEFORE UPDATE ON actor_contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_contracts_updated_at();

-- Function to check and expire contracts
-- IMPORTANT: Does NOT expire contracts if actor is currently "In Production"
-- This prevents actors from becoming unavailable mid-film
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
    -- Calculate total months for comparison
    total_start_months := (contract_record.start_year * 12) + contract_record.start_month;
    total_end_months := total_start_months + contract_record.duration_months;
    total_current_months := (current_year * 12) + current_month;

    -- If current time has passed end time, check if we can expire
    IF total_current_months >= total_end_months THEN
      -- Get actor's current status
      SELECT * INTO actor_record FROM actors WHERE id = contract_record.actor_id;

      -- If actor is "In Production", auto-extend contract by 1 month instead of expiring
      IF actor_record.status = 'In Production' THEN
        UPDATE actor_contracts
        SET duration_months = duration_months + 1
        WHERE id = contract_record.id;
        extended_ids := array_append(extended_ids, contract_record.id);
      ELSE
        -- Safe to expire - actor is not in active production
        UPDATE actor_contracts
        SET status = 'expired'
        WHERE id = contract_record.id;

        -- Release the actor
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

-- Enable realtime for contracts
ALTER PUBLICATION supabase_realtime ADD TABLE actor_contracts;
