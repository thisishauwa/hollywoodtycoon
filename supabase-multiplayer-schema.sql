-- Hollywood Tycoon XP - Multiplayer Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- SCRIPTS TABLE (Shared Market)
-- ============================================
CREATE TABLE scripts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  genre TEXT NOT NULL,
  quality INTEGER NOT NULL,
  complexity INTEGER NOT NULL,
  base_cost INTEGER NOT NULL,
  description TEXT NOT NULL,
  tagline TEXT NOT NULL,
  required_cast INTEGER NOT NULL,
  tone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;

-- Everyone can view scripts
CREATE POLICY "Scripts are viewable by everyone"
  ON scripts FOR SELECT
  USING (true);

-- Only system can insert scripts (you'll do this manually or via admin)
CREATE POLICY "Only authenticated users can insert scripts"
  ON scripts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- BIDS TABLE (All player bids)
-- ============================================
CREATE TABLE bids (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  script_id TEXT REFERENCES scripts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(script_id, user_id)
);

-- Enable RLS
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Everyone can view all bids
CREATE POLICY "Bids are viewable by everyone"
  ON bids FOR SELECT
  USING (true);

-- Users can insert their own bids
CREATE POLICY "Users can insert their own bids"
  ON bids FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own bids
CREATE POLICY "Users can update their own bids"
  ON bids FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own bids
CREATE POLICY "Users can delete their own bids"
  ON bids FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- OWNED SCRIPTS TABLE (Scripts players won)
-- ============================================
CREATE TABLE owned_scripts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  script_id TEXT NOT NULL,
  title TEXT NOT NULL,
  genre TEXT NOT NULL,
  quality INTEGER NOT NULL,
  complexity INTEGER NOT NULL,
  purchase_price INTEGER NOT NULL,
  description TEXT NOT NULL,
  tagline TEXT NOT NULL,
  required_cast INTEGER NOT NULL,
  tone TEXT NOT NULL,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE owned_scripts ENABLE ROW LEVEL SECURITY;

-- Everyone can view owned scripts (to see what others have)
CREATE POLICY "Owned scripts are viewable by everyone"
  ON owned_scripts FOR SELECT
  USING (true);

-- Users can insert their own owned scripts
CREATE POLICY "Users can insert their own owned scripts"
  ON owned_scripts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- GAME STATE TABLE (Player's current state)
-- ============================================
CREATE TABLE game_state (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  balance INTEGER DEFAULT 5000000 NOT NULL,
  reputation INTEGER DEFAULT 30 NOT NULL,
  month INTEGER DEFAULT 1 NOT NULL,
  year INTEGER DEFAULT 2003 NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;

-- Everyone can view game states (to see leaderboards)
CREATE POLICY "Game states are viewable by everyone"
  ON game_state FOR SELECT
  USING (true);

-- Users can insert their own game state
CREATE POLICY "Users can insert their own game state"
  ON game_state FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own game state
CREATE POLICY "Users can update their own game state"
  ON game_state FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- EVENTS TABLE (Game events/notifications)
-- ============================================
CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'GOOD', 'BAD', 'INFO'
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Users can only view their own events
CREATE POLICY "Users can view their own events"
  ON events FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own events
CREATE POLICY "Users can insert their own events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own events
CREATE POLICY "Users can update their own events"
  ON events FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX idx_bids_script_id ON bids(script_id);
CREATE INDEX idx_bids_user_id ON bids(user_id);
CREATE INDEX idx_bids_expires_at ON bids(expires_at);
CREATE INDEX idx_bids_is_active ON bids(is_active);
CREATE INDEX idx_owned_scripts_user_id ON owned_scripts(user_id);
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_read ON events(read);

-- ============================================
-- FUNCTION: Get highest bidder for a script
-- ============================================
CREATE OR REPLACE FUNCTION get_highest_bidder(script_id_param TEXT)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  amount INTEGER,
  expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.user_id,
    p.username,
    b.amount,
    b.expires_at
  FROM bids b
  JOIN profiles p ON b.user_id = p.id
  WHERE b.script_id = script_id_param
    AND b.is_active = true
    AND b.expires_at > NOW()
  ORDER BY b.amount DESC, b.created_at ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Close expired auctions
-- ============================================
CREATE OR REPLACE FUNCTION close_expired_auctions()
RETURNS void AS $$
DECLARE
  expired_bid RECORD;
  script_data RECORD;
  user_balance INTEGER;
BEGIN
  -- Find all expired bids that are still active
  FOR expired_bid IN 
    SELECT DISTINCT ON (script_id)
      b.id,
      b.script_id,
      b.user_id,
      b.amount,
      s.title,
      s.genre,
      s.quality,
      s.complexity,
      s.description,
      s.tagline,
      s.required_cast,
      s.tone
    FROM bids b
    JOIN scripts s ON b.script_id = s.id
    WHERE b.is_active = true
      AND b.expires_at <= NOW()
    ORDER BY b.script_id, b.amount DESC, b.created_at ASC
  LOOP
    -- Get user's current balance
    SELECT balance INTO user_balance
    FROM game_state
    WHERE user_id = expired_bid.user_id;

    -- Check if user can afford it
    IF user_balance >= expired_bid.amount THEN
      -- Deduct balance
      UPDATE game_state
      SET balance = balance - expired_bid.amount,
          updated_at = NOW()
      WHERE user_id = expired_bid.user_id;

      -- Transfer script to owned
      INSERT INTO owned_scripts (
        user_id,
        script_id,
        title,
        genre,
        quality,
        complexity,
        purchase_price,
        description,
        tagline,
        required_cast,
        tone
      ) VALUES (
        expired_bid.user_id,
        expired_bid.script_id,
        expired_bid.title,
        expired_bid.genre,
        expired_bid.quality,
        expired_bid.complexity,
        expired_bid.amount,
        expired_bid.description,
        expired_bid.tagline,
        expired_bid.required_cast,
        expired_bid.tone
      );

      -- Create success event
      INSERT INTO events (user_id, type, message)
      VALUES (
        expired_bid.user_id,
        'GOOD',
        'AUCTION WON: Rights to "' || expired_bid.title || '" secured for $' || expired_bid.amount || '!'
      );

      -- Remove script from market
      DELETE FROM scripts WHERE id = expired_bid.script_id;
    ELSE
      -- Create failure event
      INSERT INTO events (user_id, type, message)
      VALUES (
        expired_bid.user_id,
        'BAD',
        'AUCTION FAILED: Insufficient funds for "' || expired_bid.title || '". Need $' || expired_bid.amount || '.'
      );
    END IF;

    -- Mark all bids for this script as inactive
    UPDATE bids
    SET is_active = false
    WHERE script_id = expired_bid.script_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Auto-close auctions every minute
-- ============================================
-- Note: You'll need to set up a cron job or use Supabase Edge Functions
-- For now, you can manually call: SELECT close_expired_auctions();
