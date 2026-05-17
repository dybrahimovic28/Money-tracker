import { Link, useLocation } from 'react-router-dom'
import { Home, PieChart, Wallet, Settings, LogOut, ChevronLeft, ChevronRight, Target, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'
import { motion } from 'framer-motion'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Transactions', href: '/transactions', icon: Wallet },
  { name: 'Budgets', href: '/budgets', icon: Target },
  { name: 'Reports', href: '/reports', icon: PieChart },
  { name: 'Analytics', href: '/analytics', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const location = useLocation()
  const { signOut } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.div 
      initial={false}
      animate={{ width: collapsed ? '80px' : '280px' }}
      className="hidden md:flex relative h-full flex-col border-r border-white/5 bg-card/40 glass z-40 transition-all duration-300"
    >
      <div className="flex h-20 items-center justify-between px-6 border-b border-white/5">
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center space-x-2">
            <div className="p-1.5 bg-primary rounded-lg text-primary-foreground">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">MoneyTracker</span>
          </motion.div>
        )}
        {collapsed && (
          <div className="mx-auto p-1.5 bg-primary rounded-lg text-primary-foreground">
            <Wallet className="h-5 w-5" />
          </div>
        )}
      </div>

      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-24 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground shadow-sm z-50"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group relative flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200',
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              )}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground", collapsed ? "mx-auto" : "mr-3")} />
              {!collapsed && <span>{item.name}</span>}
              {isActive && !collapsed && (
                <motion.div layoutId="activeNav" className="absolute right-2 h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
      </div>

      <div className="p-4 border-t border-white/5">
        <button
          onClick={signOut}
          className={cn(
            "group flex items-center rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive w-full transition-all duration-200",
            collapsed ? "justify-center" : ""
          )}
        >
          <LogOut className={cn("h-5 w-5 flex-shrink-0", collapsed ? "" : "mr-3")} />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </motion.div>
  )
}
