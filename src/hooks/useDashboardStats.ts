import { useMemo } from 'react'
import { useTransactions } from './useTransactions'
import { dashboardService } from '@/services/dashboardService'

export function useDashboardStats() {
  const { transactions, isLoading, isError } = useTransactions()

  const stats = useMemo(() => {
    if (!transactions.length) return null
    return dashboardService.calculateStats(transactions)
  }, [transactions])

  const chartData = useMemo(() => {
    if (!transactions.length) return []
    return dashboardService.calculateChartData(transactions)
  }, [transactions])

  return {
    transactions,
    stats,
    chartData,
    isLoading,
    isError
  }
}
