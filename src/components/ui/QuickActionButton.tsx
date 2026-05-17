import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface QuickActionButtonProps {
  icon: LucideIcon
  label: string
  onClick?: () => void
  colorClass?: string
}

export function QuickActionButton({ icon: Icon, label, onClick, colorClass = "bg-primary text-primary-foreground" }: QuickActionButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center justify-center space-y-2 w-full"
    >
      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ${colorClass} glass hover:brightness-110 transition-all`}>
        <Icon className="h-6 w-6" />
      </div>
      <span className="text-xs font-medium text-foreground/80">{label}</span>
    </motion.button>
  )
}
