# Hollywood Tycoon XP - Setup Guide

## Prerequisites

- Node.js 18+
- Supabase account

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env.local` in the project root:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Set Up Supabase Database

Run these SQL files in your Supabase SQL Editor in order:

1. **`supabase-schema.sql`** - Creates profiles and game_saves tables
2. **`supabase-multiplayer-schema.sql`** - Creates multiplayer tables (scripts, bids, owned_scripts, game_state, events)
3. **`supabase-seed-scripts.sql`** - Seeds initial 12 scripts into the market

### 4. Enable Required Extensions

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

### 5. Set Up Automatic Auction Resolution

```sql
-- Direct SQL function call (simple approach)
SELECT cron.schedule(
  'close-expired-auctions',
  '* * * * *',
  $$ SELECT close_expired_auctions(); $$
);
```

### 6. Grant RPC Permissions

```sql
GRANT EXECUTE ON FUNCTION close_expired_auctions() TO authenticated;
GRANT EXECUTE ON FUNCTION close_expired_auctions() TO anon;
```

### 7. Auto-Create Profiles on Signup

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, industry_clout)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'Studio_' || substring(NEW.id::text, 1, 8)),
    30
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Running the App

```bash
npm run dev
```

Open http://localhost:5173

## Features

- **Real-time Multiplayer Bidding** - See other players' bids instantly
- **30-Second Auctions** - Scripts auto-close after 30 seconds
- **Automatic Resolution** - Cron job closes expired auctions every minute
- **Windows XP UI** - Authentic retro interface
- **Profile System** - Industry clout, balance, owned scripts

## Troubleshooting

### Infinite Loading

- Check browser console for errors
- Verify Supabase URL and anon key are correct
- Ensure all SQL migrations have been run

### Auctions Not Closing

- Check cron job is running: `SELECT * FROM cron.job;`
- Verify RPC permissions are granted
- Check execution history: `SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;`

### Profile Not Found

- Ensure the profile trigger is created
- Check RLS policies allow profile access
- Verify user exists in `auth.users` table
