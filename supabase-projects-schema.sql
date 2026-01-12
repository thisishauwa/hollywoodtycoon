-- Hollywood Tycoon XP - Projects/Movies Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- PROJECTS TABLE (Movies in production or released)
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Ownership
  studio_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  script_id TEXT NOT NULL, -- Reference to original script
  
  -- Basic Info
  title TEXT NOT NULL,
  genre TEXT NOT NULL,
  
  -- Cast (array of actor IDs - TEXT to support both UUID and legacy string IDs)
  "cast" TEXT[] NOT NULL DEFAULT '{}',
  
  -- Budget
  production_budget INTEGER NOT NULL,
  marketing_budget INTEGER NOT NULL,
  current_budget_spent INTEGER DEFAULT 0,
  
  -- Production Status
  status TEXT NOT NULL DEFAULT 'Pre-Production' 
    CHECK (status IN ('Pre-Production', 'Filming', 'Post-Production', 'Marketing', 'Released')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  phase_progress INTEGER DEFAULT 0 CHECK (phase_progress >= 0 AND phase_progress <= 100),
  
  -- Quality Metrics
  quality INTEGER DEFAULT 50 CHECK (quality >= 0 AND quality <= 100),
  chemistry INTEGER DEFAULT 50 CHECK (chemistry >= 0 AND chemistry <= 100),
  
  -- Release Info
  release_month INTEGER,
  release_year INTEGER,
  estimated_release_month INTEGER,
  estimated_release_year INTEGER,
  
  -- Box Office
  revenue INTEGER DEFAULT 0,
  
  -- Reviews and Events
  reviews TEXT[] DEFAULT '{}',
  production_events JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_studio ON projects(studio_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_release ON projects(release_year, release_month);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Everyone can view all projects (for competition tracking)
CREATE POLICY "Anyone can view projects" ON projects
  FOR SELECT USING (true);

-- Users can create their own projects
CREATE POLICY "Users can create their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = studio_id);

-- Users can update their own projects
CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = studio_id);

-- Users can delete their own projects
CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = studio_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_projects_updated_at();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE projects;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get all active projects (not released)
CREATE OR REPLACE FUNCTION get_active_projects(user_id UUID)
RETURNS SETOF projects AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM projects
  WHERE studio_id = user_id
    AND status != 'Released'
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get released films for a studio
CREATE OR REPLACE FUNCTION get_released_films(user_id UUID)
RETURNS SETOF projects AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM projects
  WHERE studio_id = user_id
    AND status = 'Released'
  ORDER BY release_year DESC, release_month DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get box office rankings for a specific month/year
CREATE OR REPLACE FUNCTION get_box_office_rankings(
  target_month INTEGER,
  target_year INTEGER
)
RETURNS TABLE (
  rank BIGINT,
  project_id UUID,
  title TEXT,
  studio_id UUID,
  revenue INTEGER,
  quality INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY p.revenue DESC) as rank,
    p.id as project_id,
    p.title,
    p.studio_id,
    p.revenue,
    p.quality
  FROM projects p
  WHERE p.status = 'Released'
    AND p.release_month = target_month
    AND p.release_year = target_year
  ORDER BY p.revenue DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_active_projects TO authenticated;
GRANT EXECUTE ON FUNCTION get_released_films TO authenticated;
GRANT EXECUTE ON FUNCTION get_box_office_rankings TO authenticated;
