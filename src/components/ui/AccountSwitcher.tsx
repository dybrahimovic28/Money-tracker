import { useAccounts } from '@/context/AccountContext'
import { Wallet, ChevronDown, Plus } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { AccountModal } from './AccountModal'

interface AccountSwitcherProps {
  collapsed?: boolean
}

export function AccountSwitcher({ collapsed = false }: AccountSwitcherProps) {
  const { accounts, selectedAccountId, setSelectedAccountId } = useAccounts()
  const [isOpen, setIsOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedAccount = accounts.find(a => a.id === selectedAccountId)
  const displayName = selectedAccount?.name || 'Select Account'

  return (
    <>
      <div className="relative w-full" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full group relative flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 text-muted-foreground hover:bg-white/5 hover:text-foreground"
        >
          <Wallet className={cn("h-5 w-5 flex-shrink-0 transition-colors text-muted-foreground group-hover:text-foreground", collapsed ? "mx-auto" : "mr-3")} />
          {!collapsed && (
            <div className="flex items-center justify-between flex-1 truncate">
              <span className="truncate mr-2">{displayName}</span>
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
            </div>
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={cn(
                "absolute mt-1 bg-card border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden backdrop-blur-md max-h-60 overflow-y-auto w-56",
                collapsed ? "left-full ml-2 top-0" : "left-0 top-full"
              )}
            >
              <div className="py-1">
                {accounts.length > 0 ? (
                  <>
                    {accounts.map(acc => (
                      <button
                        key={acc.id}
                        onClick={() => {
                          setSelectedAccountId(acc.id)
                          setIsOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${selectedAccountId === acc.id ? 'bg-primary/10 text-primary' : 'hover:bg-white/5 text-foreground'}`}
                      >
                        <span className="truncate mr-2 font-medium">{acc.name}</span>
                        <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-muted-foreground flex-shrink-0">{acc.currency_code}</span>
                      </button>
                    ))}
                    <div className="border-t border-white/5 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setIsOpen(false)
                          setIsModalOpen(true)
                        }}
                        className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Account
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-xs font-medium text-foreground mb-3">No accounts found</p>
                    <button
                      onClick={() => {
                        setIsOpen(false)
                        setIsModalOpen(true)
                      }}
                      className="w-full bg-primary text-primary-foreground py-2 rounded-lg text-xs font-bold"
                    >
                      Create Account
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AccountModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={(id) => {
          setSelectedAccountId(id)
          setIsModalOpen(false)
        }}
      />
    </>
  )
}
