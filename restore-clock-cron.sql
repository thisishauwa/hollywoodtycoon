-- Enable pg_cron (if available/supported)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the advance_global_clock function to run every 2 minutes
-- NOTE: Cron syntax: minute hour day month day_of_week
-- "*/2 * * * *" means "every 2nd minute"
SELECT cron.schedule(
    'advance_game_clock', -- name of the job
    '*/2 * * * *',        -- schedule
    'SELECT advance_global_clock()'
);

-- To verify:
-- SELECT * FROM cron.job;
