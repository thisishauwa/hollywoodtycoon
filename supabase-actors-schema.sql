-- Actors table for shared talent pool
CREATE TABLE IF NOT EXISTS actors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
  tier TEXT NOT NULL CHECK (tier IN ('A-List', 'B-List', 'C-List', 'Indie Darling', 'Newcomer')),
  salary INTEGER NOT NULL,
  reputation INTEGER NOT NULL DEFAULT 50 CHECK (reputation >= 0 AND reputation <= 100),
  skill INTEGER NOT NULL DEFAULT 50 CHECK (skill >= 0 AND skill <= 100),
  genres TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'In Production', 'Retired', 'Deceased', 'On Hiatus')),
  bio TEXT,
  visual_description TEXT,
  personality TEXT[] DEFAULT '{}',
  relationships JSONB DEFAULT '{}',
  gossip TEXT[] DEFAULT '{}',
  hired_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_actors_status ON actors(status);
CREATE INDEX IF NOT EXISTS idx_actors_tier ON actors(tier);
CREATE INDEX IF NOT EXISTS idx_actors_hired_by ON actors(hired_by);

-- Enable RLS
ALTER TABLE actors ENABLE ROW LEVEL SECURITY;

-- Everyone can view actors
CREATE POLICY "Anyone can view actors" ON actors
  FOR SELECT USING (true);

-- Only the system can insert/update actors (or we can allow hiring)
CREATE POLICY "Users can hire available actors" ON actors
  FOR UPDATE USING (
    status = 'Available' OR hired_by = auth.uid()
  )
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_actors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER actors_updated_at
  BEFORE UPDATE ON actors
  FOR EACH ROW
  EXECUTE FUNCTION update_actors_updated_at();

-- Enable realtime for actors
ALTER PUBLICATION supabase_realtime ADD TABLE actors;
