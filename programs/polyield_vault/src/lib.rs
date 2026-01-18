use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{
        transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
    },
};

declare_id!("YourProgramIdHere11111111111111111111111111");

#[program]
pub mod polyield_vault {
    use super::*;

    /// Initialize the vault state and create the PDA-controlled token vault
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let vault_state = &mut ctx.accounts.vault_state;
        vault_state.admin = ctx.accounts.admin.key();
        vault_state.mint = ctx.accounts.mint.key();
        vault_state.vault_bump = ctx.bumps.vault;
        vault_state.state_bump = ctx.bumps.vault_state;
        vault_state.total_deposits = 0;
        
        msg!("Vault initialized for mint: {}", ctx.accounts.mint.key());
        Ok(())
    }

    /// Deposit USDC into a market position (YES or NO)
    pub fn deposit(
        ctx: Context<Deposit>,
        amount: u64,
        market_id: String,
        position: Position,
    ) -> Result<()> {
        require!(amount > 0, VaultError::InvalidAmount);
        require!(market_id.len() <= 64, VaultError::MarketIdTooLong);

        // Transfer USDC from user to vault
        let cpi_accounts = TransferChecked {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        transfer_checked(cpi_ctx, amount, ctx.accounts.mint.decimals)?;

        // Update user deposit record
        let user_deposit = &mut ctx.accounts.user_deposit;
        user_deposit.user = ctx.accounts.user.key();
        user_deposit.market_id = market_id.clone();
        user_deposit.position = position;
        user_deposit.amount = user_deposit.amount.checked_add(amount).ok_or(VaultError::Overflow)?;
        user_deposit.timestamp = Clock::get()?.unix_timestamp;
        user_deposit.bump = ctx.bumps.user_deposit;

        // Update vault state
        let vault_state = &mut ctx.accounts.vault_state;
        vault_state.total_deposits = vault_state
            .total_deposits
            .checked_add(amount)
            .ok_or(VaultError::Overflow)?;

        msg!(
            "Deposited {} USDC to {} position for market {}",
            amount,
            match position {
                Position::Yes => "YES",
                Position::No => "NO",
            },
            market_id
        );

        Ok(())
    }

    /// Withdraw USDC from a market position (for market resolution or cancellation)
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        let user_deposit = &mut ctx.accounts.user_deposit;
        
        require!(amount > 0, VaultError::InvalidAmount);
        require!(amount <= user_deposit.amount, VaultError::InsufficientFunds);

        // Create signer seeds for PDA
        let mint_key = ctx.accounts.mint.key();
        let seeds = &[
            b"vault",
            mint_key.as_ref(),
            &[ctx.accounts.vault_state.vault_bump],
        ];
        let signer_seeds = &[&seeds[..]];

        // Transfer USDC from vault to user
        let cpi_accounts = TransferChecked {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.vault.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        
        transfer_checked(cpi_ctx, amount, ctx.accounts.mint.decimals)?;

        // Update user deposit record
        user_deposit.amount = user_deposit.amount.checked_sub(amount).ok_or(VaultError::Underflow)?;

        // Update vault state
        let vault_state = &mut ctx.accounts.vault_state;
        vault_state.total_deposits = vault_state
            .total_deposits
            .checked_sub(amount)
            .ok_or(VaultError::Underflow)?;

        msg!("Withdrew {} USDC", amount);

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        init,
        payer = admin,
        space = 8 + VaultState::INIT_SPACE,
        seeds = [b"vault_state", mint.key().as_ref()],
        bump,
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(
        init,
        payer = admin,
        seeds = [b"vault", mint.key().as_ref()],
        bump,
        token::mint = mint,
        token::authority = vault,
        token::token_program = token_program,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(amount: u64, market_id: String, position: Position)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        seeds = [b"vault_state", mint.key().as_ref()],
        bump = vault_state.state_bump,
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(
        mut,
        seeds = [b"vault", mint.key().as_ref()],
        bump = vault_state.vault_bump,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = user,
        associated_token::token_program = token_program,
    )]
    pub user_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserDeposit::INIT_SPACE,
        seeds = [b"user_deposit", user.key().as_ref(), market_id.as_bytes(), &[position as u8]],
        bump,
    )]
    pub user_deposit: Account<'info, UserDeposit>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        seeds = [b"vault_state", mint.key().as_ref()],
        bump = vault_state.state_bump,
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(
        mut,
        seeds = [b"vault", mint.key().as_ref()],
        bump = vault_state.vault_bump,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = user,
        associated_token::token_program = token_program,
    )]
    pub user_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"user_deposit", user.key().as_ref(), user_deposit.market_id.as_bytes(), &[user_deposit.position as u8]],
        bump = user_deposit.bump,
        constraint = user_deposit.user == user.key() @ VaultError::Unauthorized,
    )]
    pub user_deposit: Account<'info, UserDeposit>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct VaultState {
    pub admin: Pubkey,
    pub mint: Pubkey,
    pub vault_bump: u8,
    pub state_bump: u8,
    pub total_deposits: u64,
}

#[account]
#[derive(InitSpace)]
pub struct UserDeposit {
    pub user: Pubkey,
    #[max_len(64)]
    pub market_id: String,
    pub position: Position,
    pub amount: u64,
    pub timestamp: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum Position {
    Yes = 0,
    No = 1,
}

#[error_code]
pub enum VaultError {
    #[msg("Invalid deposit amount")]
    InvalidAmount,
    #[msg("Market ID too long (max 64 chars)")]
    MarketIdTooLong,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Arithmetic underflow")]
    Underflow,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Unauthorized")]
    Unauthorized,
}
