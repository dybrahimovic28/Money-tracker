import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Wallet } from 'lucide-react'
import { Input } from './input'
import { Button } from './button'
import { useAuth } from '@/context/AuthContext'
import { useAccounts } from '@/context/AccountContext'
import { accountService } from '@/services/accountService'
import toast from 'react-hot-toast'
import { AccountType, Account } from '@/types'
import { useCustomCurrencies } from '@/hooks/useCustomCurrencies'

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (accountId: string) => void
  accountToEdit?: Account
}

const ACCOUNT_TYPES: AccountType[] = ['Cash', 'Bank', 'Mobile Money', 'Savings', 'Business', 'Custom']

export function AccountModal({ isOpen, onClose, onSuccess, accountToEdit }: AccountModalProps) {
  const { user } = useAuth()
  const { refreshAccounts, setSelectedAccountId } = useAccounts()
  const { allCurrencies } = useCustomCurrencies()
  
  const [name, setName] = useState(accountToEdit?.name || '')
  const [accountType, setAccountType] = useState<AccountType>(accountToEdit?.account_type || 'Cash')
  const [currencyCode, setCurrencyCode] = useState(accountToEdit?.currency_code || 'USD')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset state when modal opens or accountToEdit changes
  useEffect(() => {
    if (isOpen) {
      setName(accountToEdit?.name || '')
      setAccountType(accountToEdit?.account_type || 'Cash')
      setCurrencyCode(accountToEdit?.currency_code || 'USD')
    }
  }, [isOpen, accountToEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!name.trim()) {
      toast.error('Please enter an account name')
      return
    }

    setIsSubmitting(true)
    try {
      if (accountToEdit) {
        await accountService.updateAccount(accountToEdit.id, user.id, {
          name: name.trim(),
          account_type: accountType,
          currency_code: currencyCode,
        })
        toast.success('Account successfully updated')
        if (onSuccess) onSuccess(accountToEdit.id)
      } else {
        const payload = {
          user_id: user.id,
          name: name.trim(),
          account_type: accountType,
          currency_code: currencyCode,
          opening_balance: 0,
          color: null,
          icon: null,
          is_primary: false
        }
        
        const newAccount = await accountService.addAccount(payload)
        setSelectedAccountId(newAccount.id)
        toast.success('Account successfully created')
        if (onSuccess) onSuccess(newAccount.id)
      }
      
      await refreshAccounts()
      
      setName('')
      setAccountType('Cash')
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-[600px] max-h-screen overflow-y-auto"
          >
            <div className="bg-[#071225] rounded-3xl p-8 border border-white/10 shadow-2xl relative">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-foreground flex items-center">
                  <Wallet className="h-6 w-6 mr-2 text-primary" />
                  {accountToEdit ? 'Edit Account' : 'Create Account'}
                </h2>
                <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">Account Name</label>
                  <Input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background/50 border-white/10 rounded-xl" 
                    placeholder="e.g. Main Wallet, Chase Bank" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground">Type</label>
                    <select 
                      value={accountType}
                      onChange={(e) => setAccountType(e.target.value as AccountType)}
                      className="w-full p-3 rounded-xl bg-background/50 border border-white/10 text-foreground focus:ring-1 focus:ring-primary outline-none [&>option]:bg-white [&>option]:text-black"
                    >
                      {ACCOUNT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground">Currency</label>
                    <select 
                      value={currencyCode}
                      onChange={(e) => setCurrencyCode(e.target.value)}
                      className="w-full p-3 rounded-xl bg-background/50 border border-white/10 text-foreground focus:ring-1 focus:ring-primary outline-none [&>option]:bg-white [&>option]:text-black"
                    >
                      {allCurrencies.map(c => (
                        <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex space-x-4 pt-6 mt-4 justify-center">
                  <Button type="button" variant="outline" onClick={onClose} className="w-1/2 rounded-xl py-6 text-base font-bold bg-white/5 hover:bg-white/10 border-white/10">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="w-1/2 rounded-xl py-6 text-base font-bold">
                    {isSubmitting ? (accountToEdit ? 'Saving...' : 'Creating...') : (accountToEdit ? 'Save Changes' : 'Create Account')}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
