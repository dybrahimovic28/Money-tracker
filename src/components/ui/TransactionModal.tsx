import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, FileText } from 'lucide-react'
import { GlassCard } from './GlassCard'
import { Input } from './input'
import { Button } from './button'
import { useTransactions } from '@/hooks/useTransactions'
import { useAuth } from '@/context/AuthContext'
import { Transaction } from '@/types'
import { useCurrency } from '@/context/CurrencyContext'
import toast from 'react-hot-toast'

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
  const { currency } = useCurrency()

  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [createdAt, setCreatedAt] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (transactionToEdit) {
        setType(transactionToEdit.type)
        setAmount(String(transactionToEdit.amount))
        setCategory(transactionToEdit.category)
        setDescription(transactionToEdit.description || '')
        setNotes(transactionToEdit.notes || '')
        
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
        
        // Default to current local time in yyyy-MM-ddThh:mm format
        const now = new Date()
        const tzOffset = now.getTimezoneOffset() * 60000
        const localISOTime = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16)
        setCreatedAt(localISOTime)
      }
    }
  }, [transactionToEdit, isOpen, defaultType])

  // Reset category if type changes to prevent invalid categories
  useEffect(() => {
    if (isOpen && !transactionToEdit) {
      setCategory('')
    }
  }, [type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid positive amount')
      return
    }
    if (!category) {
      toast.error('Please select a category')
      return
    }

    const payload = {
      user_id: user.id,
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md"
          >
            <GlassCard intensity="high" className="p-6 border border-white/10 shadow-2xl relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  {transactionToEdit ? 'Edit Transaction' : 'Add Transaction'}
                </h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                    <span className="absolute left-3 top-3 text-muted-foreground font-medium">{currency === 'USD' ? '$' : currency}</span>
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
                    className="w-full p-3 rounded-xl bg-background/50 border border-white/10 text-foreground focus:ring-1 focus:ring-primary outline-none"
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

                <Button type="submit" disabled={isAdding} className="w-full mt-6 rounded-xl py-6 text-lg font-bold">
                  {isAdding ? 'Saving...' : transactionToEdit ? 'Save Changes' : 'Save Transaction'}
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
