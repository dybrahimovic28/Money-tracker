import { useState } from 'react'
import { motion } from 'framer-motion'
import { useDebts } from '@/hooks/useDebts'
import { useAccounts } from '@/context/AccountContext'
import { useAuth } from '@/context/AuthContext'
import { GlassCard } from '@/components/ui/GlassCard'
import { StatCard } from '@/components/ui/StatCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, Plus, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { DebtType } from '@/types'
import { format } from 'date-fns'

export function Debts() {
  const { user } = useAuth()
  const { selectedAccountId } = useAccounts()
  const { debts, totalDebt, totalCredit, netPosition, overdueCount, saveDebt, updateDebt, deleteDebt } = useDebts()
  
  const [activeTab, setActiveTab] = useState<DebtType>('owe')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form State
  const [personName, setPersonName] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [reason, setReason] = useState('')
  const [dueDate, setDueDate] = useState('')

  const handleAddDebt = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (selectedAccountId === 'all') {
      toast.error('Select an account first.')
      return
    }

    setIsSubmitting(true)
    try {
      await saveDebt({
        user_id: user.id,
        account_id: selectedAccountId,
        type: activeTab,
        person_name: personName,
        amount: Number(amount),
        currency,
        reason,
        due_date: dueDate || null,
        status: 'Pending',
        auto_transaction: true
      })
      toast.success('Record created successfully')
      setIsModalOpen(false)
      // Reset form
      setPersonName('')
      setAmount('')
      setReason('')
      setDueDate('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create record')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const newStatus = activeTab === 'owe' ? 'Paid' : 'Received'
    if (currentStatus === newStatus) return

    try {
      await updateDebt({ id, updates: { status: newStatus } })
      toast.success(`Marked as ${newStatus}. Transactions may have been generated.`)
    } catch (error: any) {
      toast.error('Failed to update status')
    }
  }

  const filteredDebts = debts.filter(d => d.type === activeTab)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl mx-auto pb-12"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Debts & Credits</h1>
          <p className="text-muted-foreground mt-1">Manage money you owe and money owed to you</p>
        </div>
        
        <Button onClick={() => {
          if (selectedAccountId === 'all') {
            toast.error('Select an account first.')
            return
          }
          setIsModalOpen(true)
        }} className="rounded-xl shadow-lg shadow-primary/25">
          <Plus className="mr-2 h-4 w-4" />
          Add Record
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Total Debt" 
          amount={totalDebt} 
          icon={ArrowDownRight} 
          iconClassName="text-destructive"
        />
        <StatCard 
          title="Total Credit" 
          amount={totalCredit} 
          icon={ArrowUpRight} 
          iconClassName="text-emerald-500"
        />
        <StatCard 
          title="Net Position" 
          amount={netPosition} 
          icon={Users} 
          iconClassName="text-primary"
        />
        <StatCard 
          title="Overdue" 
          amount={overdueCount} 
          icon={AlertCircle} 
          iconClassName="text-orange-500"
        />
      </div>

      <div className="flex space-x-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('owe')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'owe' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}
        >
          MONEY I OWE
        </button>
        <button
          onClick={() => setActiveTab('owed_to_me')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'owed_to_me' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}
        >
          MONEY OWED TO ME
        </button>
      </div>

      <div className="space-y-4">
        {filteredDebts.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-white/10 rounded-2xl">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Records Found</h3>
            <p className="text-muted-foreground">You don't have any {activeTab === 'owe' ? 'debts' : 'credits'} tracked right now.</p>
          </div>
        ) : (
          filteredDebts.map(debt => (
            <GlassCard key={debt.id} intensity="low" className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${activeTab === 'owe' ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  {activeTab === 'owe' ? <ArrowDownRight className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
                </div>
                <div>
                  <h4 className="font-semibold">{debt.person_name}</h4>
                  <p className="text-sm text-muted-foreground">{debt.reason}</p>
                  {debt.due_date && <p className="text-xs text-muted-foreground mt-1">Due: {format(new Date(debt.due_date), 'MMM d, yyyy')}</p>}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end sm:space-x-6">
                <div className="text-right">
                  <span className="font-bold block">{new Intl.NumberFormat('en-US', { style: 'currency', currency: debt.currency }).format(debt.amount)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    debt.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-500' :
                    debt.status === 'Overdue' ? 'bg-red-500/20 text-red-500' :
                    'bg-emerald-500/20 text-emerald-500'
                  }`}>
                    {debt.status}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {debt.status === 'Pending' && (
                    <button 
                      onClick={() => handleStatusChange(debt.id, debt.status)}
                      title={`Mark as ${activeTab === 'owe' ? 'Paid' : 'Received'}`}
                      className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      if (window.confirm('Delete this record?')) deleteDebt(debt.id)
                    }}
                    className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold">Add {activeTab === 'owe' ? 'Debt' : 'Credit'} Record</h2>
            </div>
            
            <form onSubmit={handleAddDebt} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Person Name</label>
                <Input 
                  required 
                  value={personName} 
                  onChange={e => setPersonName(e.target.value)} 
                  placeholder="e.g. John"
                  className="bg-background/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Amount</label>
                  <Input 
                    required 
                    type="number"
                    step="0.01"
                    value={amount} 
                    onChange={e => setAmount(e.target.value)} 
                    placeholder="0.00"
                    className="bg-background/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Currency</label>
                  <select 
                    className="w-full h-10 px-3 rounded-md bg-background/50 border border-white/10 focus:ring-1 focus:ring-primary outline-none"
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="ZMW">ZMW</option>
                    <option value="ZAR">ZAR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Reason (Optional)</label>
                <Input 
                  value={reason} 
                  onChange={e => setReason(e.target.value)} 
                  placeholder="e.g. Rent, Dinner"
                  className="bg-background/50"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Due Date (Optional)</label>
                <Input 
                  type="date"
                  value={dueDate} 
                  onChange={e => setDueDate(e.target.value)} 
                  className="bg-background/50"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Record'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
