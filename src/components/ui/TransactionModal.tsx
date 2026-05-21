import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, FileText, AlertCircle, ChevronDown, Wallet } from 'lucide-react'
import { GlassCard } from './GlassCard'
import { Input } from './input'
import { Button } from './button'
import { useTransactions } from '@/hooks/useTransactions'
import { useAuth } from '@/context/AuthContext'
import { useAccounts } from '@/context/AccountContext'
import { Transaction } from '@/types'
import toast from 'react-hot-toast'
import { transactionService } from '@/services/transactionService'
import { dashboardService } from '@/services/dashboardService'
import { AccountModal } from './AccountModal'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transactionToEdit?: Transaction | null
  defaultType?: 'income' | 'expense'
}

const INCOME_CATEGORIES = ['Salary', 'Business', 'Freelance', 'Investments', 'Gifts', 'Other']
const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'Rent', 'Health', 'Education', 'Entertainment', 'Utilities', 'Other']

export function TransactionModal({ isOpen, onClose, transactionToEdit, defaultType }: TransactionModalProps) {
  const { user } = useAuth()
  const { addTransaction, updateTransaction, isAdding } = useTransactions()
  const { accounts, selectedAccountId } = useAccounts()

  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [createdAt, setCreatedAt] = useState('')
  const [accountId, setAccountId] = useState('')

  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false)
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const accountDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
        setIsAccountDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen) {
      if (transactionToEdit) {
        setType(transactionToEdit.type)
        setAmount(String(transactionToEdit.amount))
        setCategory(transactionToEdit.category)
        setDescription(transactionToEdit.description || '')
        setNotes(transactionToEdit.notes || '')
        setAccountId(transactionToEdit.account_id || selectedAccountId === 'all' ? '' : selectedAccountId)
        
        // Format ISO date to yyyy-MM-ddThh:mm for datetime-local input
        const date = new Date(transactionToEdit.created_at)
        const tzOffset = date.getTimezoneOffset() * 60000
        const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16)
        setCreatedAt(localISOTime)
      } else {
        setType(defaultType || 'expense')
        setAmount('')
        setCategory('')
        setDescription('')
        setNotes('')
        setAccountId(selectedAccountId === 'all' ? '' : selectedAccountId)
        
        // Default to current local time in yyyy-MM-ddThh:mm format
        const now = new Date()
        const tzOffset = now.getTimezoneOffset() * 60000
        const localISOTime = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16)
        setCreatedAt(localISOTime)
      }
    }
  }, [transactionToEdit, isOpen, defaultType, selectedAccountId])

  // Reset category if type changes to prevent invalid categories
  useEffect(() => {
    if (isOpen && !transactionToEdit) {
      setCategory('')
    }
  }, [type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!accountId) {
      toast.error('Please select an account before creating records.')
      return
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid positive amount')
      return
    }
    if (!category) {
      toast.error('Please select a category')
      return
    }

    const account = accounts.find(a => a.id === accountId)
    const currency = account ? account.currency_code : 'USD'

    if (type === 'expense' && account) {
      const expenseAmount = Number(amount)
      let currentBalance = 0
      
      try {
        // Fetch fresh transactions to compute exact balance of the selected wallet before save
        const txs = await transactionService.getTransactions(user.id, accountId)
        currentBalance = dashboardService.calculateStats(txs).balance + Number(account.opening_balance || 0)
      } catch (err) {
        // Fallback
        currentBalance = Number(account.current_balance || 0)
      }

      if (expenseAmount > currentBalance) {
        toast.error('Insufficient funds. Expense exceeds available balance.')
        return
      }
    }

    const payload = {
      user_id: user.id,
      account_id: accountId,
      type,
      amount: Number(amount),
      category,
      description: description || null,
      notes: notes || null,
      currency,
      created_at: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString()
    }

    try {
      if (transactionToEdit) {
        await updateTransaction({
          id: transactionToEdit.id,
          updates: payload
        })
        toast.success('Transaction successfully updated')
      } else {
        await addTransaction(payload)
        toast.success('Transaction successfully added')
      }
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save transaction')
    }
  }

  if (!isOpen) return null

  return (
    <>
      <AnimatePresence>
        {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md max-h-screen overflow-y-auto"
          >
            <GlassCard intensity="high" className="p-8 border border-white/10 shadow-2xl relative">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-foreground">
                  {transactionToEdit ? 'Edit Transaction' : 'Add Transaction'}
                </h2>
                <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {selectedAccountId === 'all' && (
                  <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 p-3 rounded-lg text-sm mb-4">
                    <AlertCircle className="inline h-4 w-4 mr-2 -mt-0.5" />
                    Please select an account before creating records.
                  </div>
                )}

                {/* Account Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">Account</label>
                  
                  <div className="relative" ref={accountDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-background/50 border border-white/10 text-foreground focus:ring-1 focus:ring-primary outline-none hover:bg-white/5 transition-colors"
                    >
                      {accountId ? (
                        <div className="flex items-center">
                          <span className="font-medium">{accounts.find(a => a.id === accountId)?.name}</span>
                          <span className="ml-2 text-xs text-muted-foreground bg-white/10 px-2 py-0.5 rounded">
                            {accounts.find(a => a.id === accountId)?.currency_code}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Select Account</span>
                      )}
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>

                    <AnimatePresence>
                      {isAccountDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-50 w-full mt-2 bg-card border border-white/10 rounded-xl shadow-xl overflow-hidden backdrop-blur-md max-h-60 overflow-y-auto"
                        >
                          {accounts.length > 0 ? (
                            <div className="py-1">
                              {accounts.map(acc => (
                                <button
                                  key={acc.id}
                                  type="button"
                                  onClick={() => {
                                    setAccountId(acc.id)
                                    setIsAccountDropdownOpen(false)
                                  }}
                                  className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${accountId === acc.id ? 'bg-primary/10 text-primary' : 'hover:bg-white/5 text-foreground'}`}
                                >
                                  <span className="font-medium">{acc.name}</span>
                                  <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-muted-foreground">{acc.currency_code}</span>
                                </button>
                              ))}
                              <div className="border-t border-white/5 mt-1 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsAccountDropdownOpen(false)
                                    setIsAccountModalOpen(true)
                                  }}
                                  className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
                                >
                                  + Create Account / Wallet
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-6 flex flex-col items-center justify-center text-center">
                              <Wallet className="h-8 w-8 text-muted-foreground mb-3 opacity-50" />
                              <p className="text-sm font-medium text-foreground mb-1">No account found</p>
                              <Button
                                type="button"
                                onClick={() => {
                                  setIsAccountDropdownOpen(false)
                                  setIsAccountModalOpen(true)
                                }}
                                className="w-full mt-4"
                              >
                                Create Account
                              </Button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Transaction Type Toggle */}
                <div className="flex rounded-xl overflow-hidden border border-white/10 p-1 bg-card/50 glass">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${type === 'expense' ? 'bg-red-500 text-white shadow' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${type === 'income' ? 'bg-emerald-500 text-white shadow' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}
                  >
                    Income
                  </button>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-muted-foreground font-medium">{(accounts.find(a => a.id === accountId)?.currency_code || 'USD') === 'USD' ? '$' : (accounts.find(a => a.id === accountId)?.currency_code || 'USD')}</span>
                    <Input 
                      type="number" 
                      step="0.01"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-12 bg-background/50 border-white/10 text-lg rounded-xl" 
                      placeholder="0.00" 
                    />
                  </div>
                </div>

                {/* Category Select */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">Category</label>
                  <select 
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 rounded-xl bg-background/50 border border-white/10 text-foreground focus:ring-1 focus:ring-primary outline-none [&>option]:bg-white [&>option]:text-black"
                  >
                    <option value="" disabled>Select category</option>
                    {type === 'income' ? (
                      INCOME_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)
                    ) : (
                      EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)
                    )}
                  </select>
                </div>

                {/* Description Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">Description (Optional)</label>
                  <Input 
                    type="text" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-background/50 border-white/10 rounded-xl" 
                    placeholder="E.g., Uber to work / Client payout" 
                  />
                </div>

                {/* Notes Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground flex items-center">
                    <FileText className="w-3.5 h-3.5 mr-1" /> Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full p-3 rounded-xl bg-background/50 border border-white/10 text-foreground text-sm focus:ring-1 focus:ring-primary outline-none resize-none"
                    placeholder="Extra details about this transaction..."
                  />
                </div>

                {/* Date Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1" /> Date & Time
                  </label>
                  <Input 
                    type="datetime-local" 
                    required
                    value={createdAt}
                    onChange={(e) => setCreatedAt(e.target.value)}
                    className="bg-background/50 border-white/10 rounded-xl" 
                  />
                </div>

                <div className="flex space-x-4 pt-4 mt-2">
                  <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl py-6 text-base font-bold bg-white/5 hover:bg-white/10 border-white/10">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isAdding} className="flex-1 rounded-xl py-6 text-base font-bold">
                    {isAdding ? 'Saving...' : transactionToEdit ? 'Save Changes' : 'Save Transaction'}
                  </Button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
      <AccountModal 
        isOpen={isAccountModalOpen} 
        onClose={() => setIsAccountModalOpen(false)} 
        onSuccess={(id) => {
          setAccountId(id)
          setIsAccountModalOpen(false)
        }}
      />
    </>
  )
}
