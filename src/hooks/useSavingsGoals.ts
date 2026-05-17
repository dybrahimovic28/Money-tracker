import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { goalService } from '@/services/goalService'
import { useAuth } from '@/context/AuthContext'
import { SavingsGoal } from '@/types'

export function useSavingsGoals() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['savings_goals', user?.id],
    queryFn: () => goalService.getGoals(user!.id),
    enabled: !!user,
  })

  const saveMutation = useMutation({
    mutationFn: (goal: Omit<SavingsGoal, 'id' | 'created_at'>) => goalService.saveGoal(goal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings_goals', user?.id] })
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<SavingsGoal> }) => goalService.updateGoal(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings_goals', user?.id] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => goalService.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings_goals', user?.id] })
    }
  })

  // Calculate global savings metrics
  const totalSavingsNeeded = query.data ? query.data.reduce((sum, g) => sum + Number(g.target_amount), 0) : 0
  const totalSavingsCurrent = query.data ? query.data.reduce((sum, g) => sum + Number(g.current_amount), 0) : 0

  return {
    goals: query.data || [],
    isLoading: query.isLoading,
    totalSavingsNeeded,
    totalSavingsCurrent,
    saveGoal: saveMutation.mutateAsync,
    updateGoal: updateMutation.mutateAsync,
    deleteGoal: deleteMutation.mutateAsync
  }
}
