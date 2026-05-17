import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionService } from '@/services/transactionService'
import { useAuth } from '@/context/AuthContext'
import { Transaction } from '@/types'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useTransactions() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Realtime subscription setup
  useEffect(() => {
    if (!user) return

    // Sync any offline transactions when we initialize
    import('@/lib/offline-sync').then(({ syncOfflineTransactions }) => {
      syncOfflineTransactions(user.id)
    })

    const handleOnline = () => {
      import('@/lib/offline-sync').then(({ syncOfflineTransactions }) => {
        syncOfflineTransactions(user.id)
      })
    }
    window.addEventListener('online', handleOnline)

    const channelId = Math.random().toString(36).substring(2, 9)
    const channel = supabase
      .channel(`schema-db-changes-${user.id}-${channelId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['transactions', user.id] })
        }
      )
      .subscribe()

    return () => {
      window.removeEventListener('online', handleOnline)
      supabase.removeChannel(channel)
    }
  }, [user, queryClient])

  const query = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: () => transactionService.getTransactions(user!.id),
    enabled: !!user,
  })

  const addMutation = useMutation({
    mutationFn: (newTx: Omit<Transaction, 'id' | 'created_at'>) => transactionService.addTransaction(newTx),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Transaction> }) => transactionService.updateTransaction(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionService.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] })
    },
  })

  return {
    transactions: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    addTransaction: addMutation.mutateAsync,
    updateTransaction: updateMutation.mutateAsync,
    deleteTransaction: deleteMutation.mutateAsync,
    isAdding: addMutation.isPending,
  }
}
