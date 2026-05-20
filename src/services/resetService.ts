import { supabase } from '@/lib/supabase'
import { MonthlyResetLog } from '@/types'

const MONTHLY_RESET_CACHE_KEY = 'money-tracker-monthly-resets'

export const resetService = {
  async getLatestMonthlyReset(userId: string): Promise<MonthlyResetLog | null> {
    try {
      const { data, error } = await supabase
        .from('monthly_reset_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      if (error) {
        console.warn('Supabase fetch failed for monthly resets', error)
        return this.getLocalLatestMonthlyReset(userId)
      }
      
      if (data) {
        const cached = JSON.parse(localStorage.getItem(MONTHLY_RESET_CACHE_KEY) || '[]')
        const exists = cached.find((r: MonthlyResetLog) => r.id === data.id)
        if (!exists) {
          cached.push(data)
          localStorage.setItem(MONTHLY_RESET_CACHE_KEY, JSON.stringify(cached))
        }
      }
      return data as MonthlyResetLog | null
    } catch (err) {
      console.warn('Network error, falling back to local storage', err)
      return this.getLocalLatestMonthlyReset(userId)
    }
  },

  getLocalLatestMonthlyReset(userId: string): MonthlyResetLog | null {
    const cached = localStorage.getItem(MONTHLY_RESET_CACHE_KEY)
    if (!cached) return null
    const logs: MonthlyResetLog[] = JSON.parse(cached)
    const userLogs = logs.filter(l => l.user_id === userId)
    if (userLogs.length === 0) return null
    
    // Return latest
    return userLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
  },

  async triggerMonthlyReset(userId: string): Promise<MonthlyResetLog> {
    const now = new Date()
    const log: Omit<MonthlyResetLog, 'id' | 'created_at'> = {
      user_id: userId,
      month: now.getMonth() + 1,
      year: now.getFullYear()
    }

    if (!navigator.onLine) {
      return this.saveMonthlyResetOffline(log)
    }

    try {
      const { data, error } = await supabase
        .from('monthly_reset_logs')
        .insert([log])
        .select()
        .single()
      
      if (error) {
        console.warn('Supabase insert failed, saving to local storage fallback', error)
        return this.saveMonthlyResetOffline(log)
      }
      return data as MonthlyResetLog
    } catch (err) {
      console.warn('Network error, saving to local storage fallback', err)
      return this.saveMonthlyResetOffline(log)
    }
  },

  saveMonthlyResetOffline(log: Omit<MonthlyResetLog, 'id' | 'created_at'>) {
    const newLog: MonthlyResetLog = {
      ...log,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    }
    const cached = localStorage.getItem(MONTHLY_RESET_CACHE_KEY)
    const logs: MonthlyResetLog[] = cached ? JSON.parse(cached) : []
    logs.push(newLog)
    localStorage.setItem(MONTHLY_RESET_CACHE_KEY, JSON.stringify(logs))
    return newLog
  }
}
