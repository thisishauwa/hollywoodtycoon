-- Full Game Reset Script (Factory Reset) - CORRECTED
-- Based on actual schema

-- 1. Wipe all dynamic game data
DELETE FROM game_events;
DELETE FROM owned_scripts;
DELETE FROM actor_contracts;
DELETE FROM projects;  -- This is the correct table name, not active_productions
DELETE FROM awards_ceremonies;
DELETE FROM award_nominations;
DELETE FROM bids;

-- 2. Reset Actors to default state
UPDATE actors 
SET 
  status = 'Available',
  hired_by = NULL;

-- 3. Reset Global Clock
UPDATE game_clock SET month = 1, year = 2003;

-- 4. Reset User Game States
UPDATE game_state
SET 
  balance = 5000000,
  reputation = 30,
  month = 1,
  year = 2003;

-- 5. Force update of profiles (optional, but good for consistency)
UPDATE profiles SET username = 'Player' WHERE username IS NULL;
