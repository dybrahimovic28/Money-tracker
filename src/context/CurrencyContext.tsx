import React, { createContext, useContext, useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from './AuthContext'
import { supabase } from '@/lib/supabase'

interface CurrencyContextType {
  currency: string
  setCurrency: (code: string) => void
  formatAmount: (amount: number) => string
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'USD',
  setCurrency: () => {},
  formatAmount: (amount) => formatCurrency(amount, 'USD'),
})

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
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

  const formatAmount = (amount: number) => {
    return formatCurrency(amount, currency)
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => {
  return useContext(CurrencyContext)
}
