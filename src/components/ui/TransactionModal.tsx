import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
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
}

export function TransactionModal({ isOpen, onClose, transactionToEdit }: TransactionModalProps) {
  const { user } = useAuth()
  const { addTransaction, updateTransaction, isAdding } = useTransactions()
  const { currency } = useCurrency()

  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type)
      setAmount(String(transactionToEdit.amount))
      setCategory(transactionToEdit.category)
      setDescription(transactionToEdit.description || '')
    } else {
      setType('expense')
      setAmount('')
      setCategory('')
      setDescription('')
    }
  }, [transactionToEdit, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!amount || isNaN(Number(amount))) {
      toast.error('Please enter a valid amount')
      return
    }
    if (!category) {
      toast.error('Please enter a category')
      return
    }

    try {
      if (transactionToEdit) {
        await updateTransaction({
          id: transactionToEdit.id,
          updates: {
            type,
            amount: Number(amount),
            category,
            description,
          }
        })
        toast.success('Transaction updated')
      } else {
        await addTransaction({
          user_id: user.id,
          type,
          amount: Number(amount),
          category,
          description,
          currency,
          notes: null
        })
        toast.success('Transaction added')
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
            <GlassCard intensity="high" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {transactionToEdit ? 'Edit Transaction' : 'Add Transaction'}
                </h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex rounded-xl overflow-hidden border border-white/10 p-1 bg-card/50 glass">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${type === 'expense' ? 'bg-red-500 text-white' : 'hover:bg-white/5'}`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${type === 'income' ? 'bg-emerald-500 text-white' : 'hover:bg-white/5'}`}
                  >
                    Income
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-muted-foreground">{currency === 'USD' ? '$' : currency}</span>
                    <Input 
                      type="number" 
                      step="0.01"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-12 bg-background/50 border-white/10 text-lg" 
                      placeholder="0.00" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <select 
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 rounded-xl bg-background/50 border border-white/10 text-foreground focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="" disabled>Select category</option>
                    <option value="Food">Food & Dining</option>
                    <option value="Transport">Transportation</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Housing">Housing & Utilities</option>
                    <option value="Salary">Salary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Description (Optional)</label>
                  <Input 
                    type="text" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-background/50 border-white/10" 
                    placeholder="E.g., Uber to work" 
                  />
                </div>

                <Button type="submit" disabled={isAdding} className="w-full mt-6 rounded-xl py-6 text-lg">
                  {isAdding ? 'Saving...' : 'Save Transaction'}
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
