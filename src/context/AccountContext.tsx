import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Account } from '@/types'
import { accountService } from '@/services/accountService'
import { useAuth } from './AuthContext'

interface AccountContextType {
  accounts: Account[]
  selectedAccountId: string
  setSelectedAccountId: (id: string) => void
  isLoading: boolean
  refreshAccounts: () => Promise<void>
}

const AccountContext = createContext<AccountContextType | undefined>(undefined)

export function AccountProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  const refreshAccounts = async () => {
    if (!user) {
      setAccounts([])
      setIsLoading(false)
      return
    }
    
    setIsLoading(true)
    try {
      const data = await accountService.getAccounts(user.id)
      setAccounts(data)
      
      if (data.length > 0) {
        if (!selectedAccountId || !data.find(a => a.id === selectedAccountId)) {
          setSelectedAccountId(data[0].id)
        }
      } else {
        setSelectedAccountId('')
      }
    } catch (error) {
      console.error('Failed to load accounts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshAccounts()
  }, [user])

  useEffect(() => {
    console.log("Accounts:", accounts)
    console.log("Selected Account:", selectedAccountId)
    console.log("Loading:", isLoading)
  }, [accounts, selectedAccountId, isLoading])

  // Optional: persist selectedAccountId to localStorage so it remembers user preference
  useEffect(() => {
    if (selectedAccountId) {
      localStorage.setItem('selectedAccountId', selectedAccountId)
    }
  }, [selectedAccountId])

  useEffect(() => {
    const saved = localStorage.getItem('selectedAccountId')
    if (saved) {
      setSelectedAccountId(saved)
    }
  }, [])

  return (
    <AccountContext.Provider 
      value={{ 
        accounts, 
        selectedAccountId, 
        setSelectedAccountId, 
        isLoading, 
        refreshAccounts 
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}

export function useAccounts() {
  const context = useContext(AccountContext)
  if (context === undefined) {
    throw new Error('useAccounts must be used within an AccountProvider')
  }
  return context
}
