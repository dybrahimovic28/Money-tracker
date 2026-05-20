import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/hooks/useTheme'
import { useCurrency } from '@/context/CurrencyContext'
import { LogOut, RefreshCw, Trash2, Info } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { queryClient } from '@/lib/queryClient'
import { syncOfflineTransactions } from '@/lib/offline-sync'
import toast from 'react-hot-toast'
import versionInfo from '../../public/version.json'

export function Settings() {
  const { user, signOut } = useAuth()
  const { mode, setTheme } = useTheme()
  const { currency, setCurrency, formatCurrencyByAccount } = useCurrency()
  const { profile, updateProfile } = useProfile()


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



  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto pb-12"
    >
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <div className="grid grid-cols-1 gap-6">
        {/* Settings Content */}
        <div className="space-y-6">
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

            <div className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Financial Target</h4>
              <div>
                <label className="text-sm block mb-1">Target Monthly Income</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground font-medium">
                    {formatCurrencyByAccount() === 'USD' ? '$' : formatCurrencyByAccount()}
                  </span>
                  <input 
                    type="number"
                    value={profile?.target_monthly_income || localStorage.getItem('target_monthly_income') || ''}
                    onChange={(e) => {
                      const val = e.target.value
                      localStorage.setItem('target_monthly_income', val)
                      if (profile) {
                        updateProfile({ target_monthly_income: Number(val) })
                      }
                    }}
                    className="w-full p-3 pl-12 rounded-xl bg-background border border-white/10 text-foreground focus:ring-1 focus:ring-primary outline-none"
                    placeholder="e.g. 5000"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Used to calculate your monthly progress on the dashboard.</p>
              </div>
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
