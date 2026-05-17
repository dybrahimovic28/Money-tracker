import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Filter, ArrowDownToLine, ArrowUpToLine, MoreVertical, Edit, Trash2 } from 'lucide-react'
import { useCurrency } from '@/context/CurrencyContext'
import { useTransactions } from '@/hooks/useTransactions'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { format } from 'date-fns'
import { TransactionModal } from '@/components/ui/TransactionModal'
import { Transaction } from '@/types'

export function Transactions() {
  const { formatAmount } = useCurrency()
  const { transactions, isLoading, deleteTransaction } = useTransactions()
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const handleEdit = (tx: Transaction) => {
    setTransactionToEdit(tx)
    setIsModalOpen(true)
    setActiveMenu(null)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransaction(id)
    }
    setActiveMenu(null)
  }

  const filteredTransactions = transactions.filter(tx => {
    if (filterType !== 'all' && tx.type !== filterType) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const desc = tx.description?.toLowerCase() || ''
      const cat = tx.category.toLowerCase()
      if (!desc.includes(q) && !cat.includes(q)) return false
    }
    return true
  })

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search transactions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 bg-card/50 glass border-white/10" 
            />
          </div>
          <Button variant="outline" size="icon" className="glass border-white/10 shrink-0">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        <Button 
          variant={filterType === 'all' ? 'secondary' : 'ghost'} 
          className={`rounded-full px-6 ${filterType !== 'all' && 'bg-card/30'}`}
          onClick={() => setFilterType('all')}
        >
          All
        </Button>
        <Button 
          variant={filterType === 'income' ? 'secondary' : 'ghost'} 
          className={`rounded-full px-6 ${filterType !== 'income' && 'bg-card/30'}`}
          onClick={() => setFilterType('income')}
        >
          Income
        </Button>
        <Button 
          variant={filterType === 'expense' ? 'secondary' : 'ghost'} 
          className={`rounded-full px-6 ${filterType !== 'expense' && 'bg-card/30'}`}
          onClick={() => setFilterType('expense')}
        >
          Expense
        </Button>
      </div>

      <GlassCard intensity="low" className="p-0 overflow-hidden">
        <div className="divide-y divide-white/5">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <SkeletonLoader className="h-12 w-full rounded-xl" />
              <SkeletonLoader className="h-12 w-full rounded-xl" />
              <SkeletonLoader className="h-12 w-full rounded-xl" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No transactions found.
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div key={tx.id} className="p-4 sm:p-6 hover:bg-white/5 transition-colors group flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${tx.type === 'income' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                    {tx.type === 'income' ? <ArrowUpToLine className="h-5 w-5" /> : <ArrowDownToLine className="h-5 w-5" />}
                  </div>
                  <div>
                    <h4 className="font-semibold">{tx.description || tx.category}</h4>
                    <div className="flex items-center text-xs text-muted-foreground space-x-2 mt-1">
                      <span>{tx.category}</span>
                      <span>•</span>
                      <span>{format(new Date(tx.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`font-bold ${tx.type === 'income' ? 'text-emerald-500' : 'text-foreground'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatAmount(Number(tx.amount))}
                  </span>
                  
                  <div className="relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === tx.id ? null : tx.id)}
                      className="text-muted-foreground hover:text-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    
                    <AnimatePresence>
                      {activeMenu === tx.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 top-full mt-1 w-32 rounded-xl border border-white/10 bg-card/90 backdrop-blur-md shadow-lg overflow-hidden z-20"
                        >
                          <button 
                            onClick={() => handleEdit(tx)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 flex items-center"
                          >
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(tx.id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 flex items-center"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false)
          setTransactionToEdit(null)
        }} 
        transactionToEdit={transactionToEdit}
      />
    </motion.div>
  )
}
