import { BalanceCard } from '@/components/ui/BalanceCard'
import { QuickActionButton } from '@/components/ui/QuickActionButton'
import { HealthScoreCard } from '@/components/ui/HealthScoreCard'
import { BudgetProgress } from '@/components/ui/BudgetProgress'
import { GlassCard } from '@/components/ui/GlassCard'
import { StatCard } from '@/components/ui/StatCard'
import { ArrowDownToLine, ArrowUpToLine, RefreshCw, FileText, Wallet } from 'lucide-react'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useCurrency } from '@/context/CurrencyContext'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { useBudgets } from '@/hooks/useBudgets'
import { useSavingsGoals } from '@/hooks/useSavingsGoals'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { format } from 'date-fns'
import { useState } from 'react'
import { useAccounts } from '@/context/AccountContext'
import { TransactionModal } from '@/components/ui/TransactionModal'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useProfile } from '@/hooks/useProfile'

export function Dashboard() {
  const navigate = useNavigate()
  const { formatAmount } = useCurrency()
  const { statsByCurrency, chartData, isLoading, transactions } = useDashboardStats()
  const { budgetStats } = useBudgets()
  const { totalSavingsCurrent } = useSavingsGoals()
  const { selectedAccountId } = useAccounts()
  const { profile } = useProfile()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalDefaultType, setModalDefaultType] = useState<'income' | 'expense'>('expense')

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader className="h-[200px] w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonLoader className="h-24 w-full rounded-2xl" />
          <SkeletonLoader className="h-24 w-full rounded-2xl" />
          <SkeletonLoader className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  const recentTransactions = transactions.slice(0, 5)
  const isAllAccounts = selectedAccountId === 'all'
  
  // Single Account Stats fallback
  const firstCurrencyStats = Object.values(statsByCurrency)[0] || { totalIncome: 0, totalExpense: 0, balance: 0, monthlyGrowth: 0, currentMonthIncome: 0, currentMonthExpense: 0 }
  const singleStats = isAllAccounts ? null : firstCurrencyStats

  const money_left = singleStats ? singleStats.balance : 0
  const expenses = singleStats ? singleStats.totalExpense : 0
  const income = singleStats ? singleStats.totalIncome : 0
  
  let health = 0
  if (income === 0) {
    health = 0
  } else {
    health = (money_left / income) * 100
  }
  const computedHealthScore = Math.max(0, Math.min(Math.round(health), 100))

  const targetMonthlyIncome = profile?.target_monthly_income || Number(localStorage.getItem('target_monthly_income')) || 0
  const currentIncome = singleStats?.currentMonthIncome || 0
  const targetProgress = targetMonthlyIncome > 0 ? Math.min(Math.round((currentIncome / targetMonthlyIncome) * 100), 100) : 0

  const handleExportQuick = () => {
    if (transactions.length === 0) {
      toast.error('No transactions to export')
      return
    }
    navigate('/reports')
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 md:space-y-8 pb-12"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Hero Section */}
        <div className="lg:col-span-8 space-y-6">
          {isAllAccounts ? (
            <div className="space-y-4">
              {Object.entries(statsByCurrency).length === 0 && (
                <BalanceCard balance={0} monthlyGrowth={0} title="Total Balance" />
              )}
              {Object.entries(statsByCurrency).map(([currency, stat]) => (
                <div key={currency} className="mb-4">
                  <BalanceCard 
                    balance={stat.balance} 
                    monthlyGrowth={stat.monthlyGrowth} 
                    currencyCode={currency}
                    title={`${currency} Balance`}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <StatCard 
                      title="Total Income" 
                      amount={stat.totalIncome} 
                      icon={ArrowUpToLine} 
                      iconClassName="text-emerald-500 bg-emerald-500/10" 
                    />
                    <StatCard 
                      title="Total Expenses" 
                      amount={stat.totalExpense} 
                      icon={ArrowDownToLine} 
                      iconClassName="text-red-500 bg-red-500/10" 
                    />
                    <StatCard 
                      title="Savings Deposited" 
                      amount={totalSavingsCurrent} 
                      icon={Wallet} 
                      iconClassName="text-blue-500 bg-blue-500/10" 
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <BalanceCard 
                balance={singleStats?.balance || 0} 
                monthlyGrowth={singleStats?.monthlyGrowth || 0} 
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard 
                  title="Total Income" 
                  amount={singleStats?.totalIncome || 0} 
                  icon={ArrowUpToLine} 
                  iconClassName="text-emerald-500 bg-emerald-500/10" 
                />
                <StatCard 
                  title="Total Expenses" 
                  amount={singleStats?.totalExpense || 0} 
                  icon={ArrowDownToLine} 
                  iconClassName="text-red-500 bg-red-500/10" 
                />
                <StatCard 
                  title="Savings Deposited" 
                  amount={totalSavingsCurrent} 
                  icon={Wallet} 
                  iconClassName="text-blue-500 bg-blue-500/10" 
                />
              </div>
            </>
          )}

          {/* Quick Actions grid */}
          <div className="grid grid-cols-4 gap-2 md:gap-4">
            <QuickActionButton 
              onClick={() => {
                if (isAllAccounts) {
                  toast.error('Select an account first.')
                  return
                }
                setModalDefaultType('income')
                setIsModalOpen(true)
              }} 
              icon={ArrowUpToLine} 
              label="Income" 
              colorClass="bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30" 
            />
            <QuickActionButton 
              onClick={() => {
                if (isAllAccounts) {
                  toast.error('Select an account first.')
                  return
                }
                setModalDefaultType('expense')
                setIsModalOpen(true)
              }} 
              icon={ArrowDownToLine} 
              label="Expense" 
              colorClass="bg-red-500/20 text-red-500 hover:bg-red-500/30" 
            />
            <QuickActionButton 
              onClick={() => navigate('/budgets')} 
              icon={RefreshCw} 
              label="Budget/Goal" 
              colorClass="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30" 
            />
            <QuickActionButton 
              onClick={handleExportQuick} 
              icon={FileText} 
              label="Export" 
              colorClass="bg-purple-500/20 text-purple-500 hover:bg-purple-500/30" 
            />
          </div>

          {/* Recharts Area Chart */}
          <GlassCard intensity="low" className="p-6 border border-white/5 shadow-xl">
            <h3 className="font-bold text-foreground text-lg mb-6">Cash Flow (Monthly timeline)</h3>
            <div className="h-64 w-full">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Add income or expense transactions to view cashflow trends</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.5 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.5 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-6">
          <HealthScoreCard score={computedHealthScore} />

          {/* Monthly Target Progress */}
          <GlassCard intensity="low" className="p-6 border border-white/5 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-foreground text-sm">Monthly Target Progress</h3>
              <span className="text-xs font-semibold text-primary">{targetProgress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 mb-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${targetProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground flex justify-between">
              <span>{formatAmount(currentIncome)}</span>
              <span>{targetMonthlyIncome > 0 ? formatAmount(targetMonthlyIncome) : 'Set Target in Settings'}</span>
            </p>
          </GlassCard>
          
          {/* Dynamic Budgets Overview */}
          <GlassCard intensity="low" className="p-6 border border-white/5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground text-sm">Budget Overview</h3>
              <button 
                onClick={() => navigate('/budgets')} 
                className="text-primary text-xs font-semibold hover:underline"
              >
                Manage Budgets
              </button>
            </div>
            <div className="space-y-4">
              {budgetStats.slice(0, 3).map((b) => (
                <BudgetProgress 
                  key={b.id} 
                  category={b.category} 
                  spent={b.spent} 
                  limit={b.amount_limit} 
                />
              ))}
              {budgetStats.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">No active monthly budgets defined. Go to Budgets & Savings to set spending caps!</p>
              )}
            </div>
          </GlassCard>

          {/* Recent Transactions List */}
          <GlassCard intensity="low" className="p-6 border border-white/5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground text-sm">Recent Transactions</h3>
              <button 
                onClick={() => navigate('/transactions')} 
                className="text-primary text-xs font-semibold hover:underline"
              >
                View History
              </button>
            </div>
            
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`p-2 rounded-full shrink-0 ${tx.type === 'income' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                      <Wallet className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{tx.description || tx.category}</p>
                      <p className="text-[10px] text-muted-foreground">{format(new Date(tx.created_at), 'MMM d, h:mm a')}</p>
                    </div>
                  </div>
                  <span className={`font-bold text-xs shrink-0 ${tx.type === 'income' ? 'text-emerald-500' : 'text-foreground'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatAmount(Number(tx.amount))}
                  </span>
                </div>
              ))}
              {recentTransactions.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">No recent transactions recorded</p>
              )}
            </div>
          </GlassCard>

        </div>
      </div>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        defaultType={modalDefaultType}
      />
    </motion.div>
  )
}
