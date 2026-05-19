import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { budgetService } from '@/services/budgetService'
import { useAuth } from '@/context/AuthContext'
import { useTransactions } from './useTransactions'
import { Budget } from '@/types'
import { useAccounts } from '@/context/AccountContext'

export function useBudgets() {
  const { user } = useAuth()
  const { selectedAccountId } = useAccounts()
  const { transactions } = useTransactions()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['budgets', user?.id, selectedAccountId],
    queryFn: () => budgetService.getBudgets(user!.id, selectedAccountId),
    enabled: !!user,
  })

  const saveMutation = useMutation({
    mutationFn: (budget: Omit<Budget, 'id' | 'created_at'>) => budgetService.saveBudget(budget),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', user?.id, selectedAccountId] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => budgetService.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', user?.id, selectedAccountId] })
    }
  })

  // Calculate actual category spending for current month / year
  const budgetStats = query.data ? query.data.map(b => {
    const now = new Date()
    // budgets month column is 1-indexed (1-12) to match calendar representation
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    // Aggregate transactions for this category, month, and year
    const spent = transactions
      .filter(t => t.type === 'expense' && 
                   t.category.toLowerCase() === b.category.toLowerCase() &&
                   (new Date(t.created_at).getMonth() + 1) === currentMonth &&
                   new Date(t.created_at).getFullYear() === currentYear)
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const percent = b.amount_limit > 0 ? (spent / b.amount_limit) * 100 : 0

    return {
      ...b,
      spent,
      percent: Number(percent.toFixed(1)),
      warning: percent >= 80 && percent < 100,
      overspent: percent >= 100
    }
  }) : []

  return {
    budgets: query.data || [],
    budgetStats,
    isLoading: query.isLoading,
    saveBudget: saveMutation.mutateAsync,
    deleteBudget: deleteMutation.mutateAsync,
  }
}
