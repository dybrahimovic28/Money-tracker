import { motion } from 'framer-motion'
import { EmptyState } from '@/components/ui/EmptyState'
import { Target } from 'lucide-react'

export function Budgets() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 h-full"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Budgets & Goals</h1>
      </div>

      <div className="h-[60vh] flex items-center justify-center">
        <EmptyState 
          icon={Target}
          title="No budgets set yet"
          description="Create a budget or savings goal to track your financial health and limit overspending."
          actionLabel="Create Budget"
          onAction={() => console.log('Create budget')}
        />
      </div>
    </motion.div>
  )
}
