import { useState, useEffect } from 'react'

export interface CustomCurrency {
  code: string
  name: string
  symbol: string
  isDefault?: boolean
}

export const DEFAULT_CURRENCIES: CustomCurrency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', isDefault: true },
  { code: 'EUR', name: 'Euro', symbol: '€', isDefault: true },
  { code: 'GBP', name: 'British Pound', symbol: '£', isDefault: true },
  { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK', isDefault: true },
]

export function useCustomCurrencies() {
  const [customCurrencies, setCustomCurrencies] = useState<CustomCurrency[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('custom_currencies')
    if (stored) {
      try {
        setCustomCurrencies(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse custom currencies', e)
      }
    }
  }, [])

  const addCustomCurrency = (currency: CustomCurrency) => {
    setCustomCurrencies(prev => {
      const updated = [...prev, { ...currency, isDefault: false }]
      localStorage.setItem('custom_currencies', JSON.stringify(updated))
      
      // Dispatch custom event to notify other instances of the hook
      window.dispatchEvent(new Event('customCurrenciesUpdated'))
      return updated
    })
  }

  const removeCustomCurrency = (code: string) => {
    setCustomCurrencies(prev => {
      const updated = prev.filter(c => c.code !== code)
      localStorage.setItem('custom_currencies', JSON.stringify(updated))
      
      window.dispatchEvent(new Event('customCurrenciesUpdated'))
      return updated
    })
  }

  // Listen for updates from other instances
  useEffect(() => {
    const handleUpdate = () => {
      const stored = localStorage.getItem('custom_currencies')
      if (stored) {
        try {
          setCustomCurrencies(JSON.parse(stored))
        } catch (e) {
          console.error(e)
        }
      } else {
        setCustomCurrencies([])
      }
    }
    
    window.addEventListener('customCurrenciesUpdated', handleUpdate)
    return () => window.removeEventListener('customCurrenciesUpdated', handleUpdate)
  }, [])

  const allCurrencies = [...DEFAULT_CURRENCIES, ...customCurrencies]

  return {
    customCurrencies,
    allCurrencies,
    addCustomCurrency,
    removeCustomCurrency
  }
}
