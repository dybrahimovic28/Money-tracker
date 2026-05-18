import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/button'
import { useTransactions } from '@/hooks/useTransactions'
import { useCurrency } from '@/context/CurrencyContext'

import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { EmptyState } from '@/components/ui/EmptyState'
import { format } from 'date-fns'
import { Calendar, Filter, Sparkles, Sheet } from 'lucide-react'
import toast from 'react-hot-toast'


export function Reports() {

  const { formatAmount } = useCurrency()
  const { transactions, isLoading } = useTransactions()

  // Selectors State
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()) // 0-11
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const yearsList = useMemo(() => {
    const list = new Set<number>()
    list.add(new Date().getFullYear())
    transactions.forEach(t => {
      list.add(new Date(t.created_at).getFullYear())
    })
    return Array.from(list).sort((a, b) => b - a)
  }, [transactions])

  const categoriesList = useMemo(() => {
    const list = new Set<string>()
    transactions.forEach(t => list.add(t.category))
    return Array.from(list)
  }, [transactions])

  // Filtered transactions for the report
  const reportTransactions = useMemo(() => {
    return transactions.filter(t => {
      const txDate = new Date(t.created_at)
      const monthMatch = txDate.getMonth() === selectedMonth
      const yearMatch = txDate.getFullYear() === selectedYear
      const categoryMatch = filterCategory === 'all' || t.category === filterCategory
      return monthMatch && yearMatch && categoryMatch
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [transactions, selectedMonth, selectedYear, filterCategory])

  // Aggregate Metrics
  const summary = useMemo(() => {
    let income = 0
    let expenses = 0
    reportTransactions.forEach(t => {
      const amt = Number(t.amount)
      if (t.type === 'income') {
        income += amt
      } else {
        expenses += amt
      }
    })
    return {
      income,
      expenses,
      net: income - expenses,
      count: reportTransactions.length
    }
  }, [reportTransactions])

  // Export to CSV
  const handleExportCSV = () => {
    if (reportTransactions.length === 0) {
      toast.error('No transactions available in selected period to export')
      return
    }

    const headers = ['Date', 'Type', 'Category', 'Description', 'Notes', 'Amount', 'Currency']
    const rows = reportTransactions.map(t => [
      format(new Date(t.created_at), 'yyyy-MM-dd HH:mm'),
      t.type.toUpperCase(),
      t.category,
      t.description || '',
      t.notes || '',
      t.amount,
      t.currency
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))].join('\n')
      
    const encodedUri = encodeURI(csvContent)
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', encodedUri)
    downloadAnchor.setAttribute('download', `money_tracker_statement_${selectedYear}_${selectedMonth + 1}.csv`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    toast.success('Successfully downloaded CSV financial statement')
  }


  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader className="h-[150px] w-full rounded-2xl" />
        <SkeletonLoader className="h-[300px] w-full rounded-2xl" />
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <EmptyState 
          icon={Sheet}
          title="Reporting Engine Idle"
          description="We need transactional details to generate period statements and export Excel financial reports!"
        />
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Statements</h1>
        <p className="text-sm text-muted-foreground mt-1">Select periodic parameters, preview balances, and export Excel statements.</p>
      </div>

      {/* Selector Filters Grid */}
      <GlassCard intensity="low" className="p-5 border border-white/5 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
        
        {/* Month Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1" /> Statement Month
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="w-full p-2.5 rounded-xl bg-background/50 border border-white/10 text-foreground text-sm focus:ring-1 focus:ring-primary outline-none"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i}>
                {format(new Date(2026, i, 1), 'MMMM')}
              </option>
            ))}
          </select>
        </div>

        {/* Year Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1" /> Statement Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full p-2.5 rounded-xl bg-background/50 border border-white/10 text-foreground text-sm focus:ring-1 focus:ring-primary outline-none"
          >
            {yearsList.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Optional Category Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1" /> Filter Category
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-background/50 border border-white/10 text-foreground text-sm focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="all">All Categories</option>
            {categoriesList.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-end justify-start sm:justify-end gap-2 sm:col-span-3 md:col-span-1">
          <Button 
            onClick={handleExportCSV} 
            className="rounded-xl flex items-center gap-1.5 w-full sm:w-auto font-bold bg-primary hover:bg-primary/95 text-white"
          >
            <Sheet className="w-4 h-4" /> Excel Statement
          </Button>
        </div>
      </GlassCard>

      {/* Statement Preview Invoice Panel */}
      <GlassCard intensity="low" className="p-0 border border-white/5 overflow-hidden shadow-2xl relative">
        <div className="bg-primary/20 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground flex items-center">
              <Sparkles className="w-4.5 h-4.5 text-primary mr-1.5" /> 
              {format(new Date(selectedYear, selectedMonth), 'MMMM yyyy')} Statement Preview
            </h3>
            <p className="text-xs text-muted-foreground">Dynamic billing-style invoice compile checking.</p>
          </div>
          
          <div className="text-xs text-muted-foreground text-left md:text-right">
            <span className="font-semibold text-foreground">{reportTransactions.length}</span> recorded transactions in filter
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary Box widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <span className="text-[10px] font-bold text-emerald-400">TOTAL PERIOD INCOME</span>
              <h4 className="text-xl font-extrabold text-emerald-500 mt-1">{formatAmount(summary.income)}</h4>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
              <span className="text-[10px] font-bold text-red-400">TOTAL PERIOD EXPENSES</span>
              <h4 className="text-xl font-extrabold text-red-400 mt-1">{formatAmount(summary.expenses)}</h4>
            </div>

            <div className={`p-4 rounded-xl border ${summary.net >= 0 ? 'bg-primary/5 border-primary/10' : 'bg-orange-500/5 border-orange-500/10'}`}>
              <span className={`text-[10px] font-bold ${summary.net >= 0 ? 'text-primary' : 'text-orange-400'}`}>NET CASHFLOW DELTA</span>
              <h4 className={`text-xl font-extrabold mt-1 ${summary.net >= 0 ? 'text-primary' : 'text-orange-400'}`}>{formatAmount(summary.net)}</h4>
            </div>
          </div>

          {/* List of preview transactions */}
          <div className="divide-y divide-white/5 border-t border-white/5 pt-4">
            {reportTransactions.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">No transactions found for selected Month/Year/Category parameters.</p>
            ) : (
              reportTransactions.map(tx => (
                <div key={tx.id} className="py-3 flex justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground">{tx.description || tx.category}</span>
                    <p className="text-[10px] text-muted-foreground">
                      {tx.category} • {format(new Date(tx.created_at), 'yyyy-MM-dd')}
                    </p>
                  </div>
                  <span className={`font-bold ${tx.type === 'income' ? 'text-emerald-500' : 'text-foreground'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
