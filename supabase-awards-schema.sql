-- Hollywood Tycoon - Awards System Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- AWARD CEREMONIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS award_ceremonies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  announced BOOLEAN DEFAULT false NOT NULL,
  completed BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE award_ceremonies ENABLE ROW LEVEL SECURITY;

-- Everyone can view ceremonies (public events)
CREATE POLICY "Anyone can view award ceremonies" ON award_ceremonies
  FOR SELECT USING (true);

-- Only service role can create/update ceremonies (automated process)
CREATE POLICY "Service role can manage ceremonies" ON award_ceremonies
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- AWARD NOMINATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS award_nominations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ceremony_id UUID REFERENCES award_ceremonies(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  movie_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  movie_title TEXT NOT NULL,
  studio_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES actors(id) ON DELETE CASCADE,
  actor_name TEXT,
  is_winner BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE award_nominations ENABLE ROW LEVEL SECURITY;

-- Everyone can view nominations (public events)
CREATE POLICY "Anyone can view nominations" ON award_nominations
  FOR SELECT USING (true);

-- Only service role can manage nominations
CREATE POLICY "Service role can manage nominations" ON award_nominations
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_nominations_ceremony ON award_nominations(ceremony_id);
CREATE INDEX IF NOT EXISTS idx_nominations_movie ON award_nominations(movie_id);
CREATE INDEX IF NOT EXISTS idx_nominations_studio ON award_nominations(studio_id);
CREATE INDEX IF NOT EXISTS idx_nominations_actor ON award_nominations(actor_id);
CREATE INDEX IF NOT EXISTS idx_nominations_winner ON award_nominations(is_winner) WHERE is_winner = true;

-- ============================================
-- UPDATE TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_ceremony_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ceremony_updated_at
  BEFORE UPDATE ON award_ceremonies
  FOR EACH ROW
  EXECUTE FUNCTION update_ceremony_timestamp();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get player's award statistics
CREATE OR REPLACE FUNCTION get_player_award_stats(player_id UUID)
RETURNS TABLE (
  total_nominations INTEGER,
  total_wins INTEGER,
  best_picture_wins INTEGER,
  acting_wins INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_nominations,
    COUNT(*) FILTER (WHERE is_winner = true)::INTEGER as total_wins,
    COUNT(*) FILTER (WHERE is_winner = true AND category = 'Best Picture')::INTEGER as best_picture_wins,
    COUNT(*) FILTER (WHERE is_winner = true AND category IN ('Best Actor', 'Best Actress'))::INTEGER as acting_wins
  FROM award_nominations
  WHERE studio_id = player_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get latest ceremony with nominations
CREATE OR REPLACE FUNCTION get_latest_ceremony()
RETURNS TABLE (
  ceremony_id UUID,
  ceremony_year INTEGER,
  ceremony_name TEXT,
  announced BOOLEAN,
  completed BOOLEAN,
  nomination_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ac.id,
    ac.year,
    ac.name,
    ac.announced,
    ac.completed,
    COUNT(an.id)::INTEGER as nomination_count
  FROM award_ceremonies ac
  LEFT JOIN award_nominations an ON an.ceremony_id = ac.id
  GROUP BY ac.id, ac.year, ac.name, ac.announced, ac.completed
  ORDER BY ac.year DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ENABLE REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE award_ceremonies;
ALTER PUBLICATION supabase_realtime ADD TABLE award_nominations;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT EXECUTE ON FUNCTION get_player_award_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_latest_ceremony TO authenticated;
