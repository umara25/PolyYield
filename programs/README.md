# Polyield Vault - Solana Anchor Program

A PDA-controlled USDC vault for prediction market deposits on Solana.

## Security Features

1. **PDA-Controlled Vault**: The vault token account is owned by a Program Derived Address (PDA), meaning only the program can authorize withdrawals - no single person holds the keys
2. **User Deposit Tracking**: Each deposit is recorded in a PDA account per user, ensuring proper accounting
3. **Admin Controls**: Initialize vault with admin authority for emergencies

## Prerequisites

Before deploying, you need to install:

### 1. Install Rust

```bash
# Windows (use rustup-init.exe from https://rustup.rs/)
# Or on WSL/Linux:
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 2. Install Solana CLI

```bash
# Windows (PowerShell - run as Admin)
choco install solana

# Or on WSL/Linux:
sh -c "$(curl -sSfL https://release.solana.com/v1.18.4/install)"
```

### 3. Install Anchor CLI

```bash
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked
```

### 4. Configure Solana for Devnet

```bash
# Set to devnet
solana config set --url devnet

# Create a new keypair (if you don't have one)
solana-keygen new

# Get some devnet SOL for deployment
solana airdrop 2
```

## Deployment Steps

### 1. Build the program

```bash
# From the project root
anchor build
```

### 2. Get your Program ID

After building, get your program ID:

```bash
anchor keys list
```

### 3. Update Program ID

Update the program ID in these files:
- `programs/polyield_vault/src/lib.rs` - `declare_id!("YOUR_PROGRAM_ID")`
- `Anchor.toml` - `polyield_vault = "YOUR_PROGRAM_ID"`
- `lib/solana/constants.ts` - `PROGRAM_ID = new PublicKey("YOUR_PROGRAM_ID")`

### 4. Rebuild with correct Program ID

```bash
anchor build
```

### 5. Deploy to Devnet

```bash
anchor deploy
```

### 6. Initialize the Vault

After deployment, you need to initialize the vault. Create a script or use the Anchor CLI:

```bash
# Using anchor test (which runs the test scripts)
anchor test --skip-local-validator
```

Or create an initialization script - see `tests/initialize.ts`.

## Program Instructions

### `initialize`
Creates the PDA-controlled vault token account. Must be called once by admin.

**Accounts:**
- `admin` - Signer, pays for account creation
- `mint` - USDC mint address
- `vault_state` - PDA storing vault metadata
- `vault` - PDA token account for holding USDC

### `deposit`
Deposits USDC into a market position.

**Args:**
- `amount` - Amount in USDC lamports (6 decimals)
- `market_id` - String identifier for the market
- `position` - `Yes` (0) or `No` (1)

**Accounts:**
- `user` - Signer making the deposit
- `mint` - USDC mint
- `vault_state` - Vault state PDA
- `vault` - Vault token account PDA
- `user_token_account` - User's USDC token account
- `user_deposit` - PDA tracking user's deposit for this market/position

### `withdraw`
Withdraws USDC from a market position.

**Args:**
- `amount` - Amount to withdraw in USDC lamports

## Important Addresses

### Devnet USDC Mint
```
4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
```

### Getting Devnet USDC

You can get Devnet USDC from:
1. [Circle's Devnet Faucet](https://faucet.circle.com/)
2. [Solana Devnet Faucet with SPL tokens](https://spl-token-faucet.com/)

## Testing

```bash
# Run all tests
anchor test

# Run tests without starting local validator (uses devnet)
anchor test --skip-local-validator
```

## Vault Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                    POLYIELD VAULT                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   User A ──────┐                                             │
│                │                                             │
│   User B ──────┼──► USDC ──► [Vault PDA] ◄── Program Only   │
│                │                   │                         │
│   User C ──────┘                   │                         │
│                                    ▼                         │
│                            ┌──────────────┐                  │
│                            │ User Deposit │                  │
│                            │    PDAs      │                  │
│                            │  (Records)   │                  │
│                            └──────────────┘                  │
│                                                              │
│   • No admin can withdraw user funds arbitrarily             │
│   • All deposits tracked per-user, per-market, per-position  │
│   • Program logic controls all fund movements                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```
