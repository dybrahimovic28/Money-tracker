import { useCurrency } from '@/context/CurrencyContext'
import { ChevronDown } from 'lucide-react'

export function CurrencyBadge() {
  const { currency } = useCurrency()

  return (
    <button className="flex items-center space-x-2 rounded-full border border-border bg-card/50 px-3 py-1.5 text-sm font-medium glass hover:bg-card/80 transition-colors">
      <span className="opacity-80">
        {currency === 'USD' && '🇺🇸'}
        {currency === 'EUR' && '🇪🇺'}
        {currency === 'GBP' && '🇬🇧'}
        {currency === 'ZMW' && '🇿🇲'}
      </span>
      <span>{currency}</span>
      <ChevronDown className="h-3 w-3 text-muted-foreground" />
    </button>
  )
}
