-- Enable realtime for game_events table
-- This allows Variety to update automatically when new events are created

ALTER PUBLICATION supabase_realtime ADD TABLE game_events;

-- Verify it worked
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
