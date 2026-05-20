import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { debtService } from '@/services/debtService'
import { useAuth } from '@/context/AuthContext'
import { useAccounts } from '@/context/AccountContext'
import { Debt } from '@/types'
import { transactionService } from '@/services/transactionService'

export function useDebts() {
  const { user } = useAuth()
  const { selectedAccountId, accounts } = useAccounts()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['debts', user?.id, selectedAccountId],
    queryFn: () => debtService.getDebts(user!.id, selectedAccountId),
    enabled: !!user,
  })

  const saveMutation = useMutation({
    mutationFn: (debt: Omit<Debt, 'id' | 'created_at'>) => debtService.addDebt(debt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts', user?.id, selectedAccountId] })
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Debt> }) => {
      const oldDebt = query.data?.find(d => d.id === id)

      // Prevent negative balance
      if (oldDebt && oldDebt.status === 'Pending' && updates.status === 'Paid') {
        const accountId = oldDebt.account_id || selectedAccountId
        if (accountId) {
          const account = accounts.find(a => a.id === accountId)
          if (account && oldDebt.amount > account.current_balance) {
            throw new Error('Insufficient funds. Expense exceeds available balance.')
          }
        }
      }

      const updatedDebt = await debtService.updateDebt(id, user!.id, updates)

      // Automatic transaction generation on settlement (Debt Settlement Behavior)
      // Check if status changed from Pending to Paid/Received
      if (oldDebt && oldDebt.status === 'Pending' && updates.status) {
        if (updates.status === 'Paid' || updates.status === 'Received') {
          // If the debt was linked to a wallet, auto-create the transaction
          const accountId = oldDebt.account_id || updatedDebt.account_id
          if (accountId) {
            // "Paid" means Money I Owe was paid -> Expense
            // "Received" means Money Owed To Me was received -> Income
            const type = updates.status === 'Paid' ? 'expense' : 'income'
            const category = updates.status === 'Paid' ? 'Debt Payment' : 'Debt Collection'
            
            // Check if user has opted out via localStorage setting (optional toggle)
            const autoCreate = localStorage.getItem('auto_debt_transactions') !== 'false'
            if (autoCreate) {
              await transactionService.addTransaction({
                user_id: user!.id,
                account_id: accountId,
                type,
                amount: oldDebt.amount,
                currency: oldDebt.currency,
                category,
                description: `Settlement for: ${oldDebt.person_name} (${oldDebt.reason || ''})`,
                notes: 'Automatically generated from Debts module'
              })
              // Invalidate transactions so dashboard updates
              queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] })
            }
          }
        }
      }

      return updatedDebt
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts', user?.id, selectedAccountId] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => debtService.deleteDebt(id, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts', user?.id, selectedAccountId] })
    }
  })

  // Global metrics
  const totalDebt = query.data?.filter(d => d.type === 'owe' && d.status !== 'Paid').reduce((sum, d) => sum + Number(d.amount), 0) || 0
  const totalCredit = query.data?.filter(d => d.type === 'owed_to_me' && d.status !== 'Received').reduce((sum, d) => sum + Number(d.amount), 0) || 0
  const netPosition = totalCredit - totalDebt
  const overdueCount = query.data?.filter(d => d.status === 'Overdue').length || 0

  return {
    debts: query.data || [],
    isLoading: query.isLoading,
    totalDebt,
    totalCredit,
    netPosition,
    overdueCount,
    saveDebt: saveMutation.mutateAsync,
    updateDebt: updateMutation.mutateAsync,
    deleteDebt: deleteMutation.mutateAsync
  }
}
