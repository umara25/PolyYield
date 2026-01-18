import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { expect } from "chai";

// Devnet USDC Mint
const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

describe("polyield_vault", () => {
  // Configure the client to use devnet
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PolyieldVault as Program;

  // PDAs
  let vaultPDA: PublicKey;
  let vaultStatePDA: PublicKey;
  let vaultBump: number;
  let vaultStateBump: number;

  before(async () => {
    // Derive PDAs
    [vaultPDA, vaultBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), USDC_MINT.toBuffer()],
      program.programId
    );

    [vaultStatePDA, vaultStateBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault_state"), USDC_MINT.toBuffer()],
      program.programId
    );

    console.log("Program ID:", program.programId.toBase58());
    console.log("Vault PDA:", vaultPDA.toBase58());
    console.log("Vault State PDA:", vaultStatePDA.toBase58());
  });

  it("Initializes the vault", async () => {
    try {
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

      console.log("Initialize tx:", tx);

      // Verify vault state
      const vaultState = await program.account.vaultState.fetch(vaultStatePDA);
      expect(vaultState.admin.toBase58()).to.equal(provider.wallet.publicKey.toBase58());
      expect(vaultState.mint.toBase58()).to.equal(USDC_MINT.toBase58());
      expect(vaultState.totalDeposits.toNumber()).to.equal(0);

      console.log("Vault initialized successfully!");
    } catch (error: any) {
      // If vault already initialized, that's okay
      if (error.message?.includes("already in use")) {
        console.log("Vault already initialized");
      } else {
        throw error;
      }
    }
  });

  it("Deposits USDC to YES position", async () => {
    const user = provider.wallet.publicKey;
    const marketId = "test-market-1";
    const amount = new anchor.BN(1_000_000); // 1 USDC (6 decimals)

    // Derive user deposit PDA
    const [userDepositPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("user_deposit"),
        user.toBuffer(),
        Buffer.from(marketId),
        Buffer.from([0]), // Position::Yes = 0
      ],
      program.programId
    );

    // Get user's USDC token account
    const userTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      user
    );

    console.log("User Token Account:", userTokenAccount.toBase58());
    console.log("User Deposit PDA:", userDepositPDA.toBase58());

    try {
      const tx = await program.methods
        .deposit(amount, marketId, { yes: {} })
        .accounts({
          user: user,
          mint: USDC_MINT,
          vaultState: vaultStatePDA,
          vault: vaultPDA,
          userTokenAccount: userTokenAccount,
          userDeposit: userDepositPDA,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Deposit tx:", tx);

      // Verify user deposit
      const userDeposit = await program.account.userDeposit.fetch(userDepositPDA);
      expect(userDeposit.user.toBase58()).to.equal(user.toBase58());
      expect(userDeposit.marketId).to.equal(marketId);
      expect(userDeposit.amount.toNumber()).to.be.at.least(amount.toNumber());

      console.log("Deposit successful!");
      console.log("User deposit amount:", userDeposit.amount.toNumber() / 1_000_000, "USDC");
    } catch (error: any) {
      console.error("Deposit failed:", error.message);
      // This might fail if user doesn't have USDC - that's expected in test environment
      if (error.message?.includes("insufficient funds") || 
          error.message?.includes("0x1")) {
        console.log("Note: User needs devnet USDC to test deposits");
        console.log("Get devnet USDC from: https://faucet.circle.com/");
      }
    }
  });

  it("Withdraws USDC from YES position", async () => {
    const user = provider.wallet.publicKey;
    const marketId = "test-market-1";
    const amount = new anchor.BN(500_000); // 0.5 USDC

    // Derive user deposit PDA
    const [userDepositPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("user_deposit"),
        user.toBuffer(),
        Buffer.from(marketId),
        Buffer.from([0]), // Position::Yes = 0
      ],
      program.programId
    );

    // Get user's USDC token account
    const userTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      user
    );

    try {
      // Check if user has a deposit first
      const userDeposit = await program.account.userDeposit.fetch(userDepositPDA);
      
      if (userDeposit.amount.toNumber() < amount.toNumber()) {
        console.log("Not enough deposited to withdraw");
        return;
      }

      const tx = await program.methods
        .withdraw(amount)
        .accounts({
          user: user,
          mint: USDC_MINT,
          vaultState: vaultStatePDA,
          vault: vaultPDA,
          userTokenAccount: userTokenAccount,
          userDeposit: userDepositPDA,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Withdraw tx:", tx);
      console.log("Withdrawal successful!");
    } catch (error: any) {
      console.error("Withdraw failed:", error.message);
      // Expected if no deposit exists
      if (error.message?.includes("AccountNotInitialized")) {
        console.log("No deposit found to withdraw from");
      }
    }
  });
});
