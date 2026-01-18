-- Create user_positions table to store all user positions across wallets and browsers
-- This replaces the localStorage-based approach with persistent database storage

CREATE TABLE IF NOT EXISTS user_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT NOT NULL,
    market_id TEXT NOT NULL,
    market_question TEXT NOT NULL,
    position TEXT NOT NULL CHECK (position IN ('YES', 'NO')),
    amount DECIMAL(20, 6) NOT NULL,
    transaction_signature TEXT,
    timestamp TIMESTAMPTZ NOT NULL,
    expiry_timestamp TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'claimed', 'refunded')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_positions_wallet_address ON user_positions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_positions_market_id ON user_positions(market_id);
CREATE INDEX IF NOT EXISTS idx_user_positions_status ON user_positions(status);
CREATE INDEX IF NOT EXISTS idx_user_positions_wallet_status ON user_positions(wallet_address, status);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function before each update
CREATE TRIGGER update_user_positions_updated_at
    BEFORE UPDATE ON user_positions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE user_positions ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now
-- You can make this more restrictive based on your auth requirements
CREATE POLICY "Enable all operations for all users" ON user_positions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Add a comment to the table
COMMENT ON TABLE user_positions IS 'Stores user positions for Polyield markets, indexed by wallet address for cross-device/browser persistence';
