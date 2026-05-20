import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAccounts } from '@/context/AccountContext'
import { useAuth } from '@/context/AuthContext'
import { accountService } from '@/services/accountService'
import { GlassCard } from '@/components/ui/GlassCard'
import { Wallet, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'
import { AccountType } from '@/types'

const ACCOUNT_TYPES: AccountType[] = ['Cash', 'Bank', 'Mobile Money', 'Savings', 'Business', 'Custom']
const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899']
const ICONS = ['💰', '🏦', '📱', '💳', '🏢', '💼', '🐖', '🪙', '📈', '🚀']

export function Accounts() {
  const { user } = useAuth()
  const { accounts, refreshAccounts, isLoading } = useAccounts()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [name, setName] = useState('')
  const [type, setType] = useState<AccountType>('Bank')
  const [currencyCode, setCurrencyCode] = useState('USD')
  const [openingBalance, setOpeningBalance] = useState('')
  const [color, setColor] = useState(COLORS[6])
  const [icon, setIcon] = useState(ICONS[1])

  useEffect(() => {
    // Only auto-open when user account count is exactly 0 and not loading
    if (!isLoading && accounts.length === 0) {
      const hasOpened = sessionStorage.getItem('hasAutoOpenedAccountModal')
      if (!hasOpened) {
        setIsModalOpen(true)
        sessionStorage.setItem('hasAutoOpenedAccountModal', 'true')
      }
    }
  }, [accounts.length, isLoading])

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (accounts.length >= 3) {
      toast.error('Maximum account limit reached (3).')
      return
    }

    setIsSubmitting(true)
    try {
      await accountService.addAccount({
        user_id: user.id,
        name,
        account_type: type,
        currency_code: currencyCode,
        opening_balance: Number(openingBalance) || 0,
        color,
        icon,
        is_primary: accounts.length === 0
      })
      toast.success('Account created successfully')
      setIsModalOpen(false)
      // Reset form
      setName('')
      setOpeningBalance('')
      setColor(COLORS[Math.floor(Math.random() * COLORS.length)])
      setIcon(ICONS[Math.floor(Math.random() * ICONS.length)])
      await refreshAccounts()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!user) return
    if (!window.confirm('Are you sure you want to delete this account? All associated transactions will be deleted!')) return
    
    try {
      await accountService.deleteAccount(id, user.id)
      toast.success('Account deleted')
      await refreshAccounts()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account')
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl mx-auto pb-12"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts & Wallets</h1>
          <p className="text-muted-foreground mt-1">Manage your multiple financial accounts</p>
        </div>
        
        {accounts.length < 3 && (
          <Button onClick={() => setIsModalOpen(true)} className="rounded-xl shadow-lg shadow-primary/25">
            <Plus className="mr-2 h-4 w-4" />
            Add Account ({accounts.length}/3)
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(acc => {
          // Calculate stats locally from local storage for offline fallback compatibility
          const txs = JSON.parse(localStorage.getItem(`transactions_${user?.id}`) || '[]')
          const debtsLocal = JSON.parse(localStorage.getItem(`debts_${user?.id}`) || '[]')
          
          const accountTxs = txs.filter((t: any) => t.account_id === acc.id || (!t.account_id && acc.is_primary))
          const income = accountTxs.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + Number(t.amount), 0)
          const expense = accountTxs.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + Number(t.amount), 0)
          
          const accountDebts = debtsLocal.filter((d: any) => d.account_id === acc.id)
          const debt = accountDebts.filter((d: any) => d.type === 'owe').reduce((sum: number, d: any) => sum + Number(d.amount), 0)
          const credit = accountDebts.filter((d: any) => d.type === 'owed_to_me').reduce((sum: number, d: any) => sum + Number(d.amount), 0)

          return (
            <GlassCard key={acc.id} intensity="high" className="p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                <button onClick={() => handleDelete(acc.id)} className="p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive hover:text-white transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-12 w-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center border border-primary/20" style={{ backgroundColor: acc.color ? `${acc.color}33` : undefined, color: acc.color || undefined, borderColor: acc.color ? `${acc.color}66` : undefined }}>
                  {acc.icon ? <span className="text-2xl">{acc.icon}</span> : <Wallet className="h-6 w-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold leading-tight">{acc.name}</h3>
                  <p className="text-sm text-muted-foreground">{acc.account_type} • {acc.currency_code}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-white/5 p-2 rounded-lg">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Income</p>
                  <p className="text-sm font-semibold text-emerald-400">{new Intl.NumberFormat('en-US', { style: 'currency', currency: acc.currency_code }).format(income)}</p>
                </div>
                <div className="bg-white/5 p-2 rounded-lg">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Expense</p>
                  <p className="text-sm font-semibold text-red-400">{new Intl.NumberFormat('en-US', { style: 'currency', currency: acc.currency_code }).format(expense)}</p>
                </div>
                <div className="bg-white/5 p-2 rounded-lg">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Debt</p>
                  <p className="text-sm font-semibold text-orange-400">{new Intl.NumberFormat('en-US', { style: 'currency', currency: acc.currency_code }).format(debt)}</p>
                </div>
                <div className="bg-white/5 p-2 rounded-lg">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Credit</p>
                  <p className="text-sm font-semibold text-blue-400">{new Intl.NumberFormat('en-US', { style: 'currency', currency: acc.currency_code }).format(credit)}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                <h4 className="text-2xl font-bold tracking-tight">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: acc.currency_code }).format(acc.current_balance)}
                </h4>
              </div>
            </GlassCard>
          )
        })}

        {accounts.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-white/10 rounded-2xl">
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Accounts Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Create your first wallet to start tracking your finances across multiple currencies.</p>
            <Button onClick={() => setIsModalOpen(true)}>Create Account</Button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold">Create New Account</h2>
            </div>
            
            <form onSubmit={handleAddAccount} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Account Name</label>
                <Input 
                  required 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="e.g. USD Wallet, Main Bank"
                  className="bg-background/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Type</label>
                  <select 
                    className="w-full h-10 px-3 rounded-md bg-background/50 border border-white/10 focus:ring-1 focus:ring-primary outline-none"
                    value={type}
                    onChange={e => setType(e.target.value as AccountType)}
                  >
                    {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Currency</label>
                  <select 
                    className="w-full h-10 px-3 rounded-md bg-background/50 border border-white/10 focus:ring-1 focus:ring-primary outline-none"
                    value={currencyCode}
                    onChange={e => setCurrencyCode(e.target.value)}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="ZMW">ZMW</option>
                    <option value="ZAR">ZAR</option>
                    <option value="BWP">BWP</option>
                    <option value="MWK">MWK</option>
                    <option value="NAD">NAD</option>
                    <option value="SZL">SZL</option>
                    <option value="MZN">MZN</option>
                    <option value="TZS">TZS</option>
                    <option value="KES">KES</option>
                    <option value="UGX">UGX</option>
                    <option value="RWF">RWF</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Opening Balance</label>
                <Input 
                  required 
                  type="number"
                  step="0.01"
                  value={openingBalance} 
                  onChange={e => setOpeningBalance(e.target.value)} 
                  placeholder="0.00"
                  className="bg-background/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-6 h-6 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {ICONS.map(i => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setIcon(i)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg transition-all ${icon === i ? 'bg-primary/20 ring-1 ring-primary' : 'bg-white/5 hover:bg-white/10'}`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Save Account'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
