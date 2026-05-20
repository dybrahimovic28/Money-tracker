import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Target, Plus, Trash2, AlertTriangle, X } from 'lucide-react'
import { useBudgets } from '@/hooks/useBudgets'
import { useCurrency } from '@/context/CurrencyContext'
import { useAuth } from '@/context/AuthContext'
import { useAccounts } from '@/context/AccountContext'
import toast from 'react-hot-toast'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'

const BUDGET_CATEGORIES = [
  'Food', 'Transport', 'Bills', 'Shopping', 'Rent', 
  'Health', 'Education', 'Entertainment', 'Utilities', 'Other'
]

export function Budgets() {
  const { user } = useAuth()
  const { formatAmount } = useCurrency()
  const { selectedAccountId } = useAccounts()
  const { budgetStats, saveBudget, deleteBudget, isLoading: budgetsLoading } = useBudgets()

  // Budget Creation States
  const [showAddBudget, setShowAddBudget] = useState(false)
  const [budgetCategory, setBudgetCategory] = useState('')
  const [budgetLimit, setBudgetLimit] = useState('')

  // Handle Add Budget
  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    const accId = selectedAccountId !== 'all' ? selectedAccountId : ''
    if (!accId) {
      toast.error('Please select an account for this budget.')
      return
    }
    if (!budgetCategory) {
      toast.error('Please select a category')
      return
    }
    if (!budgetLimit || Number(budgetLimit) <= 0) {
      toast.error('Please enter a valid positive limit')
      return
    }

    try {
      const now = new Date()
      await saveBudget({
        user_id: user.id,
        account_id: accId,
        category: budgetCategory,
        amount_limit: Number(budgetLimit),
        month: now.getMonth() + 1, // 1-indexed month
        year: now.getFullYear()
      })
      toast.success('Category budget limit saved successfully')
      setBudgetLimit('')
      setBudgetCategory('')
      setShowAddBudget(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to save budget limit')
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12 relative max-w-4xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage monthly spending caps.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center">
            <Target className="w-5 h-5 mr-2 text-primary" /> Monthly Spending Limits
          </h2>
          <Button onClick={() => {
            if (!selectedAccountId) {
              toast.error('Select an account first.')
              return
            }
            setShowAddBudget(true)
          }} className="rounded-xl flex items-center space-x-1 py-1.5 h-auto">
            <Plus className="w-4 h-4" /> <span>Add Limit</span>
          </Button>
        </div>

        {/* Add Budget Form Inline overlay */}
        <AnimatePresence>
          {showAddBudget && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <GlassCard intensity="low" className="p-5 border border-primary/20 relative">
                <button onClick={() => setShowAddBudget(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
                <form onSubmit={handleAddBudget} className="space-y-4">
                  <h3 className="font-semibold text-sm">Create New Category Limit</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Category</label>
                      <select
                        required
                        value={budgetCategory}
                        onChange={(e) => setBudgetCategory(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-background/50 border border-white/10 text-foreground text-sm outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="" disabled>Select category</option>
                        {BUDGET_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Monthly Cap Amount</label>
                      <Input
                        type="number"
                        required
                        placeholder="0.00"
                        value={budgetLimit}
                        onChange={(e) => setBudgetLimit(e.target.value)}
                        className="bg-background/50 border-white/10 rounded-xl py-5"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full rounded-xl">Save Budget Limit</Button>
                </form>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Budgets List */}
        <div className="space-y-4">
          {budgetsLoading ? (
            <div className="space-y-3">
              <SkeletonLoader className="h-20 w-full rounded-xl" />
              <SkeletonLoader className="h-20 w-full rounded-xl" />
            </div>
          ) : budgetStats.length === 0 ? (
            <GlassCard intensity="low" className="p-8 text-center text-muted-foreground text-sm">
              No active monthly budgets. Define spending limits for Food, Shopping, Utilities, or Rent to prevent overspending!
            </GlassCard>
          ) : (
            budgetStats.map((b) => (
              <GlassCard 
                key={b.id} 
                intensity="low" 
                className={`p-5 border transition-all ${
                  b.overspent 
                    ? 'border-red-500/20 bg-red-950/5' 
                    : b.warning 
                      ? 'border-orange-500/20 bg-orange-950/5' 
                      : 'border-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground text-base">{b.category}</span>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>Spent: {formatAmount(b.spent)}</span>
                      <span>•</span>
                      <span>Limit: {formatAmount(b.amount_limit)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Warning Indicators */}
                    {b.overspent && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 flex items-center border border-red-500/30">
                        <AlertTriangle className="w-3 h-3 mr-1" /> OVERSPENT
                      </span>
                    )}
                    {b.warning && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 flex items-center border border-orange-500/30">
                        <AlertTriangle className="w-3 h-3 mr-1" /> WARNING
                      </span>
                    )}

                    <span className={`font-semibold text-sm ${b.overspent ? 'text-red-400' : b.warning ? 'text-orange-400' : 'text-primary'}`}>
                      {b.percent}%
                    </span>
                    
                    <button 
                      onClick={() => deleteBudget(b.id)}
                      className="p-1 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(b.percent, 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      b.overspent 
                        ? 'bg-red-500 shadow-lg shadow-red-500/30' 
                        : b.warning 
                          ? 'bg-orange-500 shadow-lg shadow-orange-500/30' 
                          : 'bg-primary shadow-lg shadow-primary/30'
                    }`}
                  />
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>
    </motion.div>
  )
}
