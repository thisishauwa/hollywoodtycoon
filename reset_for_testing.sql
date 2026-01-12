-- =====================================================
-- HOLLYWOOD TYCOON - TESTING RESET SCRIPT
-- =====================================================
-- This script resets all game progress while KEEPING:
--   ✓ Scripts (IP in the market)
--   ✓ Actors (Talent pool)
--   ✓ User accounts (profiles)
--
-- This script CLEARS:
--   ✗ All bids
--   ✗ All owned scripts
--   ✗ All projects (films in production/released)
--   ✗ All game events (Variety news)
--   ✗ All actor contracts
--   ✗ All awards/ceremonies
--   ✗ All game state (resets balance, reputation)
--   ✗ Global clock (resets to Jan 2003)
-- =====================================================

BEGIN;

-- 1. Clear all game data tables (ORDER MATTERS for foreign keys)
-- Note: Using DELETE instead of TRUNCATE to handle missing tables gracefully
DELETE FROM bids;
DELETE FROM owned_scripts;
DELETE FROM projects;
DELETE FROM game_events;
DELETE FROM actor_contracts;
DELETE FROM award_nominations;
DELETE FROM award_ceremonies;

-- 2. Reset Global Clock to January 2003
UPDATE global_game_clock
SET
    month = 1,
    year = 2003,
    last_advanced_at = NOW()
WHERE id = 1;

-- If no clock exists, insert one
INSERT INTO global_game_clock (id, month, year, last_advanced_at)
SELECT 1, 1, 2003, NOW()
WHERE NOT EXISTS (SELECT 1 FROM global_game_clock WHERE id = 1);

-- 3. Reset all player game states (balance, reputation, etc.)
UPDATE game_state
SET
    balance = 5000000,           -- Starting $5M
    reputation = 30,             -- Starting reputation
    month = 1,
    year = 2003,
    updated_at = NOW();

-- 4. Reset all actors to "Available" status and clear gossip
UPDATE actors
SET
    status = 'Available',
    gossip = '{}'::text[];

-- 5. Reset profiles to initial clout
UPDATE profiles
SET
    industry_clout = 30,
    updated_at = NOW();

-- 6. Clear any studio balances if using studios table
UPDATE studios
SET balance = 5000000
WHERE true;

COMMIT;

-- =====================================================
-- HOW TO RUN THIS SCRIPT:
-- =====================================================
-- Option 1: Supabase Dashboard
--   1. Go to your Supabase project
--   2. Click "SQL Editor" in the sidebar
--   3. Paste this entire script
--   4. Click "Run"
--
-- Option 2: Command Line (if you have psql)
--   psql -h YOUR_SUPABASE_HOST -U postgres -d postgres -f reset_for_testing.sql
--
-- After running, refresh your browser to see the reset!
-- =====================================================
