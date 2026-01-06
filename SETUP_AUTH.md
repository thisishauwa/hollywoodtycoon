# Authentication Setup Guide

## Step 1: Install Supabase

Run this command in your terminal:

```bash
npm install @supabase/supabase-js
```

## Step 2: Create Supabase Project

1. Go to https://supabase.com
2. Click "Start your project"
3. Create a new project
4. Wait for the project to finish setting up (~2 minutes)

## Step 3: Run Database Schema

1. In your Supabase project, go to the SQL Editor
2. Copy the contents of `supabase-schema.sql`
3. Paste it into the SQL Editor
4. Click "Run" to execute the schema

## Step 4: Get Your Credentials

1. In Supabase, go to Settings > API
2. Copy your Project URL
3. Copy your `anon` `public` key

## Step 5: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 6: Restart Development Server

```bash
npm run dev
```

## Features Enabled

✅ User sign up with email/password
✅ User sign in
✅ User sign out
✅ Profile management (username, avatar)
✅ Game state persistence to cloud
✅ Auto-save functionality
✅ Multiple save slots per user

## Testing

1. Click "Log off" in the Start Menu
2. You'll see the Windows XP-style login screen
3. Create a new account
4. Your game progress will now be saved to the cloud!
