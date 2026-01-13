-- Final Corrected Game Reset Script
-- Based on actual verified table names

-- Core game data
DELETE FROM game_events WHERE 1=1;
DELETE FROM owned_scripts WHERE 1=1;
DELETE FROM actor_contracts WHERE 1=1;
DELETE FROM projects WHERE 1=1;
DELETE FROM bids WHERE 1=1;

-- Reset Actors
UPDATE actors SET status = 'Available', hired_by = NULL WHERE 1=1;

-- Reset Global Clock (correct table name: global_game_clock)
UPDATE global_game_clock SET month = 1, year = 2003 WHERE id = 1;

-- Reset User Game States
UPDATE game_state SET balance = 5000000, reputation = 30, month = 1, year = 2003 WHERE 1=1;
