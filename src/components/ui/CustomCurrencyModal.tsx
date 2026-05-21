import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { GlassCard } from './GlassCard'
import { Input } from './input'
import { Button } from './button'
import toast from 'react-hot-toast'
import { useCustomCurrencies } from '@/hooks/useCustomCurrencies'

interface CustomCurrencyModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (code: string) => void
}

export function CustomCurrencyModal({ isOpen, onClose, onSuccess }: CustomCurrencyModalProps) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const { addCustomCurrency, allCurrencies } = useCustomCurrencies()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const formattedCode = code.trim().toUpperCase()
    if (!formattedCode || formattedCode.length > 5) {
      toast.error('Please enter a valid currency code (e.g. ZAR)')
      return
    }
    
    if (allCurrencies.some(c => c.code === formattedCode)) {
      toast.error(`Currency ${formattedCode} already exists`)
      return
    }

    if (!name.trim()) {
      toast.error('Please enter a currency name')
      return
    }

    if (!symbol.trim()) {
      toast.error('Please enter a currency symbol')
      return
    }

    addCustomCurrency({
      code: formattedCode,
      name: name.trim(),
      symbol: symbol.trim()
    })
    
    toast.success(`${formattedCode} added successfully`)
    
    // Reset form
    setCode('')
    setName('')
    setSymbol('')
    
    onSuccess?.(formattedCode)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm"
          >
            <GlassCard intensity="high" className="p-6 border border-white/10 shadow-2xl relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Add Currency</h2>
                <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">Currency Code</label>
                  <Input 
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="bg-background/50 border-white/10" 
                    placeholder="e.g. ZAR" 
                    maxLength={5}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">Currency Name</label>
                  <Input 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background/50 border-white/10" 
                    placeholder="e.g. South African Rand" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">Currency Symbol</label>
                  <Input 
                    required
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="bg-background/50 border-white/10" 
                    placeholder="e.g. R" 
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full py-6 text-base font-bold">
                    Save Currency
                  </Button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
