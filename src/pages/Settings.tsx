import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/hooks/useTheme'
import { useCurrency } from '@/context/CurrencyContext'
import { LogOut, RefreshCw, Trash2, Info, ChevronDown, Plus, User } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { useCustomCurrencies } from '@/hooks/useCustomCurrencies'
import { CustomCurrencyModal } from '@/components/ui/CustomCurrencyModal'
import { queryClient } from '@/lib/queryClient'
import { syncOfflineTransactions } from '@/lib/offline-sync'
import toast from 'react-hot-toast'
import versionInfo from '../../public/version.json'
import { ResetDataModal, ResetType } from '@/components/ui/ResetDataModal'
import { useAccounts } from '@/context/AccountContext'
import { DeleteAccountModal } from '@/components/ui/DeleteAccountModal'
import { AccountModal } from '@/components/ui/AccountModal'
import { Account } from '@/types'
import { useState, useRef } from 'react'
import { budgetService } from '@/services/budgetService'
import { debtService } from '@/services/debtService'
import { accountService } from '@/services/accountService'
import { transactionService } from '@/services/transactionService'

export function Settings() {
  const { user, signOut } = useAuth()
  const { mode, setTheme } = useTheme()
  const { currency, setCurrency } = useCurrency()
  const { profile, updateProfile } = useProfile()
  const { allCurrencies, removeCustomCurrency } = useCustomCurrencies()
  const { accounts, refreshAccounts, selectedAccountId, setSelectedAccountId } = useAccounts()
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [resetType, setResetType] = useState<ResetType>('Factory')
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false)
  const [isCustomCurrencyModalOpen, setIsCustomCurrencyModalOpen] = useState(false)
  const [accountToEdit, setAccountToEdit] = useState<Account | undefined>(undefined)
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<Account | undefined>(undefined)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const undoTimeoutRef = useRef<number | null>(null)
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

  const handleOpenReset = (type: ResetType) => {
    setResetType(type)
    setResetModalOpen(true)
  }

  const executeReset = async (type: ResetType) => {
    if (!user) return
    try {
      if (type === 'Factory') {
        await transactionService.resetTransactions(user.id)
        await budgetService.resetBudgets(user.id)
        await debtService.resetDebts(user.id)
        await accountService.resetAccounts(user.id)
        localStorage.clear()
        window.location.reload()
        return
      }
      queryClient.clear()
      toast.success(`${type} reset completed successfully.`)
      window.location.reload()
    } catch (err) {
      toast.error('Failed to reset data.')
      console.error(err)
    }
  }

  const handleConfirmReset = (type: ResetType) => {
    toast((t) => (
      <div className="flex items-center space-x-4">
        <span>Data cleared — Undo available (10 seconds)</span>
        <button 
          onClick={() => {
            if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current)
            toast.dismiss(t.id)
            toast.success('Reset cancelled')
          }}
          className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-md text-sm font-medium transition-colors"
        >
          Undo
        </button>
      </div>
    ), { duration: 10000, id: 'undo-toast' })

    undoTimeoutRef.current = window.setTimeout(() => {
      executeReset(type)
    }, 10000)
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
              <div className="h-20 w-20 flex items-center justify-center rounded-full border-2 border-primary/20 bg-muted overflow-hidden">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-medium">{profile?.full_name || profile?.email || user?.email}</h3>
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
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-background border border-white/10 text-foreground focus:ring-1 focus:ring-primary outline-none hover:bg-white/5 transition-colors"
                >
                  <span className="font-medium">
                    {allCurrencies.find(c => c.code === currency)?.code} - {allCurrencies.find(c => c.code === currency)?.name}
                  </span>
                  <motion.div animate={{ rotate: isCurrencyDropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isCurrencyDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-2 bg-card border border-white/10 rounded-xl overflow-hidden backdrop-blur-md"
                    >
                      <div className="py-1 max-h-60 overflow-y-auto">
                        {allCurrencies.map(c => (
                          <div
                            key={c.code}
                            className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors group ${currency === c.code ? 'bg-primary/10 text-primary' : 'hover:bg-white/5 text-foreground'}`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                handleCurrencyChange(c.code)
                                setIsCurrencyDropdownOpen(false)
                              }}
                              className="flex-1 text-left flex items-center"
                            >
                              <span className="font-medium mr-2">{c.code}</span>
                              <span className="text-muted-foreground truncate">- {c.name}</span>
                            </button>
                            
                            {!c.isDefault && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeCustomCurrency(c.code)
                                  if (currency === c.code) {
                                    handleCurrencyChange('USD') // Reset to default if deleted
                                  }
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-all"
                                title="Delete Custom Currency"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <div className="border-t border-white/5 mt-1 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setIsCurrencyDropdownOpen(false)
                              setIsCustomCurrencyModalOpen(true)
                            }}
                            className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
                          >
                            <Plus className="h-4 w-4 mr-2" /> Add Custom Currency
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Financial Target</h4>
              <div>
                <label className="text-sm block mb-1">Target Monthly Income</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground font-medium">
                    {allCurrencies.find(c => c.code === currency)?.symbol || '$'}
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

            {/* Account Management Section */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Account Management</h4>
              {accounts.length === 0 ? (
                <div className="bg-background/50 border border-white/10 rounded-xl p-6 text-center">
                  <p className="text-muted-foreground mb-4">No accounts created</p>
                  <button 
                    onClick={() => {
                      setAccountToEdit(undefined)
                      setIsAccountModalOpen(true)
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm transition-colors hover:bg-primary/90"
                  >
                    + Create Account
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {accounts.map(account => (
                    <div key={account.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-background/50 border border-white/10 rounded-xl gap-4">
                      <div>
                        <h5 className="font-semibold">{account.name}</h5>
                        <p className="text-sm text-muted-foreground">{account.currency_code}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setAccountToEdit(account)
                            setIsAccountModalOpen(true)
                          }}
                          className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-sm font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setAccountToDelete(account)
                            setIsDeleteModalOpen(true)
                          }}
                          className="px-3 py-1.5 rounded-lg border border-destructive/20 text-destructive hover:bg-destructive/10 text-sm font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

            {/* Data Management Section */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Data Management</h4>
              <p className="text-xs text-muted-foreground mb-4">Manage your data securely. These actions range from soft resets to complete account deletion.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <button 
                  onClick={() => handleOpenReset('Factory')}
                  className="flex flex-col items-start p-4 rounded-xl border border-rose-600/20 hover:bg-rose-600/5 transition-colors text-left"
                >
                  <span className="font-semibold text-rose-600">Factory Reset</span>
                  <span className="text-xs text-muted-foreground mt-1">Delete everything permanently</span>
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
                <a href="mailto:dybrahimovic28@gmail.com" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">{versionInfo.developer}</a>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pt-2">
                {versionInfo.releaseNotes}
              </p>
            </div>
          </GlassCard>
        </div>
      </div>

      <ResetDataModal 
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onConfirm={handleConfirmReset}
        type={resetType}
      />
      <CustomCurrencyModal 
        isOpen={isCustomCurrencyModalOpen}
        onClose={() => setIsCustomCurrencyModalOpen(false)}
        onSuccess={(code) => handleCurrencyChange(code)}
      />
      <AccountModal 
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        accountToEdit={accountToEdit}
      />
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        accountName={accountToDelete?.name || ''}
        onConfirm={async () => {
          if (accountToDelete && user) {
            await accountService.deleteAccountWithData(accountToDelete.id, user.id)
            await refreshAccounts()
            
            if (selectedAccountId === accountToDelete.id) {
              const remainingAccounts = accounts.filter(a => a.id !== accountToDelete.id)
              if (remainingAccounts.length > 0) {
                setSelectedAccountId(remainingAccounts[0].id)
              } else {
                setSelectedAccountId('')
              }
            }
            
            toast.success('Account completely removed')
          }
        }}
      />
    </motion.div>
  )
}
