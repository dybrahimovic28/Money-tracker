import { useAccounts } from '@/context/AccountContext'
import { Wallet, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export function AccountSwitcher() {
  const { accounts, selectedAccountId, setSelectedAccountId } = useAccounts()
  const [isOpen, setIsOpen] = useState(false)
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
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
      >
        <Wallet className="h-4 w-4" />
        <span className="hidden sm:inline">{displayName}</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-card border border-white/10 rounded-xl shadow-lg z-50 overflow-hidden backdrop-blur-md">
          <div className="py-1">
            {accounts.map(acc => (
              <button
                key={acc.id}
                onClick={() => {
                  setSelectedAccountId(acc.id)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${selectedAccountId === acc.id ? 'bg-primary/10 text-primary' : 'hover:bg-white/5 text-foreground'}`}
              >
                <span>{acc.name}</span>
                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-muted-foreground">{acc.currency_code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
