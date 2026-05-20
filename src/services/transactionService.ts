import { supabase } from '@/lib/supabase'
import { Transaction } from '@/types'
import { saveTransactionOffline } from '@/lib/offline-sync'

export const transactionService = {
  async getTransactions(userId: string, accountId: string | null = null) {
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (accountId && accountId !== 'all') {
      query = query.eq('account_id', accountId)
    }

    const { data, error } = await query
    
    if (error) throw error
    return data as Transaction[]
  },

  async addTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>) {
    if (!navigator.onLine) {
      return await saveTransactionOffline(transaction)
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single()
    
    if (error) throw error
    return data as Transaction
  },

  async updateTransaction(id: string, updates: Partial<Transaction>) {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Transaction
  },

  async deleteTransaction(id: string) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return id
  },

  async resetTransactions(userId: string) {
    if (!navigator.onLine) {
      localStorage.removeItem(`transactions_${userId}`)
      return
    }
    const { error } = await supabase.from('transactions').delete().eq('user_id', userId)
    if (error) throw error
    localStorage.removeItem(`transactions_${userId}`)
  }
}
