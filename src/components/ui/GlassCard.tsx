import { cn } from '@/lib/utils'
import { Card, CardProps } from './card'

interface GlassCardProps extends CardProps {
  intensity?: 'low' | 'medium' | 'high'
}

export function GlassCard({ className, intensity = 'medium', children, ...props }: GlassCardProps) {
  return (
    <Card
      className={cn(
        'glass overflow-hidden border-white/10 dark:border-white/5',
        {
          'bg-card/40 backdrop-blur-md': intensity === 'low',
          'bg-card/60 backdrop-blur-lg': intensity === 'medium',
          'bg-card/80 backdrop-blur-xl': intensity === 'high',
        },
        className
      )}
      {...props}
    >
      {children}
    </Card>
  )
}
