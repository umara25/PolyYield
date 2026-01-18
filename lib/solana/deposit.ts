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
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  getMint,
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
 * Get the correct token program for a mint
 */
export async function getTokenProgramForMint(
  connection: Connection,
  mint: PublicKey
): Promise<PublicKey> {
  try {
    // Try TOKEN_2022 first (devnet USDC often uses this)
    const mintInfo = await getMint(connection, mint, "confirmed", TOKEN_2022_PROGRAM_ID)
    if (mintInfo) {
      return TOKEN_2022_PROGRAM_ID
    }
  } catch {
    // Fall back to regular TOKEN_PROGRAM_ID
  }
  return TOKEN_PROGRAM_ID
}

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
function getDepositDiscriminator(): number[] {
  // Pre-computed discriminator for "deposit" instruction
  return [242, 35, 198, 137, 82, 225, 242, 182]
}

/**
 * Encode the position enum for the instruction
 */
function encodePosition(position: Position): number[] {
  return [position]
}

/**
 * Encode a string with length prefix (Borsh format)
 */
function encodeString(str: string): number[] {
  const strBytes = Array.from(Buffer.from(str, "utf-8"))
  const lenBytes = [
    str.length & 0xff,
    (str.length >> 8) & 0xff,
    (str.length >> 16) & 0xff,
    (str.length >> 24) & 0xff,
  ]
  return [...lenBytes, ...strBytes]
}

/**
 * Encode u64 in little-endian format
 */
function encodeU64(value: bigint): number[] {
  const bytes: number[] = []
  for (let i = 0; i < 8; i++) {
    bytes.push(Number(value & BigInt(0xff)))
    value = value >> BigInt(8)
  }
  return bytes
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

  return Buffer.from([...discriminator, ...amountBuffer, ...marketIdBuffer, ...positionBuffer])
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

  // Get the correct token program for this mint
  const tokenProgram = await getTokenProgramForMint(connection, USDC_MINT)

  // Get user's USDC token account (using the correct token program)
  const userTokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    userPublicKey,
    false,
    tokenProgram
  )

  // Check if user's token account exists
  let needsTokenAccountCreation = false
  try {
    await getAccount(connection, userTokenAccount, "confirmed", tokenProgram)
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
        USDC_MINT, // mint
        tokenProgram // token program
      )
    )
  }

  // Build the Anchor program deposit instruction
  const data = buildDepositInstructionData(amountLamports, marketId, position)

  // The vault is a PDA token account created by the initialize instruction
  // seeds: ["vault", mint] - this IS the token account, not an ATA
  const depositInstruction = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: userPublicKey, isSigner: true, isWritable: true },
      { pubkey: USDC_MINT, isSigner: false, isWritable: false },
      { pubkey: vaultState, isSigner: false, isWritable: true },
      { pubkey: vault, isSigner: false, isWritable: true },
      { pubkey: userTokenAccount, isSigner: false, isWritable: true },
      { pubkey: userDeposit, isSigner: false, isWritable: true },
      { pubkey: tokenProgram, isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
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
    // Get the correct token program for this mint
    const tokenProgram = await getTokenProgramForMint(connection, USDC_MINT)

    const userTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      userPublicKey,
      false,
      tokenProgram
    )
    const account = await getAccount(connection, userTokenAccount, "confirmed", tokenProgram)
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

/**
 * Build the initialize instruction discriminator
 * This is the first 8 bytes of SHA256("global:initialize")
 */
function getInitializeDiscriminator(): Buffer {
  // Pre-computed discriminator for "initialize" instruction from IDL
  return Buffer.from([175, 175, 109, 31, 13, 152, 155, 237])
}

/**
 * Build an initialize vault transaction
 * This creates the vault state and vault token account PDAs
 */
export async function buildInitializeTransaction(
  connection: Connection,
  adminPublicKey: PublicKey
): Promise<Transaction> {
  const [vault] = getVaultPDA()
  const [vaultState] = getVaultStatePDA()

  // Get the correct token program for this mint
  const tokenProgram = await getTokenProgramForMint(connection, USDC_MINT)

  const transaction = new Transaction()

  const data = getInitializeDiscriminator()

  const initializeInstruction = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: adminPublicKey, isSigner: true, isWritable: true },
      { pubkey: USDC_MINT, isSigner: false, isWritable: false },
      { pubkey: vaultState, isSigner: false, isWritable: true },
      { pubkey: vault, isSigner: false, isWritable: true },
      { pubkey: tokenProgram, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  })

  transaction.add(initializeInstruction)

  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash
  transaction.feePayer = adminPublicKey

  return transaction
}

/**
 * Get vault PDA address as string (for display)
 */
export function getVaultAddress(): string {
  const [vault] = getVaultPDA()
  return vault.toBase58()
}

/**
 * Get vault state PDA address as string (for display)
 */
export function getVaultStateAddress(): string {
  const [vaultState] = getVaultStatePDA()
  return vaultState.toBase58()
}
