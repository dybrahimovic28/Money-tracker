import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/hooks/useTheme'
import { useCurrency } from '@/context/CurrencyContext'
import { User, LogOut, Activity, Download, RefreshCw, Trash2, Info } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { queryClient } from '@/lib/queryClient'
import { syncOfflineTransactions } from '@/lib/offline-sync'
import { useTransactions } from '@/hooks/useTransactions'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import versionInfo from '../../public/version.json'

export function Settings() {
  const { user, signOut } = useAuth()
  const { mode, setTheme } = useTheme()
  const { currency, setCurrency } = useCurrency()
  const { profile, updateProfile } = useProfile()
  const { transactions } = useTransactions()

  const handleCurrencyChange = async (newCurrency: string) => {
    setCurrency(newCurrency)
    if (profile) {
      await updateProfile({ preferred_currency: newCurrency })
    }
  }

  const handleClearCache = () => {
    queryClient.clear()
    toast.success('Application cache successfully cleared')
  }

  const handleSyncNow = async () => {
    if (!user) return
    if (!navigator.onLine) {
      toast.error('Network is offline. Cannot sync right now.')
      return
    }
    toast.loading('Syncing pending transactions...', { id: 'sync' })
    try {
      await syncOfflineTransactions(user.id)
      toast.success('Sync complete!', { id: 'sync' })
    } catch (e: any) {
      toast.error(e.message || 'Sync failed', { id: 'sync' })
    }
  }

  const handleExportJSON = () => {
    if (transactions.length === 0) {
      toast.error('No transactions available to export')
      return
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(transactions, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `money_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    toast.success('Backup JSON successfully generated')
  }

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error('No transactions available to export')
      return
    }
    const headers = ['ID', 'Type', 'Amount', 'Category', 'Description', 'Currency', 'Date']
    const rows = transactions.map(t => [
      t.id,
      t.type,
      t.amount,
      t.category,
      t.description || '',
      t.currency,
      t.created_at
    ])
    
    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n')
      
    const encodedUri = encodeURI(csvContent)
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', encodedUri)
    downloadAnchor.setAttribute('download', `money_tracker_export_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    toast.success('CSV Report successfully generated')
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto pb-12"
    >
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Settings Navigation (Desktop) */}
        <div className="hidden md:block col-span-1 space-y-1">
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-medium text-left">
            <User className="h-5 w-5" />
            <span>Profile & System</span>
          </button>
          <Link to="/diagnostics" className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-foreground font-medium transition-colors">
            <Activity className="h-5 w-5" />
            <span>Diagnostics</span>
          </Link>
        </div>

        {/* Settings Content */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <GlassCard intensity="low" className="p-6 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 rounded-full border-2 border-primary/20 bg-muted overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'default'}&backgroundColor=transparent`} alt="Avatar" />
              </div>
              <div>
                <h3 className="text-lg font-medium">{profile?.full_name || profile?.email || user?.email}</h3>
                <p className="text-sm text-muted-foreground">{profile?.role === 'admin' ? 'Admin Plan' : 'Free Plan'}</p>
              </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Theme Mode</h4>
              <div className="grid grid-cols-3 gap-4">
                <button 
                  onClick={() => setTheme({ mode: 'light' })}
                  className={`p-4 rounded-xl border transition-colors ${mode === 'light' ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/20'}`}
                >
                  Light
                </button>
                <button 
                  onClick={() => setTheme({ mode: 'dark' })}
                  className={`p-4 rounded-xl border transition-colors ${mode === 'dark' ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/20'}`}
                >
                  Dark
                </button>
                <button 
                  onClick={() => setTheme({ mode: 'system' })}
                  className={`p-4 rounded-xl border transition-colors ${mode === 'system' ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/20'}`}
                >
                  System
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Base Currency</h4>
              <select 
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full p-3 rounded-xl bg-background border border-white/10 text-foreground focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="ZMW">ZMW - Zambian Kwacha</option>
              </select>
            </div>

            {/* System Actions */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">System Operations</h4>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleSyncNow}
                  className="flex items-center justify-center space-x-2 p-3 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-medium transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Sync Queue</span>
                </button>
                <button 
                  onClick={handleClearCache}
                  className="flex items-center justify-center space-x-2 p-3 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-medium text-orange-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear Cache</span>
                </button>
              </div>
            </div>

            {/* Data Export & Backup */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Data Backups</h4>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleExportJSON}
                  className="flex items-center justify-center space-x-2 p-3 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-medium transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Backup JSON</span>
                </button>
                <button 
                  onClick={handleExportCSV}
                  className="flex items-center justify-center space-x-2 p-3 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-medium transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Diagnostics Link (Mobile) */}
            <div className="pt-4 border-t border-white/5 md:hidden">
              <Link 
                to="/diagnostics"
                className="flex items-center space-x-2 text-primary font-medium hover:underline text-sm"
              >
                <Activity className="h-5 w-5" />
                <span>Open System Diagnostics</span>
              </Link>
            </div>

            <div className="pt-6 border-t border-white/5">
              <button 
                onClick={signOut}
                className="flex items-center space-x-2 text-red-500 font-medium hover:text-red-400 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out Everywhere</span>
              </button>
            </div>
          </GlassCard>

          {/* About Section */}
          <GlassCard intensity="low" className="p-6 space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center">
              <Info className="h-4 w-4 mr-2 text-primary" /> About Money Tracker
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span>{versionInfo.version} (Build #{versionInfo.buildNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">License</span>
                <span>{versionInfo.license}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Developer</span>
                <span>{versionInfo.developer}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pt-2">
                {versionInfo.releaseNotes}
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  )
}
