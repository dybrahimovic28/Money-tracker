import { Eye, EyeOff, TrendingUp, TrendingDown } from 'lucide-react'
import { useState } from 'react'
import CountUp from 'react-countup'
import { GlassCard } from './GlassCard'
import { useCurrency } from '@/context/CurrencyContext'

interface BalanceCardProps {
  balance: number
  monthlyGrowth?: number
  currencyCode?: string
  title?: string
}

const SafeCountUp = (CountUp as any).default || CountUp

export function BalanceCard({ balance, monthlyGrowth = 0, currencyCode, title = "Total Balance" }: BalanceCardProps) {
  const [showBalance, setShowBalance] = useState(true)

  const isPositive = monthlyGrowth >= 0

  const { formatCurrencyByAccount } = useCurrency()

  const formatWithCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode || formatCurrencyByAccount() }).format(val)
  }

  return (
    <GlassCard intensity="high" className="relative overflow-hidden text-white border-none glass-panel">
      {/* Decorative gradient orb */}
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/30 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative z-10 p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-white/80 uppercase tracking-wider">{title}</h2>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/80"
          >
            {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-end gap-4">
          <div className="text-4xl md:text-5xl font-bold tracking-tight">
            {showBalance ? (
              <SafeCountUp
                end={balance}
                duration={1.5}
                decimals={2}
                formattingFn={formatWithCurrency}
              />
            ) : (
              '••••••••'
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center space-x-2 text-sm">
          <span className={`flex items-center ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {Math.abs(monthlyGrowth)}%
          </span>
          <span className="text-white/60">vs last month</span>
        </div>
      </div>
    </GlassCard>
  )
}
