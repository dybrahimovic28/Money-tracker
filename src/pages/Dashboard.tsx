import { BalanceCard } from '@/components/ui/BalanceCard'
import { QuickActionButton } from '@/components/ui/QuickActionButton'
import { HealthScoreCard } from '@/components/ui/HealthScoreCard'
import { BudgetProgress } from '@/components/ui/BudgetProgress'
import { GlassCard } from '@/components/ui/GlassCard'
import { ArrowDownToLine, ArrowUpToLine, RefreshCw, FileText, Wallet } from 'lucide-react'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useCurrency } from '@/context/CurrencyContext'

import { useDashboardStats } from '@/hooks/useDashboardStats'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { format } from 'date-fns'
import { useState } from 'react'
import { TransactionModal } from '@/components/ui/TransactionModal'

export function Dashboard() {
  const { formatAmount } = useCurrency()
  const { stats, chartData, isLoading, transactions } = useDashboardStats()
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader className="h-[200px] w-full rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          <SkeletonLoader className="h-20 w-full rounded-2xl" />
          <SkeletonLoader className="h-20 w-full rounded-2xl" />
          <SkeletonLoader className="h-20 w-full rounded-2xl" />
          <SkeletonLoader className="h-20 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  const recentTransactions = transactions.slice(0, 5)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 md:space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Hero Section */}
        <div className="md:col-span-8 space-y-6">
          <BalanceCard balance={stats?.balance || 0} monthlyGrowth={stats?.monthlyGrowth || 0} />

          <div className="grid grid-cols-4 gap-2 md:gap-4">
            <QuickActionButton onClick={() => setIsModalOpen(true)} icon={ArrowUpToLine} label="Income" colorClass="bg-emerald-500/20 text-emerald-500" />
            <QuickActionButton onClick={() => setIsModalOpen(true)} icon={ArrowDownToLine} label="Expense" colorClass="bg-red-500/20 text-red-500" />
            <QuickActionButton icon={RefreshCw} label="Transfer" colorClass="bg-blue-500/20 text-blue-500" />
            <QuickActionButton icon={FileText} label="Export" colorClass="bg-purple-500/20 text-purple-500" />
          </div>

          <GlassCard intensity="low" className="p-6">
            <h3 className="font-semibold mb-6">Cash Flow (Monthly)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.5 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.5 }} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Sidebar Widgets */}
        <div className="md:col-span-4 space-y-6">
          <HealthScoreCard score={85} />
          
          <GlassCard intensity="low" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Budget Overview</h3>
              <button className="text-primary text-sm font-medium hover:underline">See All</button>
            </div>
            <div className="space-y-4">
              <BudgetProgress category="Food & Dining" spent={450} limit={600} />
              <BudgetProgress category="Transport" spent={120} limit={200} />
              <BudgetProgress category="Shopping" spent={800} limit={500} />
            </div>
          </GlassCard>

          <GlassCard intensity="low" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Recent Transactions</h3>
            </div>
            <div className="space-y-4">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${tx.type === 'income' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.description || tx.category}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(tx.created_at), 'MMM d, h:mm a')}</p>
                    </div>
                  </div>
                  <span className={`font-medium text-sm ${tx.type === 'income' ? 'text-emerald-500' : 'text-foreground'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatAmount(Number(tx.amount))}
                  </span>
                </div>
              ))}
              {recentTransactions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No recent transactions</p>
              )}
            </div>
          </GlassCard>

        </div>
      </div>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </motion.div>
  )
}
