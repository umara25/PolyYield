# Solana Devnet Wallet Setup Script
# This script creates a new Solana wallet on devnet and funds it with USDC

Write-Host "=== Solana Devnet Wallet Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if Solana CLI is installed
Write-Host "Checking for Solana CLI..." -ForegroundColor Yellow
try {
    $solanaVersion = solana --version 2>&1
    Write-Host "✓ Solana CLI found: $solanaVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Solana CLI not found!" -ForegroundColor Red
    Write-Host "Please install Solana CLI from: https://docs.solana.com/cli/install-solana-cli-tools" -ForegroundColor Yellow
    exit 1
}

# Set cluster to devnet
Write-Host ""
Write-Host "Setting cluster to devnet..." -ForegroundColor Yellow
solana config set --url devnet
Write-Host "✓ Cluster set to devnet" -ForegroundColor Green

# Generate new keypair
Write-Host ""
Write-Host "Generating new keypair..." -ForegroundColor Yellow
$keypairPath = "$env:USERPROFILE\.config\solana\devnet-wallet.json"

# Create directory if it doesn't exist
$configDir = Split-Path -Parent $keypairPath
if (!(Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}

# Generate keypair (force overwrite if exists)
solana-keygen new --outfile $keypairPath --force --no-bip39-passphrase

Write-Host "✓ Keypair generated at: $keypairPath" -ForegroundColor Green

# Set as default keypair
solana config set --keypair $keypairPath

# Get wallet address
$walletAddress = solana address

# Extract private key for Phantom import
Write-Host ""
Write-Host "Extracting private key for Phantom wallet..." -ForegroundColor Yellow
$privateKeyBytes = Get-Content $keypairPath | ConvertFrom-Json
$privateKeyArray = $privateKeyBytes -join ','

Write-Host ""
Write-Host "=== Your Wallet Details ===" -ForegroundColor Cyan
Write-Host "Address: $walletAddress" -ForegroundColor White
Write-Host "Keypair Path: $keypairPath" -ForegroundColor White
Write-Host ""
Write-Host "=== Private Key (for Phantom import) ===" -ForegroundColor Yellow
Write-Host "⚠ KEEP THIS SECRET! Never share with anyone!" -ForegroundColor Red
Write-Host ""
Write-Host "Private Key (byte array format):" -ForegroundColor White
Write-Host "[$privateKeyArray]" -ForegroundColor Cyan
Write-Host ""

# Airdrop SOL for transaction fees
Write-Host ""
Write-Host "Requesting SOL airdrop for transaction fees..." -ForegroundColor Yellow
try {
    solana airdrop 2
    Start-Sleep -Seconds 3
    $solBalance = solana balance
    Write-Host "✓ SOL Balance: $solBalance" -ForegroundColor Green
} catch {
    Write-Host "⚠ Airdrop failed (rate limit or network issue)" -ForegroundColor Yellow
    Write-Host "You can try again later or use the web faucet: https://faucet.solana.com" -ForegroundColor Yellow
}

# Instructions for Phantom Wallet Import
Write-Host ""
Write-Host "=== Import to Phantom Wallet ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open Phantom wallet extension" -ForegroundColor White
Write-Host "2. Click the menu (☰) → 'Add / Connect Wallet'" -ForegroundColor White
Write-Host "3. Select 'Import Private Key'" -ForegroundColor White
Write-Host "4. Paste the private key array shown above" -ForegroundColor White
Write-Host "5. Make sure Phantom is set to 'Devnet' (Settings → Developer Settings → Testnet Mode)" -ForegroundColor White
Write-Host ""

# Instructions for Circle USDC Faucet
Write-Host "=== Get USDC from Circle Faucet ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open Circle Faucet: https://faucet.circle.com/" -ForegroundColor White
Write-Host "2. Select 'Solana Devnet' from the network dropdown" -ForegroundColor White
Write-Host "3. Select 'USDC' as the token" -ForegroundColor White
Write-Host "4. Paste your wallet address: $walletAddress" -ForegroundColor Yellow
Write-Host "5. Click 'Get Tokens'" -ForegroundColor White
Write-Host ""

# Copy address to clipboard
Write-Host "Copying wallet address to clipboard..." -ForegroundColor Yellow
Set-Clipboard -Value $walletAddress
Write-Host "✓ Address copied to clipboard!" -ForegroundColor Green

# Open Circle faucet in browser
Write-Host ""
$openBrowser = Read-Host "Open Circle Faucet in browser? (y/n)"
if ($openBrowser -eq 'y' -or $openBrowser -eq 'Y') {
    Start-Process "https://faucet.circle.com/"
    Write-Host "✓ Browser opened" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Your wallet is ready. After getting USDC from the faucet, you can check your balance with:" -ForegroundColor White
Write-Host "  solana balance" -ForegroundColor Cyan
Write-Host ""
Write-Host "To use this wallet in your app, set the keypair path:" -ForegroundColor White
Write-Host "  solana config set --keypair $keypairPath" -ForegroundColor Cyan
Write-Host ""
