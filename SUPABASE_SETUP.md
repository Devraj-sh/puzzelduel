# Supabase Setup Guide

## Prerequisites
- Supabase account (free tier works): https://supabase.com
- Node.js installed

## Step 1: Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in:
   - Name: `puzzelduel` (or your choice)
   - Database Password: (save this securely)
   - Region: Choose closest to you
4. Wait for project to be created

## Step 2: Run Database Migration

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase/migrations/20241116_create_game_tables.sql`
4. Paste into the SQL editor
5. Click "Run" or press `Ctrl+Enter`
6. You should see success messages for all tables created

## Step 3: Get API Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (for frontend)
   - **service_role** key (for backend - keep this secret!)

## Step 4: Configure Frontend

1. Copy `.env.example` to `.env` in project root:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your values:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_public_key
   ```

## Step 5: Configure Backend Server

1. Copy `server/.env.example` to `server/.env`:
   ```bash
   cp server/.env.example server/.env
   ```

2. Edit `server/.env` and fill in:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   PORT=3001
   ```

## Step 6: Test Database Connection

1. Start the server:
   ```bash
   npm run dev:server
   ```

2. Start the frontend:
   ```bash
   npm run dev
   ```

3. Create a room and play a game
4. Check Supabase dashboard → **Table Editor** to see:
   - `players` table should have your player names
   - `matches` table should have your game room
   - `level_results` table should have level completions

## Step 7: View Leaderboard

The leaderboard is automatically updated! Check:
- In Supabase: **Table Editor** → `leaderboard` view
- In your app: Navigate to Leaderboard page

## Features Now Available

### ✅ Persistent Storage
- All games saved to database
- Data persists across server restarts
- No data loss

### ✅ Real Leaderboard
- Track all players globally
- See win rates and best times
- Compare performance across all matches

### ✅ Player Statistics
- Total matches played
- Total wins
- Average completion time
- Best time per level

### ✅ Match History
- View past games
- See who played with whom
- Track level progression

## Troubleshooting

### "Can't connect to Supabase"
- Check `.env` files exist and have correct values
- Verify Project URL has `https://`
- Ensure no extra spaces in keys

### "RLS Policy Error"
- Make sure migration ran successfully
- Check all policies were created
- Try running migration again

### "Type errors in VS Code"
- Restart TypeScript server: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
- Close and reopen VS Code

### "No data showing in tables"
- Check server console for Supabase errors
- Verify environment variables loaded
- Check Supabase dashboard → **Logs** for errors

## Next Steps

Want to add more features?
- User authentication (login/signup)
- Private rooms
- Friend system
- Tournament mode
- Daily challenges

All of these are easy to add with Supabase!
