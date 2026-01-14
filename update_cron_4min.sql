-- Unschedule the old job if it exists (to prevent duplicates)
SELECT cron.unschedule('advance_game_clock');

-- Schedule the new job to run every 4 minutes (faster gameplay!)
-- USES CORRECT FUNCTION NAME: advance_global_clock()
SELECT cron.schedule(
    'advance_game_clock',
    '*/4 * * * *',
    $$SELECT advance_global_clock();$$
);

-- Verify the job is scheduled
SELECT * FROM cron.job WHERE jobname = 'advance_game_clock';
