export type Role = 'user' | 'admin'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  preferred_currency: string
  role: Role
  created_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  icon: string | null
  created_at: string
}

export interface Budget {
  id: string
  user_id: string
  account_id?: string
  category: string
  amount_limit: number
  month: number
  year: number
  created_at: string
}

export interface Currency {
  code: string
  name: string
  symbol: string | null
  country: string | null
  exchange_rate: number
  updated_at: string
}

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  user_id: string
  account_id?: string
  type: TransactionType
  amount: number
  category: string
  description: string | null
  currency: string
  notes: string | null
  created_at: string
}

export interface SavingsGoal {
  id: string
  user_id: string
  account_id?: string
  name: string
  target_amount: number
  current_amount: number
  deadline: string
  created_at: string
}

export type AccountType = 'Cash' | 'Bank' | 'Mobile Money' | 'Savings' | 'Business' | 'Custom'

export interface Account {
  id: string
  user_id: string
  name: string
  account_type: AccountType
  currency_code: string
  opening_balance: number
  current_balance: number
  color: string | null
  icon: string | null
  is_primary: boolean
  created_at: string
}

export type DebtType = 'owe' | 'owed_to_me'
export type DebtStatus = 'Pending' | 'Paid' | 'Received' | 'Overdue'

export interface Debt {
  id: string
  user_id: string
  account_id?: string
  type: DebtType
  person_name: string
  amount: number
  currency: string
  reason: string | null
  due_date: string | null
  status: DebtStatus
  auto_transaction: boolean
  created_at: string
}
