import { supabase } from '@/lib/supabase'
import { SavingsGoal } from '@/types'

const GOALS_CACHE_KEY = 'money-tracker-savings-goals-cache'

export const goalService = {
  async getGoals(userId: string): Promise<SavingsGoal[]> {
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId)
      
      if (error) throw error
      
      localStorage.setItem(GOALS_CACHE_KEY, JSON.stringify(data))
      return data as SavingsGoal[]
    } catch (err) {
      console.warn('Failed to fetch savings goals from Supabase, falling back to local cache', err)
      const cached = localStorage.getItem(GOALS_CACHE_KEY)
      return cached ? JSON.parse(cached) : []
    }
  },

  async saveGoal(goal: Omit<SavingsGoal, 'id' | 'created_at'>): Promise<SavingsGoal> {
    const id = crypto.randomUUID()
    const newGoal = {
      ...goal,
      id,
      created_at: new Date().toISOString()
    } as SavingsGoal

    const cached = localStorage.getItem(GOALS_CACHE_KEY)
    const list: SavingsGoal[] = cached ? JSON.parse(cached) : []
    list.push(newGoal)
    localStorage.setItem(GOALS_CACHE_KEY, JSON.stringify(list))

    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .insert([goal])
        .select()
        .single()
      
      if (error) throw error
      return data as SavingsGoal
    } catch (err) {
      console.warn('Failed to save savings goal to Supabase, saved offline only', err)
      return newGoal
    }
  },

  async updateGoal(id: string, updates: Partial<SavingsGoal>): Promise<SavingsGoal> {
    const cached = localStorage.getItem(GOALS_CACHE_KEY)
    let updatedGoal: SavingsGoal | null = null
    if (cached) {
      const list: SavingsGoal[] = JSON.parse(cached)
      const index = list.findIndex(g => g.id === id)
      if (index > -1) {
        list[index] = { ...list[index], ...updates }
        updatedGoal = list[index]
        localStorage.setItem(GOALS_CACHE_KEY, JSON.stringify(list))
      }
    }

    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data as SavingsGoal
    } catch (err) {
      console.warn('Failed to update goal in Supabase, updated locally', err)
      if (updatedGoal) return updatedGoal
      throw err
    }
  },

  async deleteGoal(id: string): Promise<string> {
    const cached = localStorage.getItem(GOALS_CACHE_KEY)
    if (cached) {
      const list: SavingsGoal[] = JSON.parse(cached)
      const filtered = list.filter(g => g.id !== id)
      localStorage.setItem(GOALS_CACHE_KEY, JSON.stringify(filtered))
    }

    try {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    } catch (err) {
      console.warn('Failed to delete goal from Supabase, deleted locally', err)
    }
    return id
  }
}
