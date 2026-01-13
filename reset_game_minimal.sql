-- Minimal Game Reset Script
-- Only resets tables we're 100% certain exist

-- Core game data (these definitely exist based on your hooks)
DELETE FROM game_events WHERE 1=1;
DELETE FROM owned_scripts WHERE 1=1;
DELETE FROM actor_contracts WHERE 1=1;
DELETE FROM projects WHERE 1=1;
DELETE FROM bids WHERE 1=1;

-- Reset Actors
UPDATE actors SET status = 'Available', hired_by = NULL WHERE 1=1;

-- Reset Global Clock
UPDATE game_clock SET month = 1, year = 2003 WHERE 1=1;

-- Reset User Game States
UPDATE game_state SET balance = 5000000, reputation = 30, month = 1, year = 2003 WHERE 1=1;
