import { Bell } from 'lucide-react'
import { Button } from './button'

export function NotificationBell({ count = 0 }: { count?: number }) {
  return (
    <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full glass bg-card/50">
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute top-1.5 right-2 flex h-2 w-2 rounded-full bg-red-500">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
        </span>
      )}
    </Button>
  )
}
