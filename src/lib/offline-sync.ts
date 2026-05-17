import { set, get, del, keys } from 'idb-keyval';
import { supabase } from './supabase';
import { Transaction } from '@/types';
import toast from 'react-hot-toast';
import { queryClient } from './queryClient';

const PENDING_PREFIX = 'pending_tx_';

export async function saveTransactionOffline(transaction: Omit<Transaction, 'id' | 'created_at'>) {
  const tempId = crypto.randomUUID();
  const offlineTx = {
    ...transaction,
    id: tempId,
    created_at: new Date().toISOString(),
    isPendingSync: true,
  };
  await set(`${PENDING_PREFIX}${tempId}`, offlineTx);
  
  toast('Saved offline. Will sync when connection returns.', { icon: '📡' });
  return offlineTx as unknown as Transaction;
}

export async function getPendingTransactions() {
  const allKeys = await keys();
  const pendingKeys = allKeys.filter(key => typeof key === 'string' && key.startsWith(PENDING_PREFIX));
  
  const transactions = [];
  for (const key of pendingKeys) {
    const tx = await get(key as string);
    if (tx) transactions.push(tx);
  }
  return transactions;
}

export async function syncOfflineTransactions(userId: string) {
  if (!navigator.onLine) return;

  const pendingTxs = await getPendingTransactions();
  if (pendingTxs.length === 0) return;

  // Filter transactions belonging to the current user
  const userPendingTxs = pendingTxs.filter(tx => tx.user_id === userId);
  if (userPendingTxs.length === 0) return;

  const cleanTxs = userPendingTxs.map(tx => {
    const { isPendingSync, id, ...rest } = tx;
    return rest; // Let Supabase assign the final ID
  });

  const { error } = await supabase.from('transactions').insert(cleanTxs);

  if (!error) {
    // Clear synced from idb
    for (const tx of userPendingTxs) {
      await del(`${PENDING_PREFIX}${tx.id}`);
    }
    
    toast.success(`Synced ${userPendingTxs.length} offline transactions`);
    queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
  } else {
    console.error('Offline sync failed', error);
  }
}

