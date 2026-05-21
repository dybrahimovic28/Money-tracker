import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { Home, PieChart, Settings, LogOut, Target, Activity, ArrowRightLeft, Users, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AccountSwitcher } from '../ui/AccountSwitcher'
import { useAuth } from '@/context/AuthContext'

const desktopNavigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Transactions', href: '/transactions', icon: ArrowRightLeft },
  { name: 'Budgets', href: '/budgets', icon: Target },
  { name: 'Reports', href: '/reports', icon: PieChart },
  { name: 'Analytics', href: '/analytics', icon: Activity },
  { name: 'Debts', href: '/debts', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function MobileDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const location = useLocation()
  const { signOut } = useAuth()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-sm md:hidden"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) onClose()
            }}
            className="fixed bottom-0 left-0 right-0 z-[110] bg-[#071225] rounded-t-3xl border-t border-white/10 md:hidden max-h-[85vh] flex flex-col shadow-2xl"
          >
            {/* Handle Bar */}
            <div className="w-full flex justify-center py-3 cursor-grab active:cursor-grabbing" onClick={onClose}>
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>

            <div className="px-6 pb-2 flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">Menu</h2>
              <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-muted-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-2 scrollbar-hide">
              {desktopNavigation.map((item, index) => {
                const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href))
                return (
                  <div key={item.name} className="space-y-2">
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center rounded-xl px-4 py-3.5 text-base font-medium transition-colors',
                        isActive 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                      )}
                    >
                      <item.icon className={cn("h-5 w-5 mr-3", isActive ? "text-primary" : "text-muted-foreground")} />
                      {item.name}
                    </Link>
                    
                    {index === 0 && (
                      <div className="mb-2">
                        <AccountSwitcher />
                      </div>
                    )}
                  </div>
                )
              })}

              <div className="mt-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    signOut()
                  }}
                  className="flex items-center rounded-xl px-4 py-3.5 text-base font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive w-full transition-colors"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Log Out
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
