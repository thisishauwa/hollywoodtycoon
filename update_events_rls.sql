-- Enable RLS (just in case)
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;

-- DROP existing policies to be safe (safely)
DROP POLICY IF EXISTS "Users can read own events" ON game_events;
DROP POLICY IF EXISTS "Users can insert own events" ON game_events;
DROP POLICY IF EXISTS "Public can read global events" ON game_events;

-- 1. INSERT Policy: Users can only insert rows where user_id is their own
CREATE POLICY "Users can insert own events" 
ON game_events 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 2. SELECT Policy: Users can read their own events OR global events
CREATE POLICY "Users can read own or global events" 
ON game_events 
FOR SELECT 
TO authenticated 
USING (
  auth.uid() = user_id 
  OR 
  is_global = true
);

-- 3. UPDATE Policy: Users can only update their own events (e.g. mark as read)
CREATE POLICY "Users can update own events" 
ON game_events 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);
