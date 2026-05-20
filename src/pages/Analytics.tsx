import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { useTransactions } from '@/hooks/useTransactions'
import { useCurrency } from '@/context/CurrencyContext'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { EmptyState } from '@/components/ui/EmptyState'
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts'
import { Activity, TrendingUp, TrendingDown, DollarSign, PieChart as PieIcon } from 'lucide-react'

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#06b6d4', '#64748b']

export function Analytics() {
  const { formatAmount } = useCurrency()
  const { activeTransactions, isLoading } = useTransactions()

  // Aggregate Key Statistics
  const stats = useMemo(() => {
    let income = 0
    let expenses = 0
    const categoryTotals: Record<string, number> = {}
    let topCategory = 'None'
    let topCategoryVal = 0
    let topTransaction: any = null

    activeTransactions.forEach(t => {
      const amt = Number(t.amount)
      if (t.type === 'income') {
        income += amt
      } else {
        expenses += amt
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amt
        if (categoryTotals[t.category] > topCategoryVal) {
          topCategoryVal = categoryTotals[t.category]
          topCategory = t.category
        }
        if (!topTransaction || amt > Number(topTransaction.amount)) {
          topTransaction = t
        }
      }
    })

    const netCashflow = income - expenses
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0

    return {
      income,
      expenses,
      netCashflow,
      savingsRate: Number(Math.max(savingsRate, 0).toFixed(1)),
      topCategory,
      topCategoryVal,
      topTransaction
    }
  }, [activeTransactions])

  // Pie Chart Data: Expense Category Breakdown
  const pieData = useMemo(() => {
    const totals: Record<string, number> = {}
    activeTransactions.forEach(t => {
      if (t.type === 'expense') {
        totals[t.category] = (totals[t.category] || 0) + Number(t.amount)
      }
    })
    return Object.keys(totals).map(cat => ({
      name: cat,
      value: Number(totals[cat].toFixed(2))
    })).sort((a, b) => b.value - a.value)
  }, [activeTransactions])

  const chartData = useMemo(() => {
    const monthlyData = activeTransactions.reduce((acc, tx) => {
      const month = new Date(tx.created_at).toLocaleString('default', { month: 'short' })
      if (!acc[month]) acc[month] = { name: month, income: 0, expenses: 0, order: new Date(tx.created_at).getMonth() }
      
      if (tx.type === 'income') {
        acc[month].income += Number(tx.amount)
      } else {
        acc[month].expenses += Number(tx.amount)
      }
      return acc
    }, {} as Record<string, { name: string, income: number, expenses: number, order: number }>)

    return Object.values(monthlyData).sort((a, b) => a.order - b.order)
  }, [activeTransactions])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader className="h-[200px] w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonLoader className="h-[300px] w-full rounded-2xl" />
          <SkeletonLoader className="h-[300px] w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (activeTransactions.length === 0) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <EmptyState 
          icon={Activity}
          title="Analytical engines waiting"
          description="We need at least one transaction to construct your spending breakdowns, cashflow timelines, and savings ratios!"
        />
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      {/* Header section */}
      <div className="flex flex-col justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Cashflow breakdowns and ratios.</p>
        </div>
      </div>

      {/* Key Analytical Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <GlassCard intensity="low" className="p-5 border border-white/5 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-500">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Savings Rate</p>
            <h3 className="text-xl font-bold mt-0.5 text-foreground">{stats.savingsRate}%</h3>
            <p className="text-[10px] text-muted-foreground">Target limit guideline: 20%+</p>
          </div>
        </GlassCard>

        <GlassCard intensity="low" className="p-5 border border-white/5 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Net Cashflow</p>
            <h3 className={`text-xl font-bold mt-0.5 ${stats.netCashflow >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
              {formatAmount(stats.netCashflow)}
            </h3>
            <p className="text-[10px] text-muted-foreground">Total delta in range</p>
          </div>
        </GlassCard>

        <GlassCard intensity="low" className="p-5 border border-white/5 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-orange-500/20 text-orange-400">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Top Expense</p>
            <h3 className="text-xl font-bold mt-0.5 text-foreground truncate max-w-[150px]" title={stats.topCategory}>
              {stats.topCategory}
            </h3>
            <p className="text-[10px] text-muted-foreground">Total: {formatAmount(stats.topCategoryVal)}</p>
          </div>
        </GlassCard>

        <GlassCard intensity="low" className="p-5 border border-white/5 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-red-500/20 text-red-400">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Max Transaction</p>
            <h3 className="text-xl font-bold mt-0.5 text-foreground truncate max-w-[150px]" title={stats.topTransaction?.description || stats.topTransaction?.category}>
              {stats.topTransaction ? (stats.topTransaction.description || stats.topTransaction.category) : 'None'}
            </h3>
            <p className="text-[10px] text-muted-foreground">
              {stats.topTransaction ? `Amount: -${formatAmount(stats.topTransaction.amount)}` : 'No expense recorded'}
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Income vs Expense comparisons */}
        <div className="lg:col-span-8 space-y-6">

          <GlassCard intensity="low" className="p-6 border border-white/5">
            <h3 className="font-bold text-foreground text-lg mb-6">Income vs Expense Comparison</h3>
            <div className="h-72 w-full">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Not enough spending records</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Spending Category Pie chart Breakdown (Right) */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard intensity="low" className="p-6 border border-white/5 h-full flex flex-col">
            <h3 className="font-bold text-foreground text-lg mb-6">Expense Category Mix</h3>
            
            <div className="h-60 w-full relative flex-1">
              {pieData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No expenses recorded in range</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val) => [`${formatAmount(Number(val))}`, 'Spent']}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Custom Pie Legend */}
            <div className="space-y-2 mt-4 max-h-48 overflow-y-auto pr-1">
              {pieData.map((p, index) => (
                <div key={p.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                    <span className="font-medium text-foreground">{p.name}</span>
                  </div>
                  <span className="text-muted-foreground font-semibold">{formatAmount(p.value)}</span>
                </div>
              ))}
              {pieData.length === 0 && (
                <p className="text-center text-xs text-muted-foreground">No data points available</p>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  )
}
