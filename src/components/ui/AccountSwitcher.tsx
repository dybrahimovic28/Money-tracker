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
              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="h-4 w-4 flex-shrink-0" />
              </motion.div>
            </div>
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "bg-card/50 border-white/10 rounded-xl overflow-hidden",
                collapsed ? "absolute left-full ml-2 top-0 w-56 border shadow-xl z-50 backdrop-blur-md max-h-60 overflow-y-auto" : "relative mt-1 border border-transparent pl-4"
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
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors mb-1 ${selectedAccountId === acc.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'}`}
                      >
                        <span className="truncate mr-2">{acc.name}</span>
                        <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-muted-foreground flex-shrink-0">{acc.currency_code}</span>
                      </button>
                    ))}
                    <div className={cn("mt-1 pt-1", collapsed ? "border-t border-white/5" : "")}>
                      <button
                        onClick={() => {
                          setIsOpen(false)
                          setIsModalOpen(true)
                        }}
                        className="w-full flex items-center px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Account
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-xs font-medium text-foreground mb-3">No accounts</p>
                    <button
                      onClick={() => {
                        setIsOpen(false)
                        setIsModalOpen(true)
                      }}
                      className="w-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors py-2 rounded-lg text-xs font-bold"
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
