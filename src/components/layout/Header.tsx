import { useAuth } from '@/context/AuthContext'
import { ThemeToggle } from '../ui/ThemeToggle'
import { NotificationBell } from '../ui/NotificationBell'
import { CurrencyBadge } from '../ui/CurrencyBadge'
import { format } from 'date-fns'

export function Header() {
  const { user } = useAuth()
  const today = format(new Date(), 'EEEE, d MMMM')
  
  // Extract name from email or use full_name if available
  const getGreetingName = () => {
    if (!user) return 'User'
    const emailName = user.email?.split('@')[0] || 'User'
    return emailName.charAt(0).toUpperCase() + emailName.slice(1)
  }

  const getGreetingTime = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/5 bg-background/80 px-6 backdrop-blur-md">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold tracking-tight">
          {getGreetingTime()}, <span className="text-primary">{getGreetingName()}</span>
        </h1>
        <p className="text-xs text-muted-foreground">{today}</p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-3">
          <CurrencyBadge />
          <ThemeToggle />
          <NotificationBell count={2} />
        </div>
        
        <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-primary/20 bg-muted">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'default'}&backgroundColor=transparent`}
            alt="User avatar"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </header>
  )
}
