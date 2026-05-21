import { supabase } from '@/lib/supabase'
import { Budget } from '@/types'
import { saveToSyncQueue } from '@/lib/offline-sync'

const BUDGETS_CACHE_KEY = 'money-tracker-budgets-cache'

export const budgetService = {
  async getBudgets(userId: string, accountId: string | null = null): Promise<Budget[]> {
    try {
      let query = supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
      
      if (accountId && accountId !== 'all') {
        query = query.eq('account_id', accountId)
      }

      const { data, error } = await query
      
      if (error) throw error
      
      localStorage.setItem(BUDGETS_CACHE_KEY, JSON.stringify(data))
      return data as Budget[]
    } catch (err) {
      console.warn('Failed to fetch budgets from Supabase, falling back to local cache', err)
      const cached = localStorage.getItem(BUDGETS_CACHE_KEY)
      return cached ? JSON.parse(cached) : []
    }
  },

  async saveBudget(budget: Omit<Budget, 'id' | 'created_at'>): Promise<Budget> {
    const id = crypto.randomUUID()
    const newBudget = {
      ...budget,
      id,
      created_at: new Date().toISOString()
    } as Budget

    // Update local cache first
    const cached = localStorage.getItem(BUDGETS_CACHE_KEY)
    const list: Budget[] = cached ? JSON.parse(cached) : []
    
    // Check if budget for category/month/year already exists, overwrite it
    const existingIndex = list.findIndex(b => b.category === budget.category && b.month === budget.month && b.year === budget.year)
    if (existingIndex > -1) {
      list[existingIndex] = { ...list[existingIndex], amount_limit: budget.amount_limit }
    } else {
      list.push(newBudget)
    }
    localStorage.setItem(BUDGETS_CACHE_KEY, JSON.stringify(list))

    try {
      // Try to upsert in Supabase
      const { data, error } = await supabase
        .from('budgets')
        .upsert([
          {
            user_id: budget.user_id,
            account_id: budget.account_id,
            category: budget.category,
            amount_limit: budget.amount_limit,
            month: budget.month,
            year: budget.year
          }
        ])
        .select()
        .single()
      
      if (error) throw error
      return data as Budget
    } catch (err) {
      console.warn('Failed to save budget to Supabase, saved offline only', err)
      saveToSyncQueue({
        type: existingIndex > -1 ? 'UPDATE' : 'CREATE',
        table: 'budgets',
        payload: existingIndex > -1 ? { id: list[existingIndex].id, amount_limit: budget.amount_limit } : newBudget,
        userId: budget.user_id
      })
      return existingIndex > -1 ? list[existingIndex] : newBudget
    }
  },

  async deleteBudget(id: string): Promise<string> {
    const cached = localStorage.getItem(BUDGETS_CACHE_KEY)
    if (cached) {
      const list: Budget[] = JSON.parse(cached)
      const filtered = list.filter(b => b.id !== id)
      localStorage.setItem(BUDGETS_CACHE_KEY, JSON.stringify(filtered))
    }

    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    } catch (err) {
      console.warn('Failed to delete budget from Supabase, deleted locally', err)
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        saveToSyncQueue({
          type: 'DELETE',
          table: 'budgets',
          payload: { id },
          userId: session.user.id
        })
      }
    }
    return id
  },

  async resetBudgets(userId: string) {
    if (!navigator.onLine) {
      localStorage.removeItem(BUDGETS_CACHE_KEY)
      return
    }
    const { error } = await supabase.from('budgets').delete().eq('user_id', userId)
    if (error) throw error
    localStorage.removeItem(BUDGETS_CACHE_KEY)
  }
}
