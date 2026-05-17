import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { Button } from './button'

export function ThemeToggle() {
  const { mode, setTheme } = useTheme()

  return (
    <div className="flex items-center space-x-1 rounded-full border border-border bg-card/50 p-1 glass">
      <Button
        variant={mode === 'light' ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={() => setTheme({ mode: 'light' })}
        aria-label="Light mode"
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button
        variant={mode === 'system' ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={() => setTheme({ mode: 'system' })}
        aria-label="System mode"
      >
        <Monitor className="h-4 w-4" />
      </Button>
      <Button
        variant={mode === 'dark' ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={() => setTheme({ mode: 'dark' })}
        aria-label="Dark mode"
      >
        <Moon className="h-4 w-4" />
      </Button>
    </div>
  )
}
