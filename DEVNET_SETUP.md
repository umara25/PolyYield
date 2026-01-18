# Solana Devnet Testing Setup Guide

## Prerequisites Installation

### 1. Install Solana CLI

**Option A: Using Official Installer (Recommended)**
1. Download from: https://github.com/solana-labs/solana/releases
2. Get the latest `solana-install-init-x86_64-pc-windows-msvc.exe`
3. Run the installer
4. Restart your terminal/PowerShell

**Option B: Using Chocolatey**
```powershell
choco install solana
```

**Option C: Manual Install via PowerShell**
```powershell
# Download and run the installer
cmd /c "curl https://release.solana.com/v1.18.4/solana-install-init-x86_64-pc-windows-msvc.exe --output C:\solana-installer.exe"
C:\solana-installer.exe v1.18.4
```

After installation, verify:
```bash
solana --version
```

### 2. Install Anchor CLI (for deploying the program)

First, ensure you have Rust installed:
```bash
rustc --version
```

If not, install Rust from: https://rustup.rs/

Then install Anchor:
```bash
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked
```

## Devnet Configuration

### 1. Configure Solana for Devnet
```bash
# Set cluster to devnet
solana config set --url devnet

# Verify configuration
solana config get
```

### 2. Create a Keypair (Wallet)
```bash
# Create a new keypair
solana-keygen new --outfile ~/.config/solana/id.json

# Or if you want to recover from seed phrase
solana-keygen recover --outfile ~/.config/solana/id.json
```

Save your seed phrase securely!

### 3. Check Your Address
```bash
solana address
```

### 4. Get Devnet SOL (Airdrop)
```bash
# Request 2 SOL (for transaction fees)
solana airdrop 2

# Check balance
solana balance
```

If airdrop doesn't work, try:
- https://faucet.solana.com/
- https://solfaucet.com/

### 5. Get Devnet USDC

**Devnet USDC Mint:** `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`

You can get devnet USDC from:
1. **Circle's Faucet**: https://faucet.circle.com/ (select Solana Devnet)
2. **SPL Token Faucet**: https://spl-token-faucet.com/?token-name=USDC
3. **Manually create and mint** (if you have SOL):

```bash
# Create USDC token account for yourself
spl-token create-account 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU

# Check your USDC balance
spl-token balance 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
```

## Deploy the Anchor Program

### 1. Build the Program
```bash
cd C:\Users\1arya\OneDrive\Desktop\polyield\polyield
anchor build
```

### 2. Get Your Program ID
```bash
anchor keys list
```

Output will show:
```
polyield_vault: <YOUR_PROGRAM_ID>
```

### 3. Update Program ID in Code

Update these files with your actual program ID:

**File: `programs/polyield_vault/src/lib.rs`**
```rust
declare_id!("YOUR_PROGRAM_ID_HERE");
```

**File: `Anchor.toml`**
```toml
[programs.devnet]
polyield_vault = "YOUR_PROGRAM_ID_HERE"
```

**File: `lib/solana/constants.ts`**
```typescript
export const PROGRAM_ID = new PublicKey("YOUR_PROGRAM_ID_HERE")
```

### 4. Rebuild with Correct ID
```bash
anchor build
```

### 5. Deploy to Devnet
```bash
anchor deploy
```

This will output your program address. Save it!

### 6. Initialize the Vault

Create a script `scripts/initialize-vault.ts`:
```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PolyieldVault as Program;

  const [vaultPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), USDC_MINT.toBuffer()],
    program.programId
  );

  const [vaultStatePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault_state"), USDC_MINT.toBuffer()],
    program.programId
  );

  console.log("Initializing vault...");
  console.log("Vault PDA:", vaultPDA.toBase58());
  console.log("Vault State PDA:", vaultStatePDA.toBase58());

  const tx = await program.methods
    .initialize()
    .accounts({
      admin: provider.wallet.publicKey,
      mint: USDC_MINT,
      vaultState: vaultStatePDA,
      vault: vaultPDA,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log("✅ Vault initialized!");
  console.log("Transaction:", tx);
  console.log("View on Solscan:", `https://solscan.io/tx/${tx}?cluster=devnet`);
}

main();
```

Run it:
```bash
npx ts-node scripts/initialize-vault.ts
```

## Setup Phantom Wallet for Devnet

### 1. Install Phantom
- Download from: https://phantom.app/
- Install the browser extension

### 2. Configure for Devnet
1. Open Phantom
2. Click Settings (gear icon)
3. Scroll to "Developer Settings"
4. Enable "Testnet Mode"
5. Select "Devnet" from the network dropdown

### 3. Import Your Keypair (Optional)
To use your CLI wallet in Phantom:
1. Get your private key:
```bash
solana-keygen pubkey ~/.config/solana/id.json --outfile /dev/stdout
cat ~/.config/solana/id.json
```
2. In Phantom: Settings → Add/Import Wallet → Import Private Key
3. Paste the base58 encoded private key

### 4. Get Test Funds in Phantom
- Your devnet SOL and USDC should show up
- If not, airdrop more SOL or get USDC from faucets

## Testing the App

### 1. Start the Dev Server
```bash
cd C:\Users\1arya\OneDrive\Desktop\polyield\polyield
pnpm run dev
```

### 2. Open in Browser
Go to: http://localhost:3001/markets

### 3. Connect Phantom
1. Click "Select Wallet"
2. Choose Phantom
3. Approve connection
4. Make sure you're on Devnet in Phantom

### 4. Make a Test Deposit
1. Click "Predict Yes" or "Predict No" on any market
2. Click "[Deposit to Yes/No]"
3. Enter amount (e.g., 1 USDC)
4. Click "Deposit X USDC"
5. Approve transaction in Phantom
6. Wait for confirmation

### 5. View on Solscan
After transaction confirms, click the "View on Solscan" link or go to:
```
https://solscan.io/account/YOUR_WALLET_ADDRESS?cluster=devnet
```

## Useful Commands

### Check Wallet Info
```bash
# Your address
solana address

# SOL balance
solana balance

# USDC balance
spl-token balance 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU

# All token accounts
spl-token accounts
```

### View Program Account
```bash
solana account <PROGRAM_ID>
```

### View Recent Transactions
```bash
solana transaction-history $(solana address) --limit 10
```

### Check Vault Balance
```bash
# Get vault PDA address from deployment logs
spl-token balance 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU --owner <VAULT_PDA>
```

## Troubleshooting

### "AccountNotFound" Error
- Make sure vault is initialized
- Check you have devnet USDC in your wallet
- Verify you're on devnet network

### "InsufficientFunds" Error
- Get more devnet SOL via airdrop
- Get devnet USDC from faucets

### Transaction Fails
- Check Solscan for detailed error logs
- Ensure program ID is correct in all files
- Verify vault was initialized

### Can't See USDC in Phantom
- Make sure Phantom is on Devnet mode
- Create USDC token account if needed
- Refresh the wallet

## Important Links

- **Devnet Solscan**: https://solscan.io/?cluster=devnet
- **Devnet Explorer**: https://explorer.solana.com/?cluster=devnet
- **SOL Faucet**: https://faucet.solana.com/
- **Circle USDC Faucet**: https://faucet.circle.com/
- **SPL Token Faucet**: https://spl-token-faucet.com/

## Next Steps

Once testing is complete on devnet:
1. Test all deposit/withdraw scenarios
2. Verify transactions on Solscan
3. Check vault balances
4. Test with multiple users
5. Document any issues
6. Prepare for mainnet deployment (if applicable)
