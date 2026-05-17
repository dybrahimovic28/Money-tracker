import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Target, Plus, Trash2, PiggyBank, AlertTriangle, TrendingUp, Sparkles, CheckCircle2, X } from 'lucide-react'
import { useBudgets } from '@/hooks/useBudgets'
import { useSavingsGoals } from '@/hooks/useSavingsGoals'
import { useCurrency } from '@/context/CurrencyContext'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { format } from 'date-fns'

const BUDGET_CATEGORIES = [
  'Food', 'Transport', 'Bills', 'Shopping', 'Rent', 
  'Health', 'Education', 'Entertainment', 'Utilities', 'Other'
]

export function Budgets() {
  const { user } = useAuth()
  const { formatAmount } = useCurrency()
  const { budgetStats, saveBudget, deleteBudget, isLoading: budgetsLoading } = useBudgets()
  const { goals, saveGoal, updateGoal, deleteGoal, isLoading: goalsLoading } = useSavingsGoals()

  // Budget Creation States
  const [showAddBudget, setShowAddBudget] = useState(false)
  const [budgetCategory, setBudgetCategory] = useState('')
  const [budgetLimit, setBudgetLimit] = useState('')

  // Goal Creation States
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [goalName, setGoalName] = useState('')
  const [goalTarget, setGoalTarget] = useState('')
  const [goalDeadline, setGoalDeadline] = useState('')

  // Goal Contribution States
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null)
  const [contributionAmount, setContributionAmount] = useState('')

  // Goal Celebration Emojis State
  const [particles, setParticles] = useState<{ id: number; char: string; x: number; y: number }[]>([])

  const triggerCelebration = () => {
    const chars = ['🎉', '✨', '💰', '🏆', '💎', '🔥', '🌟']
    const newParticles = Array.from({ length: 25 }).map((_, i) => ({
      id: Math.random() + i,
      char: chars[Math.floor(Math.random() * chars.length)],
      x: Math.random() * 100 - 50, // Percentage offset from center
      y: Math.random() * 100 - 50
    }))
    setParticles(newParticles)
    setTimeout(() => setParticles([]), 3000)
  }

  // Handle Add Budget
  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
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

  // Handle Add Goal
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!goalName) {
      toast.error('Please enter a goal name')
      return
    }
    if (!goalTarget || Number(goalTarget) <= 0) {
      toast.error('Please enter a valid positive target amount')
      return
    }
    if (!goalDeadline) {
      toast.error('Please select a target deadline date')
      return
    }

    try {
      await saveGoal({
        user_id: user.id,
        name: goalName,
        target_amount: Number(goalTarget),
        current_amount: 0,
        deadline: new Date(goalDeadline).toISOString()
      })
      toast.success('Savings goal successfully created')
      setGoalName('')
      setGoalTarget('')
      setGoalDeadline('')
      setShowAddGoal(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to create savings goal')
    }
  }

  // Handle Contribution
  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contributeGoalId) return
    if (!contributionAmount || Number(contributionAmount) <= 0) {
      toast.error('Please enter a valid positive amount')
      return
    }

    const goal = goals.find(g => g.id === contributeGoalId)
    if (!goal) return

    const newCurrent = Number(goal.current_amount) + Number(contributionAmount)
    const reachedGoal = newCurrent >= Number(goal.target_amount) && Number(goal.current_amount) < Number(goal.target_amount)

    try {
      await updateGoal({
        id: contributeGoalId,
        updates: { current_amount: newCurrent }
      })
      
      if (reachedGoal) {
        toast.success(`Congratulations! You reached your goal "${goal.name}"! 🎉`, { duration: 5000 })
        triggerCelebration()
      } else {
        toast.success(`Successfully saved ${formatAmount(Number(contributionAmount))} towards "${goal.name}"`)
      }

      setContributeGoalId(null)
      setContributionAmount('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save contribution')
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12 relative"
    >
      {/* Floating Emoji Celebration */}
      <AnimatePresence>
        {particles.length > 0 && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0, y: 0 }}
                animate={{ 
                  opacity: [0, 1, 1, 0], 
                  scale: [0.5, 1.5, 1], 
                  x: [0, p.x * 4], 
                  y: [0, p.y * 4 - 300] 
                }}
                transition={{ duration: 2.5, ease: 'easeOut' }}
                className="absolute text-4xl"
              >
                {p.char}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets & Savings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage monthly spending caps and long-term financial milestones.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Category Limits Column (Left) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center">
              <Target className="w-5 h-5 mr-2 text-primary" /> Monthly Spending Limits
            </h2>
            <Button onClick={() => setShowAddBudget(true)} className="rounded-xl flex items-center space-x-1 py-1.5 h-auto">
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

        {/* Savings Goals Column (Right) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center">
              <PiggyBank className="w-5 h-5 mr-2 text-emerald-500" /> Savings Targets
            </h2>
            <Button onClick={() => setShowAddGoal(true)} className="rounded-xl border border-emerald-500/20 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 flex items-center space-x-1 py-1.5 h-auto">
              <Plus className="w-4 h-4" /> <span>New Goal</span>
            </Button>
          </div>

          {/* Add Goal Form overlay */}
          <AnimatePresence>
            {showAddGoal && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <GlassCard intensity="low" className="p-5 border border-emerald-500/20 relative">
                  <button onClick={() => setShowAddGoal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                  <form onSubmit={handleAddGoal} className="space-y-4">
                    <h3 className="font-semibold text-sm">Create Savings Milestone</h3>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Goal Name</label>
                        <Input
                          type="text"
                          required
                          placeholder="E.g., Emergency Fund / New Tesla"
                          value={goalName}
                          onChange={(e) => setGoalName(e.target.value)}
                          className="bg-background/50 border-white/10 rounded-xl"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Target Amount</label>
                          <Input
                            type="number"
                            required
                            placeholder="0.00"
                            value={goalTarget}
                            onChange={(e) => setGoalTarget(e.target.value)}
                            className="bg-background/50 border-white/10 rounded-xl"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Deadline Date</label>
                          <Input
                            type="date"
                            required
                            value={goalDeadline}
                            onChange={(e) => setGoalDeadline(e.target.value)}
                            className="bg-background/50 border-white/10 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>
                    <Button type="submit" className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold">
                      Launch Savings Target
                    </Button>
                  </form>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Contribute Modal overlay */}
          <AnimatePresence>
            {contributeGoalId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-sm"
                >
                  <GlassCard intensity="high" className="p-6 border border-emerald-500/20 relative shadow-2xl">
                    <button onClick={() => setContributeGoalId(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4" />
                    </button>
                    <form onSubmit={handleContribute} className="space-y-4">
                      <h3 className="text-lg font-bold text-foreground">Save Towards Goal</h3>
                      <p className="text-xs text-muted-foreground">Increase your savings balance for this specific target milestone.</p>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Amount to Deposit</label>
                        <Input
                          type="number"
                          step="0.01"
                          required
                          autoFocus
                          placeholder="0.00"
                          value={contributionAmount}
                          onChange={(e) => setContributionAmount(e.target.value)}
                          className="bg-background/50 border-white/10 rounded-xl"
                        />
                      </div>
                      <Button type="submit" className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold">
                        Confirm Savings Deposit
                      </Button>
                    </form>
                  </GlassCard>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Goals List */}
          <div className="space-y-4">
            {goalsLoading ? (
              <div className="space-y-3">
                <SkeletonLoader className="h-24 w-full rounded-xl" />
                <SkeletonLoader className="h-24 w-full rounded-xl" />
              </div>
            ) : goals.length === 0 ? (
              <GlassCard intensity="low" className="p-8 text-center text-muted-foreground text-sm">
                No active savings goals. Save for travel, investments, or high-value targets today!
              </GlassCard>
            ) : (
              goals.map((g) => {
                const target = Number(g.target_amount)
                const current = Number(g.current_amount)
                const pct = Math.min(Math.round((current / target) * 100), 100)
                const isCompleted = current >= target

                return (
                  <GlassCard 
                    key={g.id} 
                    intensity="low" 
                    className={`p-5 border relative overflow-hidden ${
                      isCompleted ? 'border-emerald-500/20 bg-emerald-950/5' : 'border-white/5'
                    }`}
                  >
                    {isCompleted && (
                      <div className="absolute top-2 right-2 text-emerald-500" title="Goal Met!">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                      </div>
                    )}

                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-bold text-foreground text-base flex items-center">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5 shrink-0" />
                          ) : (
                            <TrendingUp className="w-4 h-4 text-emerald-500 mr-1.5 shrink-0" />
                          )}
                          <span className="truncate max-w-[150px] sm:max-w-[200px]" title={g.name}>{g.name}</span>
                        </h4>
                        <div className="text-xs text-muted-foreground">
                          <span>Target: {formatAmount(target)}</span>
                          <span className="mx-1">•</span>
                          <span>Saved: {formatAmount(current)}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground pt-1">
                          Deadline: {format(new Date(g.deadline), 'MMM dd, yyyy')}
                        </p>
                      </div>

                      <div className="flex flex-col items-end space-y-3">
                        <span className={`text-base font-bold ${isCompleted ? 'text-emerald-400' : 'text-foreground'}`}>
                          {pct}%
                        </span>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => setContributeGoalId(g.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
                          >
                            Deposit
                          </button>
                          <button 
                            onClick={() => deleteGoal(g.id)}
                            className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-white/5 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Simple Goal Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-white/5 mt-4 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500 shadow shadow-emerald-500/50' : 'bg-emerald-400'}`}
                      />
                    </div>
                  </GlassCard>
                )
              })
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
