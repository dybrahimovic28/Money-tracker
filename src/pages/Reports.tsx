import { motion } from 'framer-motion'
import { EmptyState } from '@/components/ui/EmptyState'
import { FileText } from 'lucide-react'

export function Reports() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 h-full"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
      </div>

      <div className="h-[60vh] flex items-center justify-center">
        <EmptyState 
          icon={FileText}
          title="No reports generated"
          description="Your monthly and yearly financial reports will appear here. You can also export them as PDF or CSV."
          actionLabel="Generate Report"
          onAction={() => console.log('Generate')}
        />
      </div>
    </motion.div>
  )
}
