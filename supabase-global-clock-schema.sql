-- Hollywood Tycoon XP - Global Clock & Messaging Schema
-- Run this in your Supabase SQL Editor AFTER the base schema

-- ============================================
-- GLOBAL GAME CLOCK (Single row - shared by all players)
-- ============================================
CREATE TABLE global_game_clock (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Ensures single row
  month INTEGER DEFAULT 1 NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER DEFAULT 2003 NOT NULL,
  last_advanced_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  advance_interval_hours INTEGER DEFAULT 48 NOT NULL, -- 48 hours = 2 days per game month
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE global_game_clock ENABLE ROW LEVEL SECURITY;

-- Everyone can view the global clock
CREATE POLICY "Global clock is viewable by everyone"
  ON global_game_clock FOR SELECT
  USING (true);

-- Only service role can update (via Edge Function)
CREATE POLICY "Only service role can update global clock"
  ON global_game_clock FOR UPDATE
  USING (auth.role() = 'service_role');

-- Insert initial row
INSERT INTO global_game_clock (id, month, year) VALUES (1, 1, 2003)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STUDIO MESSAGES (Real player-to-player messaging)
-- ============================================
CREATE TABLE studio_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false NOT NULL, -- If true, visible to press/all players
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE studio_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages they sent or received
CREATE POLICY "Users can view their own messages"
  ON studio_messages FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Users can view all public messages
CREATE POLICY "Public messages are viewable by everyone"
  ON studio_messages FOR SELECT
  USING (is_public = true);

-- Users can send messages (insert)
CREATE POLICY "Users can send messages"
  ON studio_messages FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- Users can mark their received messages as read
CREATE POLICY "Users can update their received messages"
  ON studio_messages FOR UPDATE
  USING (auth.uid() = to_user_id);

-- ============================================
-- MONEY TRANSFERS (Track wire transfers between players)
-- ============================================
CREATE TABLE money_transfers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE money_transfers ENABLE ROW LEVEL SECURITY;

-- Users can view transfers they sent or received
CREATE POLICY "Users can view their own transfers"
  ON money_transfers FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Users can send transfers
CREATE POLICY "Users can send transfers"
  ON money_transfers FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX idx_studio_messages_from ON studio_messages(from_user_id);
CREATE INDEX idx_studio_messages_to ON studio_messages(to_user_id);
CREATE INDEX idx_studio_messages_created ON studio_messages(created_at DESC);
CREATE INDEX idx_studio_messages_public ON studio_messages(is_public) WHERE is_public = true;
CREATE INDEX idx_money_transfers_from ON money_transfers(from_user_id);
CREATE INDEX idx_money_transfers_to ON money_transfers(to_user_id);

-- ============================================
-- FUNCTION: Advance Global Clock
-- Call this via a scheduled Edge Function or cron job
-- ============================================
CREATE OR REPLACE FUNCTION advance_global_clock()
RETURNS TABLE (
  new_month INTEGER,
  new_year INTEGER,
  advanced BOOLEAN
) AS $$
DECLARE
  current_clock RECORD;
  next_month INTEGER;
  next_year INTEGER;
  hours_since_last_advance FLOAT;
BEGIN
  -- Get current clock
  SELECT * INTO current_clock FROM global_game_clock WHERE id = 1;

  -- Calculate hours since last advance
  hours_since_last_advance := EXTRACT(EPOCH FROM (NOW() - current_clock.last_advanced_at)) / 3600;

  -- Check if enough time has passed
  IF hours_since_last_advance >= current_clock.advance_interval_hours THEN
    -- Calculate next month/year
    next_month := current_clock.month + 1;
    next_year := current_clock.year;

    IF next_month > 12 THEN
      next_month := 1;
      next_year := next_year + 1;
    END IF;

    -- Update the clock
    UPDATE global_game_clock
    SET month = next_month,
        year = next_year,
        last_advanced_at = NOW()
    WHERE id = 1;

    -- Process monthly contracts (salary deductions and expirations)
    PERFORM process_monthly_contracts(next_month, next_year);

    RETURN QUERY SELECT next_month, next_year, true;
  ELSE
    RETURN QUERY SELECT current_clock.month, current_clock.year, false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Get time until next advance
-- ============================================
CREATE OR REPLACE FUNCTION get_time_until_next_advance()
RETURNS TABLE (
  hours_remaining FLOAT,
  next_advance_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  current_clock RECORD;
BEGIN
  SELECT * INTO current_clock FROM global_game_clock WHERE id = 1;

  RETURN QUERY SELECT
    GREATEST(0, current_clock.advance_interval_hours - EXTRACT(EPOCH FROM (NOW() - current_clock.last_advanced_at)) / 3600)::FLOAT,
    current_clock.last_advanced_at + (current_clock.advance_interval_hours || ' hours')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Atomic Money Transfer
-- Handles transfer in a single transaction with proper validation
-- ============================================
CREATE OR REPLACE FUNCTION transfer_money(
  sender_id UUID,
  recipient_id UUID,
  transfer_amount INTEGER
)
RETURNS TABLE (
  success BOOLEAN,
  error_message TEXT,
  sender_new_balance INTEGER,
  recipient_new_balance INTEGER
) AS $$
DECLARE
  sender_balance INTEGER;
  recipient_balance INTEGER;
  recipient_exists BOOLEAN;
BEGIN
  -- Validate inputs
  IF sender_id = recipient_id THEN
    RETURN QUERY SELECT false, 'Cannot transfer to yourself'::TEXT, NULL::INTEGER, NULL::INTEGER;
    RETURN;
  END IF;

  IF transfer_amount <= 0 THEN
    RETURN QUERY SELECT false, 'Amount must be positive'::TEXT, NULL::INTEGER, NULL::INTEGER;
    RETURN;
  END IF;

  -- Lock sender's row to prevent race conditions
  SELECT balance INTO sender_balance
  FROM game_state
  WHERE user_id = sender_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Sender account not found'::TEXT, NULL::INTEGER, NULL::INTEGER;
    RETURN;
  END IF;

  IF sender_balance < transfer_amount THEN
    RETURN QUERY SELECT false, ('Insufficient funds. You have $' || sender_balance)::TEXT, NULL::INTEGER, NULL::INTEGER;
    RETURN;
  END IF;

  -- Check if recipient exists, create if not
  SELECT EXISTS(SELECT 1 FROM game_state WHERE user_id = recipient_id) INTO recipient_exists;

  IF NOT recipient_exists THEN
    -- Create recipient's game state with defaults
    INSERT INTO game_state (user_id, balance, reputation, month, year)
    VALUES (recipient_id, 5000000, 30, 1, 2003);
    recipient_balance := 5000000;
  ELSE
    -- Lock recipient's row
    SELECT balance INTO recipient_balance
    FROM game_state
    WHERE user_id = recipient_id
    FOR UPDATE;
  END IF;

  -- Perform the transfer
  UPDATE game_state
  SET balance = balance - transfer_amount,
      updated_at = NOW()
  WHERE user_id = sender_id;

  UPDATE game_state
  SET balance = balance + transfer_amount,
      updated_at = NOW()
  WHERE user_id = recipient_id;

  -- Record the transfer
  INSERT INTO money_transfers (from_user_id, to_user_id, amount)
  VALUES (sender_id, recipient_id, transfer_amount);

  -- Return success with new balances
  RETURN QUERY SELECT
    true,
    NULL::TEXT,
    (sender_balance - transfer_amount),
    (recipient_balance + transfer_amount);

EXCEPTION WHEN OTHERS THEN
  -- Any error rolls back the transaction automatically
  RETURN QUERY SELECT false, SQLERRM::TEXT, NULL::INTEGER, NULL::INTEGER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION transfer_money TO authenticated;

-- ============================================
-- Enable Realtime for global clock
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE global_game_clock;
ALTER PUBLICATION supabase_realtime ADD TABLE studio_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE money_transfers;
