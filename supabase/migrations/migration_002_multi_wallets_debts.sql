-- Migration: 002_multi_wallets_debts.sql
-- Description: Creates accounts and debts tables for multi-wallet platform and debt/credit management.

-- Create Accounts table
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  currency_code TEXT NOT NULL DEFAULT 'USD',
  account_type TEXT NOT NULL DEFAULT 'Cash',
  opening_balance NUMERIC NOT NULL DEFAULT 0,
  current_balance NUMERIC NOT NULL DEFAULT 0,
  color TEXT,
  icon TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for Accounts
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);

-- Enable RLS for Accounts
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own accounts" 
  ON public.accounts FOR ALL 
  USING (auth.uid() = user_id);

-- Add account_id to existing tables
ALTER TABLE public.transactions 
  ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id) ON DELETE RESTRICT;

ALTER TABLE public.budgets 
  ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id) ON DELETE RESTRICT;

ALTER TABLE public.savings_goals 
  ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id) ON DELETE RESTRICT;

-- Create Debts table
CREATE TABLE IF NOT EXISTS public.debts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('owe', 'owed_to_me')),
  person_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  reason TEXT,
  due_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'Pending',
  account_id UUID REFERENCES public.accounts(id) ON DELETE RESTRICT,
  auto_transaction BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for Debts
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON public.debts(user_id);

-- Enable RLS for Debts
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own debts" 
  ON public.debts FOR ALL 
  USING (auth.uid() = user_id);
