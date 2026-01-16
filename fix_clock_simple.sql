-- Simple clock fix - just update the timestamp and schedule the job

-- 1. Update the clock's last_advanced_at to NOW so the timer shows ~4 minutes
UPDATE global_game_clock 
SET last_advanced_at = NOW()
WHERE id = 1;

-- 2. Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 3. Create/replace the advance function
CREATE OR REPLACE FUNCTION advance_month()
RETURNS void AS $$
DECLARE
  current_month INTEGER;
  current_year INTEGER;
BEGIN
  SELECT month, year INTO current_month, current_year FROM global_game_clock WHERE id = 1;
  
  IF current_month = 12 THEN
    current_month := 1;
    current_year := current_year + 1;
  ELSE
    current_month := current_month + 1;
  END IF;
  
  UPDATE global_game_clock 
  SET 
    month = current_month,
    year = current_year,
    last_advanced_at = NOW(),
    updated_at = NOW()
  WHERE id = 1;
END;
$$ LANGUAGE plpgsql;

-- 4. Schedule the job (will fail silently if it already exists)
DO $$
BEGIN
  PERFORM cron.schedule('advance_month_4min', '*/4 * * * *', 'SELECT advance_month()');
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Job may already exist, continuing...';
END $$;

-- 5. Verify
SELECT * FROM global_game_clock;
SELECT * FROM cron.job WHERE jobname = 'advance_month_4min';
