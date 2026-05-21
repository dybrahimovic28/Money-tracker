import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Wallet } from 'lucide-react'
import { GlassCard } from './GlassCard'
import { Input } from './input'
import { Button } from './button'
import { useAuth } from '@/context/AuthContext'
import { useAccounts } from '@/context/AccountContext'
import { accountService } from '@/services/accountService'
import toast from 'react-hot-toast'
import { AccountType } from '@/types'

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (accountId: string) => void
}

const ACCOUNT_TYPES: AccountType[] = ['Cash', 'Bank', 'Mobile Money', 'Savings', 'Business', 'Custom']
const CURRENCIES = ['USD', 'EUR', 'GBP', 'ZMW']

export function AccountModal({ isOpen, onClose, onSuccess }: AccountModalProps) {
  const { user } = useAuth()
  const { refreshAccounts, setSelectedAccountId } = useAccounts()
  
  const [name, setName] = useState('')
  const [accountType, setAccountType] = useState<AccountType>('Cash')
  const [currencyCode, setCurrencyCode] = useState('USD')
  const [openingBalance, setOpeningBalance] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!name.trim()) {
      toast.error('Please enter an account name')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        user_id: user.id,
        name: name.trim(),
        account_type: accountType,
        currency_code: currencyCode,
        opening_balance: Number(openingBalance) || 0,
        color: null,
        icon: null,
        is_primary: false
      }
      
      const newAccount = await accountService.addAccount(payload)
      await refreshAccounts()
      
      setSelectedAccountId(newAccount.id)
      
      toast.success('Account successfully created')
      if (onSuccess) {
        onSuccess(newAccount.id)
      }
      setName('')
      setAccountType('Cash')
      setOpeningBalance('')
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md max-h-screen overflow-y-auto"
          >
            <GlassCard intensity="high" className="p-8 border border-white/10 shadow-2xl relative">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-foreground flex items-center">
                  <Wallet className="h-6 w-6 mr-2 text-primary" />
                  Create Account
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
                      {CURRENCIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">Opening Balance (Optional)</label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    className="bg-background/50 border-white/10 rounded-xl" 
                    placeholder="0.00" 
                  />
                </div>

                <div className="flex space-x-4 pt-4 mt-2">
                  <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl py-6 text-base font-bold bg-white/5 hover:bg-white/10 border-white/10">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl py-6 text-base font-bold">
                    {isSubmitting ? 'Creating...' : 'Create Account'}
                  </Button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
