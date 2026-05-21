import { supabase } from '@/lib/supabase'
import { Debt } from '@/types'
import { saveToSyncQueue } from '@/lib/offline-sync'

export const debtService = {
  async getDebts(userId: string, accountId: string | null = null) {
    try {
      let query = supabase
        .from('debts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (accountId && accountId !== 'all') {
        query = query.eq('account_id', accountId)
      }

      const { data, error } = await query
      
      if (error) {
        console.warn('Supabase fetch failed for debts, falling back to local storage', error)
        return this.getLocalDebts(userId, accountId)
      }
      
      localStorage.setItem(`debts_${userId}`, JSON.stringify(data))
      return data as Debt[]
    } catch (err) {
      console.warn('Network error, falling back to local storage', err)
      return this.getLocalDebts(userId, accountId)
    }
  },

  getLocalDebts(userId: string, accountId: string | null): Debt[] {
    const cached = localStorage.getItem(`debts_${userId}`)
    let debts: Debt[] = cached ? JSON.parse(cached) : []
    if (accountId && accountId !== 'all') {
      debts = debts.filter(d => d.account_id === accountId)
    }
    return debts
  },

  async addDebt(debt: Omit<Debt, 'id' | 'created_at'>) {
    if (!navigator.onLine) {
      return this.saveDebtOffline(debt)
    }

    try {
      const { data, error } = await supabase
        .from('debts')
        .insert([debt])
        .select()
        .single()
      
      if (error) {
        return this.saveDebtOffline(debt)
      }
      return data as Debt
    } catch (err) {
      return this.saveDebtOffline(debt)
    }
  },

  saveDebtOffline(debt: Omit<Debt, 'id' | 'created_at'>) {
    const newDebt: Debt = {
      ...debt,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    }
    const debts = this.getLocalDebts(debt.user_id, null)
    debts.unshift(newDebt)
    localStorage.setItem(`debts_${debt.user_id}`, JSON.stringify(debts))
    saveToSyncQueue({
      type: 'CREATE',
      table: 'debts',
      payload: newDebt,
      userId: debt.user_id
    })
    
    return newDebt
  },

  async updateDebt(id: string, userId: string, updates: Partial<Debt>) {
    if (!navigator.onLine) {
      const debts = this.getLocalDebts(userId, null)
      const index = debts.findIndex(d => d.id === id)
      if (index >= 0) {
        debts[index] = { ...debts[index], ...updates }
        localStorage.setItem(`debts_${userId}`, JSON.stringify(debts))
      }
      saveToSyncQueue({
        type: 'UPDATE',
        table: 'debts',
        payload: { ...updates, id },
        userId
      })
      return debts[index]
    }

    const { data, error } = await supabase
      .from('debts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Debt
  },

  async deleteDebt(id: string, userId: string) {
    if (!navigator.onLine) {
      const debts = this.getLocalDebts(userId, null)
      const filtered = debts.filter(d => d.id !== id)
      localStorage.setItem(`debts_${userId}`, JSON.stringify(filtered))
      saveToSyncQueue({
        type: 'DELETE',
        table: 'debts',
        payload: { id },
        userId
      })
      return id
    }

    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return id
  },

  async resetDebts(userId: string) {
    if (!navigator.onLine) {
      localStorage.removeItem(`debts_${userId}`)
      return
    }
    const { error } = await supabase.from('debts').delete().eq('user_id', userId)
    if (error) throw error
    localStorage.removeItem(`debts_${userId}`)
  }
}
