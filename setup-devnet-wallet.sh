#!/bin/bash
# Solana Devnet Wallet Setup Script
# This script creates a new Solana wallet on devnet and funds it with USDC

echo "=== Solana Devnet Wallet Setup ==="
echo ""

# Check if Solana CLI is installed
echo "Checking for Solana CLI..."
if ! command -v solana &> /dev/null; then
    echo "✗ Solana CLI not found!"
    echo "Please install Solana CLI from: https://docs.solana.com/cli/install-solana-cli-tools"
    exit 1
fi

SOLANA_VERSION=$(solana --version)
echo "✓ Solana CLI found: $SOLANA_VERSION"

# Set cluster to devnet
echo ""
echo "Setting cluster to devnet..."
solana config set --url devnet
echo "✓ Cluster set to devnet"

# Generate new keypair
echo ""
echo "Generating new keypair..."
KEYPAIR_PATH="$HOME/.config/solana/devnet-wallet.json"

# Create directory if it doesn't exist
mkdir -p "$(dirname "$KEYPAIR_PATH")"

# Generate keypair (force overwrite if exists)
solana-keygen new --outfile "$KEYPAIR_PATH" --force --no-bip39-passphrase

echo "✓ Keypair generated at: $KEYPAIR_PATH"

# Set as default keypair
solana config set --keypair "$KEYPAIR_PATH"

# Get wallet address
WALLET_ADDRESS=$(solana address)

# Extract private key for Phantom import
echo ""
echo "Extracting private key for Phantom wallet..."
PRIVATE_KEY=$(cat "$KEYPAIR_PATH" | tr -d '[]' | tr -d ' ' | tr -d '\n')

echo ""
echo "=== Your Wallet Details ==="
echo "Address: $WALLET_ADDRESS"
echo "Keypair Path: $KEYPAIR_PATH"
echo ""
echo "=== Private Key (for Phantom import) ==="
echo "⚠ KEEP THIS SECRET! Never share with anyone!"
echo ""
echo "Private Key (byte array format):"
echo "[$PRIVATE_KEY]"
echo ""

# Airdrop SOL for transaction fees
echo ""
echo "Requesting SOL airdrop for transaction fees..."
if solana airdrop 2; then
    sleep 3
    SOL_BALANCE=$(solana balance)
    echo "✓ SOL Balance: $SOL_BALANCE"
else
    echo "⚠ Airdrop failed (rate limit or network issue)"
    echo "You can try again later or use the web faucet: https://faucet.solana.com"
fi

# Instructions for Phantom Wallet Import
echo ""
echo "=== Import to Phantom Wallet ==="
echo ""
echo "1. Open Phantom wallet extension"
echo "2. Click the menu (☰) → 'Add / Connect Wallet'"
echo "3. Select 'Import Private Key'"
echo "4. Paste the private key array shown above"
echo "5. Make sure Phantom is set to 'Devnet' (Settings → Developer Settings → Testnet Mode)"
echo ""

# Instructions for Circle USDC Faucet
echo "=== Get USDC from Circle Faucet ==="
echo ""
echo "1. Open Circle Faucet: https://faucet.circle.com/"
echo "2. Select 'Solana Devnet' from the network dropdown"
echo "3. Select 'USDC' as the token"
echo "4. Paste your wallet address: $WALLET_ADDRESS"
echo "5. Click 'Get Tokens'"
echo ""

# Copy address to clipboard (if available)
if command -v pbcopy &> /dev/null; then
    echo "$WALLET_ADDRESS" | pbcopy
    echo "✓ Address copied to clipboard (macOS)!"
elif command -v xclip &> /dev/null; then
    echo "$WALLET_ADDRESS" | xclip -selection clipboard
    echo "✓ Address copied to clipboard (Linux)!"
elif command -v clip.exe &> /dev/null; then
    echo "$WALLET_ADDRESS" | clip.exe
    echo "✓ Address copied to clipboard (WSL)!"
fi

# Open Circle faucet in browser
echo ""
read -p "Open Circle Faucet in browser? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open "https://faucet.circle.com/"
    elif command -v open &> /dev/null; then
        open "https://faucet.circle.com/"
    elif command -v start &> /dev/null; then
        start "https://faucet.circle.com/"
    fi
    echo "✓ Browser opened"
fi

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Your wallet is ready. After getting USDC from the faucet, you can check your balance with:"
echo "  solana balance"
echo ""
echo "To use this wallet in your app, set the keypair path:"
echo "  solana config set --keypair $KEYPAIR_PATH"
echo ""
