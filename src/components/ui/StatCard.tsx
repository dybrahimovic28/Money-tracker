import { LucideIcon } from 'lucide-react'
import { GlassCard } from './GlassCard'
import { useCurrency } from '@/context/CurrencyContext'

interface StatCardProps {
  title: string
  amount: number
  icon: LucideIcon
  trend?: number
  iconClassName?: string
}

export function StatCard({ title, amount, icon: Icon, trend, iconClassName }: StatCardProps) {
  const { formatAmount } = useCurrency()

  return (
    <GlassCard intensity="low" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className={`p-2 rounded-full bg-muted/50 ${iconClassName}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="text-2xl font-bold mb-1">{formatAmount(amount)}</div>
      {trend !== undefined && (
        <p className={`text-xs font-medium ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          {trend >= 0 ? '+' : ''}{trend}% from last month
        </p>
      )}
    </GlassCard>
  )
}
