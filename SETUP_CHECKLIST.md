# 📋 Devnet Setup Checklist

## ✅ Installation Progress

### Step 1: Install Solana CLI
- [ ] Download from: https://github.com/solana-labs/solana/releases/latest
- [ ] Get file: `solana-install-init-x86_64-pc-windows-msvc.exe`
- [ ] Run the installer
- [ ] **RESTART TERMINAL** (important!)
- [ ] Verify: `solana --version`

### Step 2: Configure Solana
```bash
solana config set --url devnet
solana config get
```

### Step 3: Create Wallet
```bash
solana-keygen new
# ⚠️ SAVE YOUR SEED PHRASE!
```

### Step 4: Get Devnet SOL
```bash
solana airdrop 2
solana balance
```

### Step 5: Get Your Wallet Address
```bash
solana address
# Copy this address for the faucet!
```

### Step 6: Get Devnet USDC
- [ ] Visit: https://faucet.circle.com/
- [ ] Select "Solana Devnet"
- [ ] Paste your wallet address
- [ ] Request USDC
- [ ] Wait for confirmation

### Step 7: Verify USDC Balance
```bash
spl-token balance 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
```

### Step 8: Install Rust (if needed)
- [ ] Check: `rustc --version`
- [ ] If not installed: https://rustup.rs/
- [ ] Restart terminal after installing

### Step 9: Install Anchor CLI
```bash
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked
# This takes 10-20 minutes
```

### Step 10: Build Program
```bash
cd C:\Users\1arya\OneDrive\Desktop\polyield\polyield
anchor build
```

### Step 11: Get Program ID
```bash
anchor keys list
# Output: polyield_vault: <YOUR_PROGRAM_ID>
# COPY THIS ID!
```

### Step 12: Update Program ID in Code
Update in these 3 files:
1. `programs/polyield_vault/src/lib.rs` (line 8)
2. `Anchor.toml` (line 7)
3. `lib/solana/constants.ts` (line 14)

### Step 13: Rebuild & Deploy
```bash
anchor build
anchor deploy
```

### Step 14: Initialize Vault
```bash
npx ts-node scripts/initialize-vault.ts
```

### Step 15: Setup Phantom Wallet
- [ ] Install: https://phantom.app/
- [ ] Open Phantom
- [ ] Settings → Developer Settings
- [ ] Enable "Testnet Mode"
- [ ] Select "Devnet" network
- [ ] Verify your USDC shows up

### Step 16: Test the App!
```bash
pnpm run dev
# Go to http://localhost:3001/markets
```

- [ ] Connect Phantom
- [ ] Make a test deposit
- [ ] View transaction on Solscan

## 🔗 Important Links

- **Solana Downloads**: https://github.com/solana-labs/solana/releases/latest
- **Circle Faucet**: https://faucet.circle.com/
- **SOL Faucet**: https://faucet.solana.com/
- **Phantom Wallet**: https://phantom.app/
- **Solscan Devnet**: https://solscan.io/?cluster=devnet

## 📝 Your Info (Fill in as you go)

**Wallet Address**: 
```
(Run: solana address)
```

**Program ID**:
```
(Run: anchor keys list)
```

**Vault PDA**:
```
(From initialization script output)
```

## 🆘 Commands Reference

```bash
# Check Solana config
solana config get

# Check SOL balance
solana balance

# Check USDC balance
spl-token balance 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU

# View transactions
solana transaction-history $(solana address) --limit 5

# Build program
anchor build

# Deploy program
anchor deploy

# Test program
anchor test --skip-local-validator
```

---

**Current Status**: Installing Solana CLI...

**Next**: After installing, restart terminal and run the configuration commands!
