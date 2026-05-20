import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle } from 'lucide-react'

export type ResetType = 'Monthly' | 'Transactions' | 'Financial' | 'Factory'

interface ResetDataModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (type: ResetType) => void
  type: ResetType
}

export function ResetDataModal({ isOpen, onClose, onConfirm, type }: ResetDataModalProps) {
  const [inputValue, setInputValue] = useState('')
  const [step, setStep] = useState<1 | 2>(1)

  if (!isOpen) return null

  const getDetails = () => {
    switch (type) {
      case 'Monthly':
        return {
          title: 'Monthly Reset',
          color: 'text-blue-400',
          bg: 'bg-blue-400/10',
          border: 'border-blue-400/20',
          btn: 'bg-blue-600 hover:bg-blue-700',
          desc: 'This will archive current month transactions and reset dashboard/budget totals. History and reports are kept.',
          keyword: 'RESET'
        }
      case 'Transactions':
        return {
          title: 'Reset Transactions',
          color: 'text-orange-400',
          bg: 'bg-orange-400/10',
          border: 'border-orange-400/20',
          btn: 'bg-orange-600 hover:bg-orange-700',
          desc: 'This will permanently delete all income and expense records. Accounts, budgets, and settings are kept.',
          keyword: 'RESET'
        }
      case 'Financial':
        return {
          title: 'Full Financial Reset',
          color: 'text-red-400',
          bg: 'bg-red-400/10',
          border: 'border-red-400/20',
          btn: 'bg-red-600 hover:bg-red-700',
          desc: 'This will delete all transactions, budgets, savings goals, and debts. Wallets and settings are kept.',
          keyword: 'DELETE ALL'
        }
      case 'Factory':
        return {
          title: 'Factory Reset',
          color: 'text-rose-600',
          bg: 'bg-rose-600/10',
          border: 'border-rose-600/20',
          btn: 'bg-rose-600 hover:bg-rose-700',
          desc: 'This will delete EVERYTHING including wallets, preferences, and cache. The app returns to onboarding state.',
          keyword: 'FACTORY RESET'
        }
    }
  }

  const details = getDetails()
  const isMatch = inputValue === details.keyword

  const handleAction = () => {
    if (type === 'Factory' && step === 1) {
      setStep(2)
      return
    }
    onConfirm(type)
    setInputValue('')
    setStep(1)
    onClose()
  }

  const handleClose = () => {
    setInputValue('')
    setStep(1)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 p-6"
          >
            <div className={`bg-card border ${details.border} rounded-2xl shadow-xl overflow-hidden`}>
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className={`h-5 w-5 ${details.color}`} />
                  <h2 className={`text-xl font-semibold ${details.color}`}>{details.title}?</h2>
                </div>
                <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {step === 1 ? (
                  <>
                    <p className="text-muted-foreground text-sm">
                      {details.desc}
                    </p>
                    <div className={`p-4 rounded-xl border ${details.border} ${details.bg}`}>
                      <p className="text-sm font-medium mb-2">Type <strong className="text-foreground">{details.keyword}</strong> to confirm:</p>
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={details.keyword}
                        className="w-full p-3 rounded-lg bg-background border border-white/10 text-foreground focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <AlertTriangle className="h-12 w-12 text-rose-600 mx-auto" />
                    <h3 className="text-lg font-bold">This action cannot be undone.</h3>
                    <p className="text-sm text-muted-foreground">Are you absolutely sure you want to delete everything?</p>
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    onClick={handleClose}
                    className="flex-1 p-3 rounded-xl border border-white/10 hover:bg-white/5 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={step === 1 && !isMatch}
                    onClick={handleAction}
                    className={`flex-1 p-3 rounded-xl font-medium transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed ${details.btn}`}
                  >
                    {step === 2 ? 'Delete Everything' : 'Confirm'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
