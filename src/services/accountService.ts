import { supabase } from '@/lib/supabase'
import { Account } from '@/types'

export const accountService = {
  async getAccounts(userId: string) {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
      
      if (error) {
        // Fallback to local storage
        console.warn('Supabase fetch failed for accounts, falling back to local storage', error)
        return this.getLocalAccounts(userId)
      }
      
      // Update local cache
      localStorage.setItem(`accounts_${userId}`, JSON.stringify(data))
      return data as Account[]
    } catch (err) {
      console.warn('Network error, falling back to local storage', err)
      return this.getLocalAccounts(userId)
    }
  },

  getLocalAccounts(userId: string): Account[] {
    const cached = localStorage.getItem(`accounts_${userId}`)
    return cached ? JSON.parse(cached) : []
  },

  async addAccount(account: Omit<Account, 'id' | 'created_at' | 'current_balance'>) {
    const newAccountData = { ...account, current_balance: account.opening_balance }
    
    if (!navigator.onLine) {
      return this.saveAccountOffline(newAccountData)
    }

    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert([newAccountData])
        .select()
        .single()
      
      if (error) {
        console.warn('Supabase insert failed, saving to local storage fallback', error)
        return this.saveAccountOffline(newAccountData)
      }
      return data as Account
    } catch (err) {
      console.warn('Network error, saving to local storage fallback', err)
      return this.saveAccountOffline(newAccountData)
    }
  },

  saveAccountOffline(account: Omit<Account, 'id' | 'created_at'>) {
    const newAccount: Account = {
      ...account,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    }
    const accounts = this.getLocalAccounts(account.user_id)
    accounts.push(newAccount)
    localStorage.setItem(`accounts_${account.user_id}`, JSON.stringify(accounts))
    
    // add to sync queue
    const queueStr = localStorage.getItem('sync_queue_accounts') || '[]'
    const queue = JSON.parse(queueStr)
    queue.push({ action: 'create', data: newAccount })
    localStorage.setItem('sync_queue_accounts', JSON.stringify(queue))
    
    return newAccount
  },

  async updateAccount(id: string, userId: string, updates: Partial<Account>) {
    if (!navigator.onLine) {
      // offline update
      const accounts = this.getLocalAccounts(userId)
      const index = accounts.findIndex(a => a.id === id)
      if (index >= 0) {
        accounts[index] = { ...accounts[index], ...updates }
        localStorage.setItem(`accounts_${userId}`, JSON.stringify(accounts))
      }
      return accounts[index]
    }

    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Account
  },

  async deleteAccount(id: string, userId: string) {
    if (!navigator.onLine) {
      // Check offline records first
      const txs = JSON.parse(localStorage.getItem(`transactions_${userId}`) || '[]')
      const budgets = JSON.parse(localStorage.getItem(`budgets_${userId}`) || '[]')
      const goals = JSON.parse(localStorage.getItem(`savings_goals_${userId}`) || '[]')
      const debts = JSON.parse(localStorage.getItem(`debts_${userId}`) || '[]')
      
      const hasRecords = 
        txs.some((t: any) => t.account_id === id) ||
        budgets.some((b: any) => b.account_id === id) ||
        goals.some((g: any) => g.account_id === id) ||
        debts.some((d: any) => d.account_id === id)

      if (hasRecords) {
        throw new Error('Account contains records.')
      }

      const accounts = this.getLocalAccounts(userId)
      const filtered = accounts.filter(a => a.id !== id)
      localStorage.setItem(`accounts_${userId}`, JSON.stringify(filtered))
      return id
    }

    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id)
    
    if (error) {
      if (error.code === '23503') {
        throw new Error('Account contains records.')
      }
      throw error
    }
    return id
  },

  async resetAccounts(userId: string) {
    if (!navigator.onLine) {
      localStorage.removeItem(`accounts_${userId}`)
      return
    }
    const { error } = await supabase.from('accounts').delete().eq('user_id', userId)
    if (error) throw error
    localStorage.removeItem(`accounts_${userId}`)
  }
}
