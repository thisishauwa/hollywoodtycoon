-- Hollywood Tycoon XP - Game Events Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- GAME EVENTS TABLE (News, notifications, etc)
-- ============================================
CREATE TABLE IF NOT EXISTS game_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Event details
  event_type TEXT NOT NULL, -- 'news', 'good', 'bad', 'info', etc.
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Timing
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_user ON game_events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON game_events(year DESC, month DESC);
CREATE INDEX IF NOT EXISTS idx_events_unread ON game_events(user_id, is_read) WHERE is_read = false;

-- Enable RLS
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own events
CREATE POLICY "Users can view their own events" ON game_events
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own events
CREATE POLICY "Users can create their own events" ON game_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own events (mark as read)
CREATE POLICY "Users can update their own events" ON game_events
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own events
CREATE POLICY "Users can delete their own events" ON game_events
  FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE game_events;
