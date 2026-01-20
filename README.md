# PolyYield (Winner @ NexHacks 2026 🏆)

**No-lose prediction markets on Solana**

Predict the future, risk nothing. Winners earn yield, losers get their deposit back.

## What is PolyYield?

PolyYield lets you bet on real-world events (politics, crypto, sports, etc.) without risking your principal. Your USDC is deposited into a Solana vault; if you win, you earn yield from the losing pool. If you lose, you get your full deposit back.

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, Three.js
- **Blockchain:** Solana, Anchor 0.30.1 (Rust)
- **Database:** Supabase // PostgreSQL
- **Markets:** Polymarket API
- **Deployment:** Vercel

## Quick Start

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

Open http://localhost:3000

## Devnet Setup

1. **Install Solana CLI** and configure for devnet:
   ```bash
   solana config set --url devnet
   solana-keygen new
   solana airdrop 2
   ```

2. **Get devnet USDC** from https://faucet.circle.com/ (select Solana Devnet)

3. **Deploy the program:**
   ```bash
   anchor build
   anchor deploy
   npx ts-node scripts/initialize-vault.ts
   ```

4. **Connect Phantom** (set to Devnet mode) and start trading!

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key    
```

## Program ID

**Devnet:** `FWGiD7WhXu8k7eDtEwr3ZbXbvqwL7kdJgNfugrSVJ7F3`

## Project Structure

```
polyield/
├── app/                 # Next.js pages
├── components/          # React components
├── hooks/               # Custom hooks (deposit, markets, positions)
├── lib/
│   ├── solana/          # Blockchain integration
│   ├── database/        # Supabase service
│   └── api/             # Polymarket API
├── programs/            # Anchor smart contract
│   └── polyield_vault/
└── scripts/             # Deployment scripts
```

## Smart Contract

Three instructions:
- `initialize` — Create the vault
- `deposit` — Deposit USDC to YES or NO position
- `withdraw` — Withdraw USDC after market resolution

## Documentation

- [QUICKSTART.md](./QUICKSTART.md) — Step-by-step testing guide
- [DEVNET_SETUP.md](./DEVNET_SETUP.md) — Detailed Solana setup
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) — Database configuration

## Links

- [Solscan Devnet](https://solscan.io/?cluster=devnet)
- [Circle USDC Faucet](https://faucet.circle.com/)
- [SOL Faucet](https://faucet.solana.com/)
- [Phantom Wallet](https://phantom.app/)

---

Built on Solana 🟣
