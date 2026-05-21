import { set, get } from 'idb-keyval';
import { supabase } from './supabase';
import toast from 'react-hot-toast';
import { queryClient } from './queryClient';
import { Transaction } from '@/types';

export type SyncActionType = 'CREATE' | 'UPDATE' | 'DELETE';
export type SyncTable = 'transactions' | 'accounts' | 'budgets' | 'debts';

export interface SyncAction {
  id: string;
  timestamp: number;
  type: SyncActionType;
  table: SyncTable;
  payload: any;
  userId: string;
}

const QUEUE_KEY = 'offline_sync_queue';

export async function getSyncQueue(): Promise<SyncAction[]> {
  const queue = await get(QUEUE_KEY);
  return queue ? (JSON.parse(queue) as SyncAction[]) : [];
}

export async function saveToSyncQueue(action: Omit<SyncAction, 'id' | 'timestamp'>) {
  const queue = await getSyncQueue();
  const newAction: SyncAction = {
    ...action,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  
  queue.push(newAction);
  await set(QUEUE_KEY, JSON.stringify(queue));
  toast('Saved offline. Will sync when connection returns.', { icon: '📡' });
}

// Deprecated signature, updating to queue
export async function saveTransactionOffline(transaction: Omit<Transaction, 'id' | 'created_at'>) {
  const tempId = crypto.randomUUID();
  const offlineTx = {
    ...transaction,
    id: tempId,
    created_at: new Date().toISOString(),
    isPendingSync: true,
  };
  
  await saveToSyncQueue({
    type: 'CREATE',
    table: 'transactions',
    payload: offlineTx,
    userId: transaction.user_id
  });

  return offlineTx as unknown as Transaction;
}

// Replaces the old syncOfflineTransactions logic
export async function syncOfflineTransactions(userId: string) {
  if (!navigator.onLine) return;

  const queue = await getSyncQueue();
  if (queue.length === 0) return;

  // Filter actions for this user
  const userActions = queue.filter(a => a.userId === userId);
  const otherActions = queue.filter(a => a.userId !== userId);

  if (userActions.length === 0) return;

  let successCount = 0;
  const failedActions: SyncAction[] = [];

  for (const action of userActions) {
    try {
      const { type, table, payload } = action;
      let error = null;

      const cleanPayload = { ...payload };
      delete cleanPayload.isPendingSync;

      if (type === 'CREATE') {
        const { error: err } = await supabase.from(table).insert(cleanPayload);
        error = err;
      } else if (type === 'UPDATE') {
        const { error: err } = await supabase.from(table).update(cleanPayload).eq('id', cleanPayload.id);
        error = err;
      } else if (type === 'DELETE') {
        const { error: err } = await supabase.from(table).delete().eq('id', cleanPayload.id);
        error = err;
      }

      if (error) {
        console.error(`Failed to process action ${action.id}:`, error);
        failedActions.push(action);
      } else {
        successCount++;
      }
    } catch (err) {
      console.error(`Exception processing action ${action.id}:`, err);
      failedActions.push(action);
    }
  }

  // Save back failed + other users' actions
  await set(QUEUE_KEY, JSON.stringify([...otherActions, ...failedActions]));

  if (successCount > 0) {
    toast.success(`Synced ${successCount} offline actions`);
    queryClient.invalidateQueries();
  }
}
