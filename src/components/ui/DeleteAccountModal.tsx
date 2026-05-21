import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { Input } from './input'
import { Button } from './button'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  accountName: string
}

export function DeleteAccountModal({ isOpen, onClose, onConfirm, accountName }: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setConfirmText('')
    }
  }, [isOpen])

  const canDelete = confirmText.trim().toUpperCase() === 'DELETE'

  const handleConfirm = async () => {
    if (!canDelete) return
    setIsDeleting(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-[480px] max-h-screen overflow-y-auto"
          >
            <div className="bg-[#071225] rounded-3xl p-8 border border-destructive/20 shadow-2xl relative text-center">
              <button 
                onClick={onClose} 
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-muted-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-6">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-2">Delete Account?</h2>
              
              <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 mb-6 text-sm text-left">
                <p className="text-destructive font-semibold mb-1">Warning: Permanent Action</p>
                <p className="text-muted-foreground">
                  You are about to delete <strong>{accountName}</strong>. 
                  This will permanently remove the account and all associated transactions, budgets, and debts.
                  This action cannot be undone.
                </p>
              </div>

              <div className="space-y-2 mb-8 text-left">
                <label className="text-sm font-semibold text-muted-foreground">
                  Type <span className="text-foreground font-bold font-mono bg-white/10 px-1 rounded">DELETE</span> to confirm
                </label>
                <Input 
                  type="text" 
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="bg-background/50 border-white/10 rounded-xl text-center tracking-widest uppercase font-mono" 
                  placeholder="DELETE" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={onClose} 
                  className="rounded-xl py-6 text-base font-bold bg-white/5 hover:bg-white/10 border-white/10"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirm}
                  disabled={!canDelete || isDeleting} 
                  className="rounded-xl py-6 text-base font-bold bg-red-600 hover:bg-red-700 text-white border-none"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
