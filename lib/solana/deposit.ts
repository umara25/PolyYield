import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js"
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token"
import {
  USDC_MINT,
  USDC_DECIMALS,
  PROGRAM_ID,
  VAULT_SEED,
  VAULT_STATE_SEED,
  USER_DEPOSIT_SEED,
  Position,
} from "./constants"

/**
 * Get the vault PDA address
 */
export function getVaultPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(VAULT_SEED), USDC_MINT.toBuffer()],
    PROGRAM_ID
  )
}

/**
 * Get the vault state PDA address
 */
export function getVaultStatePDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(VAULT_STATE_SEED), USDC_MINT.toBuffer()],
    PROGRAM_ID
  )
}

/**
 * Get the user deposit PDA address
 */
export function getUserDepositPDA(
  user: PublicKey,
  marketId: string,
  position: Position
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(USER_DEPOSIT_SEED),
      user.toBuffer(),
      Buffer.from(marketId),
      Buffer.from([position]),
    ],
    PROGRAM_ID
  )
}

/**
 * Convert USDC amount to lamports (with 6 decimals)
 */
export function usdcToLamports(amount: number): bigint {
  return BigInt(Math.round(amount * Math.pow(10, USDC_DECIMALS)))
}

/**
 * Convert lamports to USDC display amount
 */
export function lamportsToUsdc(lamports: bigint): number {
  return Number(lamports) / Math.pow(10, USDC_DECIMALS)
}

/**
 * Build the deposit instruction discriminator
 * This is the first 8 bytes of SHA256("global:deposit")
 */
function getDepositDiscriminator(): Buffer {
  // Pre-computed discriminator for "deposit" instruction
  return Buffer.from([242, 35, 198, 137, 82, 225, 242, 182])
}

/**
 * Encode the position enum for the instruction
 */
function encodePosition(position: Position): Buffer {
  return Buffer.from([position])
}

/**
 * Encode a string with length prefix (Borsh format)
 */
function encodeString(str: string): Buffer {
  const strBuffer = Buffer.from(str, "utf-8")
  const lenBuffer = Buffer.alloc(4)
  lenBuffer.writeUInt32LE(strBuffer.length)
  return Buffer.concat([lenBuffer, strBuffer])
}

/**
 * Encode u64 in little-endian format
 */
function encodeU64(value: bigint): Buffer {
  const buffer = Buffer.alloc(8)
  buffer.writeBigUInt64LE(value)
  return buffer
}

/**
 * Build the deposit instruction data
 */
function buildDepositInstructionData(
  amount: bigint,
  marketId: string,
  position: Position
): Buffer {
  const discriminator = getDepositDiscriminator()
  const amountBuffer = encodeU64(amount)
  const marketIdBuffer = encodeString(marketId)
  const positionBuffer = encodePosition(position)

  return Buffer.concat([discriminator, amountBuffer, marketIdBuffer, positionBuffer])
}

export interface DepositParams {
  connection: Connection
  userPublicKey: PublicKey
  amount: number // in USDC (e.g., 10.5 for $10.50)
  marketId: string
  position: Position
}

export interface DepositResult {
  transaction: Transaction
  userTokenAccount: PublicKey
  vault: PublicKey
  needsTokenAccountCreation: boolean
}

/**
 * Build a deposit transaction
 * Returns the transaction ready to be signed and sent
 */
export async function buildDepositTransaction(
  params: DepositParams
): Promise<DepositResult> {
  const { connection, userPublicKey, amount, marketId, position } = params

  // Get PDAs
  const [vault] = getVaultPDA()
  const [vaultState] = getVaultStatePDA()
  const [userDeposit] = getUserDepositPDA(userPublicKey, marketId, position)

  // Get user's USDC token account
  const userTokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    userPublicKey
  )

  // Check if user's token account exists
  let needsTokenAccountCreation = false
  try {
    await getAccount(connection, userTokenAccount)
  } catch {
    needsTokenAccountCreation = true
  }

  // Convert amount to lamports
  const amountLamports = usdcToLamports(amount)

  // Build the transaction
  const transaction = new Transaction()

  // If user doesn't have a USDC token account, create one
  if (needsTokenAccountCreation) {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        userPublicKey, // payer
        userTokenAccount, // ata
        userPublicKey, // owner
        USDC_MINT // mint
      )
    )
  }

  // Build instruction data
  const data = buildDepositInstructionData(amountLamports, marketId, position)

  // Build the deposit instruction
  const depositInstruction = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: userPublicKey, isSigner: true, isWritable: true }, // user
      { pubkey: USDC_MINT, isSigner: false, isWritable: false }, // mint
      { pubkey: vaultState, isSigner: false, isWritable: true }, // vault_state
      { pubkey: vault, isSigner: false, isWritable: true }, // vault
      { pubkey: userTokenAccount, isSigner: false, isWritable: true }, // user_token_account
      { pubkey: userDeposit, isSigner: false, isWritable: true }, // user_deposit
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // token_program
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // associated_token_program
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
    ],
    data,
  })

  transaction.add(depositInstruction)

  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash
  transaction.feePayer = userPublicKey

  return {
    transaction,
    userTokenAccount,
    vault,
    needsTokenAccountCreation,
  }
}

/**
 * Get user's USDC balance
 */
export async function getUserUsdcBalance(
  connection: Connection,
  userPublicKey: PublicKey
): Promise<number> {
  try {
    const userTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      userPublicKey
    )
    const account = await getAccount(connection, userTokenAccount)
    return lamportsToUsdc(account.amount)
  } catch {
    // Account doesn't exist or has no balance
    return 0
  }
}

/**
 * Check if the vault is initialized
 */
export async function isVaultInitialized(connection: Connection): Promise<boolean> {
  const [vaultState] = getVaultStatePDA()
  const accountInfo = await connection.getAccountInfo(vaultState)
  return accountInfo !== null
}

/**
 * Get total deposits in the vault
 */
export async function getVaultTotalDeposits(connection: Connection): Promise<number> {
  const [vault] = getVaultPDA()
  try {
    const account = await getAccount(connection, vault)
    return lamportsToUsdc(account.amount)
  } catch {
    return 0
  }
}
