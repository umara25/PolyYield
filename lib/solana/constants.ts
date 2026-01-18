import { PublicKey } from "@solana/web3.js"

// Devnet USDC Mint Address
export const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU")

// USDC has 6 decimals
export const USDC_DECIMALS = 6

// Program ID - Update this after deploying to devnet
// Run: anchor keys list to get your program ID
// Using System Program as placeholder until deployed
export const PROGRAM_ID = new PublicKey("11111111111111111111111111111111")

// Seed constants matching the Anchor program
export const VAULT_SEED = "vault"
export const VAULT_STATE_SEED = "vault_state"
export const USER_DEPOSIT_SEED = "user_deposit"

// Position enum values matching the Anchor program
export enum Position {
  Yes = 0,
  No = 1,
}
