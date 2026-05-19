-- Migration: Multi-Wallets and Debts Management

-- 1. Create accounts table
CREATE TABLE IF NOT EXISTS public.accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  currency_code text NOT NULL,
  opening_balance numeric NOT NULL DEFAULT 0,
  current_balance numeric NOT NULL DEFAULT 0,
  color text,
  icon text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own accounts" 
  ON public.accounts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts" 
  ON public.accounts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts" 
  ON public.accounts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts" 
  ON public.accounts FOR DELETE 
  USING (auth.uid() = user_id);

-- 2. Add account_id to transactions
ALTER TABLE public.transactions 
  ADD COLUMN IF NOT EXISTS account_id uuid REFERENCES public.accounts(id) ON DELETE CASCADE;

-- 3. Add account_id to budgets
ALTER TABLE public.budgets 
  ADD COLUMN IF NOT EXISTS account_id uuid REFERENCES public.accounts(id) ON DELETE CASCADE;

-- 4. Add account_id to savings_goals
ALTER TABLE public.savings_goals 
  ADD COLUMN IF NOT EXISTS account_id uuid REFERENCES public.accounts(id) ON DELETE CASCADE;

-- 5. Create debts table
CREATE TABLE IF NOT EXISTS public.debts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('owe', 'owed_to_me')),
  person_name text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL,
  reason text,
  due_date date,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Received', 'Overdue')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS for debts
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own debts" 
  ON public.debts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debts" 
  ON public.debts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts" 
  ON public.debts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts" 
  ON public.debts FOR DELETE 
  USING (auth.uid() = user_id);
