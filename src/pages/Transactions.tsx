import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Filter, ArrowDownToLine, ArrowUpToLine, MoreVertical, Edit, Trash2, Calendar, LayoutGrid, Download, ListOrdered } from 'lucide-react'
import { useCurrency } from '@/context/CurrencyContext'
import { useTransactions } from '@/hooks/useTransactions'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { format } from 'date-fns'
import { TransactionModal } from '@/components/ui/TransactionModal'
import { Transaction } from '@/types'
import toast from 'react-hot-toast'

const ALL_CATEGORIES = [
  'Salary', 'Business', 'Freelance', 'Investments', 'Gifts',
  'Food', 'Transport', 'Bills', 'Shopping', 'Rent', 
  'Health', 'Education', 'Entertainment', 'Utilities', 'Other'
]

export function Transactions() {
  const { formatAmount } = useCurrency()
  const { transactions, isLoading, deleteTransaction } = useTransactions()
  
  // Filtering & Sorting State
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [dateRange, setDateRange] = useState<'all' | '7days' | '30days' | 'thismonth'>('all')
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Modals & Context Menus
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
      try {
        await deleteTransaction(id)
        toast.success('Transaction deleted')
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete transaction')
      }
    }
    setActiveMenu(null)
  }

  // Filter Logic
  const filteredTransactions = transactions.filter(tx => {
    // Type Filter
    if (filterType !== 'all' && tx.type !== filterType) return false
    
    // Category Filter
    if (filterCategory !== 'all' && tx.category !== filterCategory) return false

    // Search Query Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const desc = tx.description?.toLowerCase() || ''
      const notes = tx.notes?.toLowerCase() || ''
      const cat = tx.category.toLowerCase()
      if (!desc.includes(q) && !notes.includes(q) && !cat.includes(q)) return false
    }

    // Date Range Filter
    if (dateRange !== 'all') {
      const txDate = new Date(tx.created_at)
      const now = new Date()
      
      if (dateRange === '7days') {
        const diff = (now.getTime() - txDate.getTime()) / (1000 * 3600 * 24)
        if (diff > 7) return false
      } else if (dateRange === '30days') {
        const diff = (now.getTime() - txDate.getTime()) / (1000 * 3600 * 24)
        if (diff > 30) return false
      } else if (dateRange === 'thismonth') {
        if (txDate.getMonth() !== now.getMonth() || txDate.getFullYear() !== now.getFullYear()) return false
      }
    }

    return true
  })

  // Sorting Logic
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === 'date-desc') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    } else if (sortBy === 'date-asc') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    } else if (sortBy === 'amount-desc') {
      return b.amount - a.amount
    } else if (sortBy === 'amount-asc') {
      return a.amount - b.amount
    }
    return 0
  })

  // Export Filtered Set to CSV
  const handleExportCSV = () => {
    if (sortedTransactions.length === 0) {
      toast.error('No transactions available in current filter to export')
      return
    }
    
    const headers = ['ID', 'Type', 'Amount', 'Category', 'Description', 'Notes', 'Currency', 'Date']
    const rows = sortedTransactions.map(t => [
      t.id,
      t.type,
      t.amount,
      t.category,
      t.description || '',
      t.notes || '',
      t.currency,
      t.created_at
    ])
    
    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))].join('\n')
      
    const encodedUri = encodeURI(csvContent)
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', encodedUri)
    downloadAnchor.setAttribute('download', `money_tracker_filtered_export_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    toast.success('Successfully exported filtered transactions to CSV')
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search description / notes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 bg-card/50 glass border-white/10 rounded-xl" 
            />
          </div>
          <Button 
            variant={showFilters ? 'secondary' : 'outline'} 
            size="icon" 
            onClick={() => setShowFilters(!showFilters)}
            className="glass border-white/10 shrink-0 rounded-xl transition-all"
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleExportCSV}
            title="Export to CSV"
            className="glass border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 shrink-0 rounded-xl"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <GlassCard intensity="low" className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 border border-white/5">
              {/* Category Select */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground flex items-center">
                  <LayoutGrid className="w-3.5 h-3.5 mr-1" /> Category
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-background/50 border border-white/10 text-foreground text-sm focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="all">All Categories</option>
                  {ALL_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1" /> Date Range
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-background/50 border border-white/10 text-foreground text-sm focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="all">All Time</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="thismonth">This Month</option>
                </select>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground flex items-center">
                  <ListOrdered className="w-3.5 h-3.5 mr-1" /> Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-background/50 border border-white/10 text-foreground text-sm focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="amount-desc">Highest Amount</option>
                  <option value="amount-asc">Lowest Amount</option>
                </select>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        <Button 
          variant={filterType === 'all' ? 'secondary' : 'ghost'} 
          className={`rounded-full px-6 font-semibold ${filterType !== 'all' && 'bg-card/30'}`}
          onClick={() => setFilterType('all')}
        >
          All
        </Button>
        <Button 
          variant={filterType === 'income' ? 'secondary' : 'ghost'} 
          className={`rounded-full px-6 font-semibold ${filterType !== 'income' && 'bg-card/30'}`}
          onClick={() => setFilterType('income')}
        >
          Income
        </Button>
        <Button 
          variant={filterType === 'expense' ? 'secondary' : 'ghost'} 
          className={`rounded-full px-6 font-semibold ${filterType !== 'expense' && 'bg-card/30'}`}
          onClick={() => setFilterType('expense')}
        >
          Expense
        </Button>
      </div>

      {/* Transactions List */}
      <GlassCard intensity="low" className="p-0 overflow-hidden border border-white/5 shadow-xl">
        <div className="divide-y divide-white/5">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <SkeletonLoader className="h-12 w-full rounded-xl" />
              <SkeletonLoader className="h-12 w-full rounded-xl" />
              <SkeletonLoader className="h-12 w-full rounded-xl" />
            </div>
          ) : sortedTransactions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">
              No transactions matching selection.
            </div>
          ) : (
            sortedTransactions.map((tx) => (
              <div key={tx.id} className="p-4 sm:p-6 hover:bg-white/5 transition-colors group flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${tx.type === 'income' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                    {tx.type === 'income' ? <ArrowUpToLine className="h-5 w-5" /> : <ArrowDownToLine className="h-5 w-5" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{tx.description || tx.category}</h4>
                    <div className="flex flex-wrap items-center text-xs text-muted-foreground gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5">{tx.category}</span>
                      <span>•</span>
                      <span>{format(new Date(tx.created_at), 'MMM d, yyyy h:mm a')}</span>
                      {tx.notes && (
                        <>
                          <span>•</span>
                          <span className="italic truncate max-w-[200px]" title={tx.notes}>"{tx.notes}"</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`font-bold text-base ${tx.type === 'income' ? 'text-emerald-500' : 'text-foreground'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatAmount(Number(tx.amount))}
                  </span>
                  
                  <div className="relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === tx.id ? null : tx.id)}
                      className="text-muted-foreground hover:text-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-white/5"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    
                    <AnimatePresence>
                      {activeMenu === tx.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 top-full mt-1 w-32 rounded-xl border border-white/10 bg-card/95 backdrop-blur-md shadow-2xl overflow-hidden z-20"
                        >
                          <button 
                            onClick={() => handleEdit(tx)}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 flex items-center transition-colors"
                          >
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(tx.id)}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 flex items-center transition-colors border-t border-white/5"
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
