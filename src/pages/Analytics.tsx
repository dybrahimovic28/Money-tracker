import { motion } from 'framer-motion'
import { EmptyState } from '@/components/ui/EmptyState'
import { Activity } from 'lucide-react'

export function Analytics() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 h-full"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
      </div>

      <div className="h-[60vh] flex items-center justify-center">
        <EmptyState 
          icon={Activity}
          title="Not enough data"
          description="We need a few more transactions to generate your spending heatmap and wealth projections."
        />
      </div>
    </motion.div>
  )
}
