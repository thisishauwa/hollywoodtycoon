-- Unschedule the old job if it exists (to prevent duplicates)
SELECT cron.unschedule('advance_game_clock');

-- Schedule the new job to run every 10 minutes
-- USES CORRECT FUNCTION NAME: advance_global_clock()
SELECT cron.schedule(
    'advance_game_clock',
    '*/10 * * * *',
    $$SELECT advance_global_clock();$$
);

-- Reset the clock (USES CORRECT TABLE NAME: global_game_clock)
UPDATE global_game_clock SET month = 1, year = 2003 WHERE id = 1;
