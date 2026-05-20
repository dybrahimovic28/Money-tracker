import { useMemo } from 'react'
import { useTransactions } from './useTransactions'
import { dashboardService } from '@/services/dashboardService'

export function useDashboardStats() {
  const { transactions, activeTransactions, isLoading, isError } = useTransactions()

  const stats = useMemo(() => {
    if (!activeTransactions.length) return dashboardService.calculateStats([])
    return dashboardService.calculateStats(activeTransactions)
  }, [activeTransactions])

  const chartData = useMemo(() => {
    if (!activeTransactions.length) return []
    return dashboardService.calculateChartData(activeTransactions)
  }, [activeTransactions])

  return {
    transactions,
    activeTransactions,
    stats,
    chartData,
    isLoading,
    isError
  }
}
