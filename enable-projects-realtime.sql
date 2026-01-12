-- Enable realtime for projects table
-- This allows the UI to automatically update when production advances

-- Add projects table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE projects;

-- Verify it worked
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
