-- Migration: Add industry_clout to existing profiles table
-- Run this in your Supabase SQL Editor if the profiles table already exists

-- Add industry_clout column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS industry_clout INTEGER DEFAULT 30 NOT NULL;

-- Update existing profiles to have 30 clout
UPDATE profiles 
SET industry_clout = 30 
WHERE industry_clout IS NULL;
