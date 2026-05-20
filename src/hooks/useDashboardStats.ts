import { useMemo } from 'react'
import { useTransactions } from './useTransactions'
import { dashboardService } from '@/services/dashboardService'
import { Transaction } from '@/types'

export function useDashboardStats() {
  const { transactions, activeTransactions, isLoading, isError } = useTransactions()

  const statsByCurrency = useMemo(() => {
    if (!activeTransactions.length) return {}
    
    const grouped = activeTransactions.reduce((acc, tx) => {
      const curr = tx.currency || 'USD'
      if (!acc[curr]) acc[curr] = []
      acc[curr].push(tx)
      return acc
    }, {} as Record<string, Transaction[]>)

    const result: Record<string, ReturnType<typeof dashboardService.calculateStats>> = {}
    for (const [curr, txs] of Object.entries(grouped)) {
      result[curr] = dashboardService.calculateStats(txs)
    }
    return result
  }, [transactions])

  const chartData = useMemo(() => {
    if (!activeTransactions.length) return []
    return dashboardService.calculateChartData(activeTransactions)
  }, [activeTransactions])

  return {
    transactions,
    activeTransactions,
    statsByCurrency,
    chartData,
    isLoading,
    isError
  }
}
