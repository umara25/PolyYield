import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

async function main() {
  // Configure the client to use devnet
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PolyieldVault as Program;

  console.log("Program ID:", program.programId.toBase58());
  console.log("Admin:", provider.wallet.publicKey.toBase58());

  // Derive PDAs
  const [vaultPDA, vaultBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), USDC_MINT.toBuffer()],
    program.programId
  );

  const [vaultStatePDA, vaultStateBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault_state"), USDC_MINT.toBuffer()],
    program.programId
  );

  console.log("\n📍 PDAs:");
  console.log("Vault PDA:", vaultPDA.toBase58());
  console.log("Vault State PDA:", vaultStatePDA.toBase58());
  console.log("Vault Bump:", vaultBump);
  console.log("Vault State Bump:", vaultStateBump);

  console.log("\n🔨 Initializing vault...");

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

    console.log("\n✅ Vault initialized successfully!");
    console.log("Transaction signature:", tx);
    console.log("\n🔍 View on Solscan:");
    console.log(`https://solscan.io/tx/${tx}?cluster=devnet`);
    console.log("\n📦 Vault Account:");
    console.log(`https://solscan.io/account/${vaultPDA.toBase58()}?cluster=devnet`);

    // Fetch and display vault state
    const vaultState = await program.account.vaultState.fetch(vaultStatePDA);
    console.log("\n📊 Vault State:");
    console.log("Admin:", vaultState.admin.toBase58());
    console.log("Mint:", vaultState.mint.toBase58());
    console.log("Total Deposits:", vaultState.totalDeposits.toString(), "USDC lamports");
    console.log("Vault Bump:", vaultState.vaultBump);
    console.log("State Bump:", vaultState.stateBump);
  } catch (error: any) {
    if (error.message?.includes("already in use")) {
      console.log("\n⚠️  Vault already initialized!");
      console.log("Fetching existing vault state...");

      const vaultState = await program.account.vaultState.fetch(vaultStatePDA);
      console.log("\n📊 Existing Vault State:");
      console.log("Admin:", vaultState.admin.toBase58());
      console.log("Mint:", vaultState.mint.toBase58());
      console.log("Total Deposits:", vaultState.totalDeposits.toString(), "USDC lamports");
      console.log("\n📦 Vault Account:");
      console.log(`https://solscan.io/account/${vaultPDA.toBase58()}?cluster=devnet`);
    } else {
      console.error("\n❌ Error initializing vault:");
      console.error(error);
      throw error;
    }
  }
}

console.log("🚀 Starting vault initialization...\n");
main()
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
