-- Enable pg_cron if not already
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 1. Unschedule existing jobs to prevent duplicates
SELECT cron.unschedule('advance_month_4min');

-- 2. Verify the advance_month function exists (and create/update it if needed)
CREATE OR REPLACE FUNCTION advance_month()
RETURNS void AS $$
DECLARE
  current_month INTEGER;
  current_year INTEGER;
BEGIN
  -- Get current time
  SELECT month, year INTO current_month, current_year FROM global_game_clock WHERE id = 1;
  
  -- Advance time
  IF current_month = 12 THEN
    current_month := 1;
    current_year := current_year + 1;
  ELSE
    current_month := current_month + 1;
  END IF;
  
  -- Update clock
  UPDATE global_game_clock 
  SET 
    month = current_month,
    year = current_year,
    last_advanced_at = NOW(),
    updated_at = NOW()
  WHERE id = 1;

  -- Create a game event for the new month
  INSERT INTO game_events (month, year, message, type)
  VALUES (current_month, current_year, 'New month has started!', 'INFO');
  
END;
$$ LANGUAGE plpgsql;

-- 3. Manually advance the clock ONCE right now to unstick the timer
SELECT advance_month();

-- 4. Schedule the job to run every 4 minutes
SELECT cron.schedule(
  'advance_month_4min',
  '*/4 * * * *', -- Every 4 minutes
  'SELECT advance_month()'
);

-- 5. Check if the job was scheduled
SELECT * FROM cron.job;

-- 6. Check global_game_clock status
SELECT * FROM global_game_clock;
