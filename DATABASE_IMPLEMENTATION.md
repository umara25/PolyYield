# Database Implementation Guide

## Overview

This implementation replaces the localStorage-based position tracking with a persistent Supabase database. This ensures users can access their positions and markets from any browser or device by connecting their wallet.

## Key Features

✅ **Cross-Device Persistence** - Users can see their positions anywhere they connect their wallet  
✅ **No API Key Hardcoding** - All credentials stored in `.env.local`  
✅ **Automatic Fallback** - Falls back to localStorage if Supabase is not configured  
✅ **Transaction Tracking** - Stores Solana transaction signatures with each position  
✅ **Market History** - Tracks all markets a user has entered  

## Architecture

### Database Layer
- **`lib/database/supabase.ts`** - Supabase client initialization
- **`lib/database/types.ts`** - TypeScript type definitions for database tables
- **`lib/database/positions-service.ts`** - Service layer for position CRUD operations
- **`lib/database/migrations/001_initial_schema.sql`** - SQL migration for table creation

### Updated Hooks
- **`hooks/use-positions.ts`** - Now fetches positions from Supabase (with localStorage fallback)
- **`hooks/use-deposit.ts`** - Automatically saves positions to database after successful deposits

### Updated Components
- **`components/deposit-modal.tsx`** - Passes required parameters to save positions

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/log in
2. Create a new project
3. Wait for the project to finish provisioning

### 2. Run the Database Migration

1. Navigate to your Supabase project dashboard
2. Go to **SQL Editor** (in the left sidebar)
3. Click **New Query**
4. Copy the contents of `lib/database/migrations/001_initial_schema.sql`
5. Paste into the SQL Editor
6. Click **Run** to execute the migration

This will create:
- `user_positions` table with proper indexes
- Automatic `updated_at` timestamp triggers
- Row Level Security policies

### 3. Configure Environment Variables

1. In your Supabase project, go to **Settings > API**
2. Copy your **Project URL** and **anon/public key**
3. Create a `.env.local` file in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

4. **Important:** Never commit `.env.local` to version control (it's already in `.gitignore`)

### 4. Restart Your Development Server

```bash
pnpm dev
```

## Database Schema

### `user_positions` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `wallet_address` | TEXT | User's Solana wallet address |
| `market_id` | TEXT | Unique market identifier |
| `market_question` | TEXT | The market's question/title |
| `position` | TEXT | 'YES' or 'NO' |
| `amount` | DECIMAL(20,6) | Deposit amount in USDC |
| `transaction_signature` | TEXT | Solana transaction signature |
| `timestamp` | TIMESTAMPTZ | When the position was created |
| `expiry_timestamp` | TIMESTAMPTZ | When the market expires |
| `status` | TEXT | 'active', 'claimed', or 'refunded' |
| `created_at` | TIMESTAMPTZ | Database record creation time |
| `updated_at` | TIMESTAMPTZ | Last update time |

### Indexes

- `idx_user_positions_wallet_address` - Fast lookup by wallet
- `idx_user_positions_market_id` - Fast lookup by market
- `idx_user_positions_status` - Filter by status
- `idx_user_positions_wallet_status` - Combined wallet + status queries

## Usage

### Querying Positions

The service layer provides several convenience functions:

```typescript
// Get all positions for a wallet
const positions = await getPositionsByWallet(walletAddress)

// Get only active positions
const activePositions = await getActivePositions(walletAddress)

// Get positions for a specific market
const marketPositions = await getPositionsByMarket(marketId)
```

### Creating Positions

Positions are automatically created when users make deposits through the `deposit-modal.tsx` component:

```typescript
await createPosition({
  walletAddress: publicKey.toBase58(),
  marketId,
  marketQuestion,
  position,
  amount,
  transactionSignature: signature,
  timestamp: Date.now(),
  expiryTimestamp,
})
```

### Updating Position Status

When a market is resolved, you can update position statuses:

```typescript
await updatePositionStatus(positionId, "claimed")
// or
await updatePositionStatus(positionId, "refunded")
```

## Fallback Behavior

If Supabase is not configured (missing environment variables), the system automatically falls back to localStorage:

- Positions are stored per wallet address in browser storage
- Data persists only on the same browser/device
- No cross-device synchronization
- Console warnings will indicate fallback mode

To check configuration status:

```typescript
import { isSupabaseConfigured } from '@/lib/database/positions-service'

if (isSupabaseConfigured()) {
  // Using Supabase
} else {
  // Using localStorage fallback
}
```

## Security Considerations

### Row Level Security (RLS)

The database has RLS enabled with a permissive policy. For production, consider implementing wallet-based authentication:

```sql
-- Example: Restrict to authenticated users
CREATE POLICY "Users can only view their own positions"
  ON user_positions
  FOR SELECT
  USING (wallet_address = auth.jwt() ->> 'wallet_address');
```

### API Keys

- The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to expose in the browser
- It only has permissions you configure in Supabase RLS policies
- Never expose your service role key or other sensitive credentials

## Troubleshooting

### "Missing Supabase environment variables" Error

- Ensure `.env.local` exists in the project root
- Verify the file contains valid `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart your development server after adding environment variables

### Positions Not Showing Up

1. Check browser console for errors
2. Verify the SQL migration ran successfully in Supabase
3. Check Supabase logs for any RLS policy issues
4. Ensure wallet is connected

### "Failed to fetch positions" Error

- Verify your Supabase project is running
- Check your internet connection
- Verify the project URL in `.env.local` is correct
- Check Supabase dashboard for any service issues

## Migration from localStorage

Existing positions stored in localStorage will **not** automatically migrate to the database. Users will need to:

1. View their positions one final time (they'll load from localStorage)
2. After Supabase is configured, new deposits will save to the database
3. Old positions will remain in localStorage but won't appear after clearing browser data

To implement a migration script, you could:

```typescript
// Example migration (run once per user)
function migrateLocalStorageToSupabase(walletAddress: string) {
  const stored = localStorage.getItem(`polyield_positions_${walletAddress}`)
  if (stored) {
    const positions = JSON.parse(stored)
    // Batch insert to Supabase
    positions.forEach(pos => createPosition({...pos, walletAddress}))
    // Optionally clear localStorage after successful migration
  }
}
```

## Next Steps

- [ ] Implement wallet-based authentication for RLS
- [ ] Add position update endpoints for claiming/refunding
- [ ] Create admin dashboard for market resolution
- [ ] Implement real-time subscriptions for live position updates
- [ ] Add analytics and reporting queries

## Support

For issues or questions:
- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the `SUPABASE_SETUP.md` guide
- Check Supabase project logs in the dashboard
