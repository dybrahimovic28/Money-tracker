import { GlassCard } from './GlassCard'
import { useCurrency } from '@/context/CurrencyContext'

interface BudgetProgressProps {
  category: string
  spent: number
  limit: number
}

export function BudgetProgress({ category, spent, limit }: BudgetProgressProps) {
  const { formatAmount } = useCurrency()
  const percentage = Math.min((spent / limit) * 100, 100)
  
  let color = 'bg-primary'
  if (percentage >= 90) color = 'bg-red-500'
  else if (percentage >= 75) color = 'bg-orange-500'

  return (
    <GlassCard intensity="low" className="p-4">
      <div className="flex justify-between items-end mb-2">
        <span className="font-medium text-sm">{category}</span>
        <div className="text-xs text-muted-foreground">
          <span className={percentage >= 90 ? 'text-red-500 font-medium' : 'text-foreground'}>
            {formatAmount(spent)}
          </span>
          {' '}of {formatAmount(limit)}
        </div>
      </div>
      <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </GlassCard>
  )
}
