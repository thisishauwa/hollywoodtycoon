-- Performance Optimization: Critical Database Indexes
-- Fixed column names based on actual schema
-- Run this in Supabase SQL Editor

-- ============================================
-- MESSAGES TABLE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_studio_messages_users 
  ON studio_messages(from_user_id, to_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_studio_messages_recipient_unread 
  ON studio_messages(to_user_id, is_read, created_at DESC) 
  WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_studio_messages_public 
  ON studio_messages(is_public, created_at DESC) 
  WHERE is_public = true;

-- ============================================
-- BIDS TABLE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_bids_script_active 
  ON bids(script_id, is_active, amount DESC) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_bids_user_active 
  ON bids(user_id, is_active, created_at DESC) 
  WHERE is_active = true;

-- ============================================
-- OWNED SCRIPTS INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_owned_scripts_user 
  ON owned_scripts(user_id, acquired_at DESC);

CREATE INDEX IF NOT EXISTS idx_owned_scripts_global 
  ON owned_scripts(script_id);

-- ============================================
-- PROJECTS TABLE INDEXES (uses studio_id, not user_id!)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_projects_studio_status 
  ON projects(studio_id, status, updated_at DESC);

-- Note: idx_projects_status already exists in schema
-- Note: idx_projects_release already exists in schema

-- ============================================
-- CONTRACTS TABLE INDEXES (uses studio_id, not user_id!)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_contracts_studio_date 
  ON actor_contracts(studio_id, created_at DESC);

-- Note: idx_contracts_studio already exists in schema
-- Note: idx_contracts_actor already exists in schema
-- Note: idx_contracts_status already exists in schema

-- ============================================
-- GAME EVENTS INDEXES
-- ============================================
-- Note: idx_events_user already exists in schema
-- Note: idx_events_date already exists in schema  
-- Note: idx_events_unread already exists in schema

-- ============================================
-- ACTORS TABLE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_actors_available 
  ON actors(status, tier) 
  WHERE status = 'Available';

-- Update query planner statistics
ANALYZE;
