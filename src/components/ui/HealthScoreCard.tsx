import { GlassCard } from './GlassCard'
import { Activity } from 'lucide-react'

interface HealthScoreCardProps {
  score: number // 0 to 100
}

export function HealthScoreCard({ score }: HealthScoreCardProps) {
  let status = 'Excellent'
  let color = 'text-emerald-500'

  if (score < 50) {
    status = 'Needs Attention'
    color = 'text-red-500'
  } else if (score < 80) {
    status = 'Good'
    color = 'text-blue-500'
  }

  return (
    <GlassCard intensity="low" className="p-6 flex items-center justify-between">
      <div>
        <div className="flex items-center space-x-2 text-muted-foreground mb-1">
          <Activity className="h-4 w-4" />
          <span className="text-sm font-medium">Financial Health</span>
        </div>
        <div className="text-2xl font-bold">{score}/100</div>
        <div className={`text-sm font-medium ${color}`}>{status}</div>
      </div>
      <div className="relative h-16 w-16">
        <svg className="h-full w-full" viewBox="0 0 36 36">
          <path
            className="text-muted/20"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className={color}
            strokeDasharray={`${score}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </GlassCard>
  )
}
