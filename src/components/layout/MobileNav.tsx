import { Link, useLocation } from 'react-router-dom'
import { Home, PieChart, Wallet, Settings, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { MobileDrawer } from './MobileDrawer'

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Transactions', href: '/transactions', icon: Wallet },
  { name: 'Placeholder', href: '#', icon: Plus }, // Placeholder for FAB
  { name: 'Reports', href: '/reports', icon: PieChart },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function MobileNav() {
  const location = useLocation()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-20 bg-background/90 backdrop-blur-lg border-t border-white/10 pb-safe">
        <div className="flex h-full w-full justify-around items-center px-2">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.href

            if (index === 2) {
              // Floating Action Button to trigger Mobile Drawer
              return (
                <div key="fab" className="relative -top-6 flex flex-col items-center">
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsDrawerOpen(true)}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 border-4 border-background"
                  >
                    <Plus className="h-6 w-6" />
                  </motion.button>
                </div>
              )
            }

            return (
              <Link
                key={item.name}
                to={item.href}
                className="flex flex-col items-center justify-center w-full h-full space-y-1"
              >
                <item.icon 
                  className={cn(
                    "h-6 w-6 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} 
                />
                <span className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
      
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  )
}
