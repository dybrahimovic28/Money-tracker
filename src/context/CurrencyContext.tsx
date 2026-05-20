import React, { createContext, useContext, useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from './AuthContext'
import { useAccounts } from './AccountContext'
import { supabase } from '@/lib/supabase'

interface CurrencyContextType {
  currency: string
  setCurrency: (code: string) => void
  formatAmount: (amount: number, accountId?: string | null) => string
  formatCurrencyByAccount: (accountId?: string | null) => string
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'USD',
  setCurrency: () => {},
  formatAmount: (amount) => formatCurrency(amount, 'USD'),
  formatCurrencyByAccount: () => 'USD',
})

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { accounts, selectedAccountId } = useAccounts()
  const [currency, setCurrencyState] = useState('USD')

  useEffect(() => {
    async function loadPreferredCurrency() {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('preferred_currency')
          .eq('id', user.id)
          .single()
        
        if (data && !error && data.preferred_currency) {
          setCurrencyState(data.preferred_currency)
        }
      }
    }
    loadPreferredCurrency()
  }, [user])

  const setCurrency = async (code: string) => {
    setCurrencyState(code)
    if (user) {
      await supabase
        .from('profiles')
        .update({ preferred_currency: code })
        .eq('id', user.id)
    }
  }

  const formatCurrencyByAccount = (accountId: string | null = null) => {
    if (accountId && accountId !== 'all') {
      const activeAccount = accounts.find(a => a.id === accountId)
      if (activeAccount) return activeAccount.currency_code
    }
    if (selectedAccountId !== 'all') {
      const activeAccount = accounts.find(a => a.id === selectedAccountId)
      if (activeAccount) return activeAccount.currency_code
    }
    return currency
  }

  const formatAmount = (amount: number, accountId: string | null = null) => {
    return formatCurrency(amount, formatCurrencyByAccount(accountId))
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount, formatCurrencyByAccount }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => {
  return useContext(CurrencyContext)
}
