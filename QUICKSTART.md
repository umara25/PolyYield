# 🚀 Quick Start - Testing on Devnet

## Step-by-Step Guide

### 1️⃣ Install Solana CLI
```powershell
# Download and install
cmd /c "curl https://release.solana.com/v1.18.4/solana-install-init-x86_64-pc-windows-msvc.exe --output C:\solana-installer.exe"
C:\solana-installer.exe v1.18.4
```

**Restart your terminal after installation!**

### 2️⃣ Configure for Devnet
```bash
solana config set --url devnet
solana config get
```

### 3️⃣ Create Wallet & Get SOL
```bash
# Create keypair (save the seed phrase!)
solana-keygen new

# Get your address
solana address

# Get devnet SOL
solana airdrop 2

# Check balance
solana balance
```

### 4️⃣ Get Devnet USDC
Visit: https://faucet.circle.com/
- Select "Solana Devnet"
- Paste your wallet address (from `solana address`)
- Request USDC

Or use: https://spl-token-faucet.com/?token-name=USDC

### 5️⃣ Install Anchor (if not installed)
```bash
# Check if Rust is installed
rustc --version

# If not, install from: https://rustup.rs/

# Then install Anchor
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked
```

### 6️⃣ Build & Deploy Program
```bash
cd C:\Users\1arya\OneDrive\Desktop\polyield\polyield

# Build
anchor build

# Get program ID
anchor keys list
# Save the output: polyield_vault: <YOUR_PROGRAM_ID>
```

### 7️⃣ Update Program ID

**Update these 3 files with your program ID:**

1. `programs/polyield_vault/src/lib.rs` - line 8:
```rust
declare_id!("YOUR_PROGRAM_ID");
```

2. `Anchor.toml` - line 7:
```toml
polyield_vault = "YOUR_PROGRAM_ID"
```

3. `lib/solana/constants.ts` - line 14:
```typescript
export const PROGRAM_ID = new PublicKey("YOUR_PROGRAM_ID")
```

### 8️⃣ Rebuild & Deploy
```bash
# Rebuild with correct ID
anchor build

# Deploy to devnet
anchor deploy

# You'll see: "Program Id: <YOUR_ID>"
```

### 9️⃣ Initialize Vault
```bash
# Install dependencies if needed
pnpm install

# Run initialization script
anchor run initialize

# Or manually:
npx ts-node scripts/initialize-vault.ts
```

You should see:
```
✅ Vault initialized successfully!
🔍 View on Solscan: https://solscan.io/tx/...?cluster=devnet
```

### 🔟 Setup Phantom Wallet

1. Install Phantom: https://phantom.app/
2. Open Phantom → Settings → Developer Settings
3. Enable "Testnet Mode"
4. Select "Devnet" network
5. Import your wallet (optional):
   - Get private key: `cat ~/.config/solana/id.json`
   - Phantom → Settings → Add Wallet → Import Private Key

### 1️⃣1️⃣ Test the App!

```bash
# Start dev server
pnpm run dev

# Open browser
# Go to: http://localhost:3001/markets
```

**In the app:**
1. Click "Select Wallet" → Choose Phantom
2. Approve connection (make sure Phantom is on Devnet!)
3. Click "Predict Yes" or "Predict No"
4. Click "[Deposit to Yes/No]"
5. Enter amount (e.g., 1.00 USDC)
6. Click "Deposit X USDC"
7. Approve in Phantom
8. Wait for confirmation
9. Click "View on Solscan" to see transaction!

## 🔍 Verify Everything Works

### Check Your USDC Balance
```bash
spl-token balance 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
```

### View on Solscan
```bash
# Your wallet
https://solscan.io/account/<YOUR_ADDRESS>?cluster=devnet

# Your transactions
https://solscan.io/account/<YOUR_ADDRESS>/transactions?cluster=devnet
```

### Check Vault PDA
After deployment, check vault balance:
```bash
# Get vault PDA from initialization logs
https://solscan.io/account/<VAULT_PDA>?cluster=devnet
```

## 🆘 Common Issues

**"solana: command not found"**
- Restart terminal after installing
- Add to PATH: `C:\Users\<USER>\.local\share\solana\install\active_release\bin`

**"Airdrop failed"**
- Use web faucet: https://faucet.solana.com/
- Or try: `solana airdrop 1` (smaller amount)

**"Insufficient funds for rent"**
- You need SOL for transaction fees
- Run: `solana airdrop 2`

**"Account not found" in app**
- Make sure Phantom is on Devnet
- Initialize vault first
- Check you have USDC in wallet

**Transaction fails**
- Check Solscan for error details
- Verify program ID matches in all files
- Ensure vault is initialized

## 📝 Next Steps

Once you confirm everything works:
1. ✅ Test deposits
2. ✅ Test withdrawals (add UI for this)
3. ✅ Test multiple markets
4. ✅ Verify Solscan shows correct data
5. ✅ Document any issues
6. ✅ Consider mainnet deployment strategy

## 🔗 Useful Links

- **Solscan Devnet**: https://solscan.io/?cluster=devnet
- **Solana Explorer**: https://explorer.solana.com/?cluster=devnet  
- **SOL Faucet**: https://faucet.solana.com/
- **USDC Faucet**: https://faucet.circle.com/
- **Phantom**: https://phantom.app/

---

**Need help?** Check `DEVNET_SETUP.md` for detailed instructions!
