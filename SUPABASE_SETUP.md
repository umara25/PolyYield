# Supabase Setup Guide

## Prerequisites

1. Create a Supabase account at https://supabase.com
2. Create a new project in Supabase

## Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
# Get these values from your Supabase project settings: https://app.supabase.com/project/_/settings/api

# Your Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here

# Your Supabase anonymous/public key (safe to expose in browser)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Important:** The `.env.local` file is already in `.gitignore` and will not be committed to version control.

## Database Schema

Run the SQL migration in `lib/database/migrations/001_initial_schema.sql` in your Supabase SQL Editor to create the necessary tables:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of the migration file
4. Execute the SQL

## Table Structure

### `user_positions` Table
- Stores all user positions across wallets and browsers
- Linked to wallet addresses for cross-device/browser persistence
- Tracks market entries, positions (YES/NO), amounts, and timestamps

## Usage

Once configured, the app will automatically:
- Store positions when users make deposits
- Fetch positions when users connect their wallet
- Sync positions across any browser or device where the user connects with the same wallet
