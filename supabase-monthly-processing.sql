-- Hollywood Tycoon XP - Monthly Processing Functions
-- Run this in your Supabase SQL Editor

-- ============================================
-- FUNCTION: Process Monthly Contract Salaries
-- Deducts salaries and expires contracts
-- ============================================
CREATE OR REPLACE FUNCTION process_monthly_contracts(
  current_month INTEGER,
  current_year INTEGER
)
RETURNS TABLE (
  studio_id UUID,
  total_salary_paid INTEGER,
  contracts_expired INTEGER
) AS $$
DECLARE
  contract_record RECORD;
  studio_balance INTEGER;
  months_elapsed INTEGER;
  contract_end_month INTEGER;
  contract_end_year INTEGER;
BEGIN
  -- Process each active contract
  FOR contract_record IN
    SELECT
      ac.id,
      ac.actor_id,
      ac.studio_id,
      ac.start_month,
      ac.start_year,
      ac.duration_months,
      ac.monthly_salary,
      ac.status
    FROM actor_contracts ac
    WHERE ac.status = 'active'
  LOOP
    -- Calculate months elapsed since contract start
    months_elapsed := (current_year - contract_record.start_year) * 12
                    + (current_month - contract_record.start_month);

    -- Check if contract has expired
    IF months_elapsed >= contract_record.duration_months THEN
      -- Expire the contract
      UPDATE actor_contracts
      SET status = 'expired',
          updated_at = NOW()
      WHERE id = contract_record.id;

      -- Update actor status back to Available
      UPDATE actors
      SET status = 'Available'
      WHERE id = contract_record.actor_id
        AND status = 'On Hiatus';

    ELSE
      -- Contract still active - deduct monthly salary
      SELECT balance INTO studio_balance
      FROM game_state
      WHERE user_id = contract_record.studio_id
      FOR UPDATE;

      IF FOUND THEN
        -- Deduct salary (allow going negative for now - studios need to manage finances)
        UPDATE game_state
        SET balance = balance - contract_record.monthly_salary,
            updated_at = NOW()
        WHERE user_id = contract_record.studio_id;
      END IF;
    END IF;
  END LOOP;

  -- Return summary per studio
  RETURN QUERY
  SELECT
    gs.user_id AS studio_id,
    COALESCE(SUM(ac.monthly_salary), 0)::INTEGER AS total_salary_paid,
    COUNT(CASE WHEN ac.status = 'expired' THEN 1 END)::INTEGER AS contracts_expired
  FROM game_state gs
  LEFT JOIN actor_contracts ac ON ac.studio_id = gs.user_id AND ac.status = 'active'
  GROUP BY gs.user_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Get Contract Months Remaining
-- Helper to calculate remaining months
-- ============================================
CREATE OR REPLACE FUNCTION get_contract_months_remaining(
  contract_start_month INTEGER,
  contract_start_year INTEGER,
  contract_duration INTEGER,
  current_month INTEGER,
  current_year INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  months_elapsed INTEGER;
BEGIN
  months_elapsed := (current_year - contract_start_year) * 12
                  + (current_month - contract_start_month);
  RETURN GREATEST(0, contract_duration - months_elapsed);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Update advance_global_clock to process monthly events
-- ============================================
CREATE OR REPLACE FUNCTION advance_global_clock()
RETURNS TABLE (
  new_month INTEGER,
  new_year INTEGER,
  advanced BOOLEAN
) AS $$
DECLARE
  current_clock RECORD;
  next_month INTEGER;
  next_year INTEGER;
  hours_since_last_advance FLOAT;
BEGIN
  -- Get current clock
  SELECT * INTO current_clock FROM global_game_clock WHERE id = 1;

  -- Calculate hours since last advance
  hours_since_last_advance := EXTRACT(EPOCH FROM (NOW() - current_clock.last_advanced_at)) / 3600;

  -- Check if enough time has passed
  IF hours_since_last_advance >= current_clock.advance_interval_hours THEN
    -- Calculate next month/year
    next_month := current_clock.month + 1;
    next_year := current_clock.year;

    IF next_month > 12 THEN
      next_month := 1;
      next_year := next_year + 1;
    END IF;

    -- Update the clock
    UPDATE global_game_clock
    SET month = next_month,
        year = next_year,
        last_advanced_at = NOW()
    WHERE id = 1;

    -- Process monthly contracts (salary deductions and expirations)
    PERFORM process_monthly_contracts(next_month, next_year);

    RETURN QUERY SELECT next_month, next_year, true;
  ELSE
    RETURN QUERY SELECT current_clock.month, current_clock.year, false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VIEW: Contract Details with Months Remaining
-- ============================================
CREATE OR REPLACE VIEW contract_details AS
SELECT
  ac.id,
  ac.actor_id,
  ac.studio_id,
  ac.start_month,
  ac.start_year,
  ac.duration_months,
  ac.monthly_salary,
  ac.signing_bonus,
  ac.status,
  ac.created_at,
  a.name AS actor_name,
  p.username AS studio_name,
  ggc.month AS current_month,
  ggc.year AS current_year,
  get_contract_months_remaining(
    ac.start_month,
    ac.start_year,
    ac.duration_months,
    ggc.month,
    ggc.year
  ) AS months_remaining
FROM actor_contracts ac
JOIN actors a ON a.id = ac.actor_id
JOIN profiles p ON p.id = ac.studio_id
CROSS JOIN global_game_clock ggc
WHERE ggc.id = 1;

-- Grant permissions
GRANT SELECT ON contract_details TO authenticated;
GRANT EXECUTE ON FUNCTION process_monthly_contracts TO authenticated;
GRANT EXECUTE ON FUNCTION get_contract_months_remaining TO authenticated;
