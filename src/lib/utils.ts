import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currencyCode: string = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount)
  } catch (e) {
    // Fallback for custom currencies that Intl.NumberFormat doesn't support natively
    // Note: To show the actual symbol, we need to look it up. Since utils is a pure file, 
    // we'll attempt to pull from localStorage directly here for the fallback to keep it simple.
    let symbol = currencyCode
    try {
      const stored = localStorage.getItem('custom_currencies')
      if (stored) {
        const customCurrencies = JSON.parse(stored)
        const found = customCurrencies.find((c: any) => c.code === currencyCode)
        if (found) symbol = found.symbol
      }
    } catch (err) {}
    
    // Format the number part nicely
    const formattedNumber = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
    
    return `${symbol} ${formattedNumber}`
  }
}

export function formatNumber(amount: number) {
  return new Intl.NumberFormat('en-US').format(amount)
}
