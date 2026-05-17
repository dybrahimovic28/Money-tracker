import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { AlertTriangle, Home } from 'lucide-react'

export function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-background text-foreground text-center relative overflow-hidden">
      {/* Decorative gradient glowing spots */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <GlassCard intensity="high" className="p-8 space-y-6">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-orange-500/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight">404</h1>
            <h2 className="text-xl font-bold">Page Not Found</h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              The page you are looking for does not exist or has been moved to another path.
            </p>
          </div>

          <div className="pt-2">
            <Link to="/" className="inline-block w-full">
              <Button className="w-full rounded-xl py-6 flex items-center justify-center space-x-2">
                <Home className="h-4 w-4" />
                <span>Return to Dashboard</span>
              </Button>
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
