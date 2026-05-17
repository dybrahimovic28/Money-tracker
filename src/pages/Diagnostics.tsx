import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { getPendingTransactions } from '@/lib/offline-sync'
import { Activity, Database, RefreshCw, Server, Wifi } from 'lucide-react'
import { Link } from 'react-router-dom'
import versionInfo from '../../public/version.json'

export function Diagnostics() {
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [realtimeStatus, setRealtimeStatus] = useState<'checking' | 'active' | 'inactive'>('checking')
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0)
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>(navigator.onLine ? 'online' : 'offline')
  const [loading, setLoading] = useState(false)

  const runDiagnostics = async () => {
    setLoading(true)
    // Check Network
    setNetworkStatus(navigator.onLine ? 'online' : 'offline')

    // Check Offline Queue
    try {
      const pending = await getPendingTransactions()
      setPendingSyncCount(pending.length)
    } catch (e) {
      console.error(e)
    }

    // Check Supabase DB Connection
    try {
      await supabase.auth.getSession()
      const { error } = await supabase.from('profiles').select('id').limit(1)
      if (error) {
        setSupabaseStatus('error')
      } else {
        setSupabaseStatus('connected')
      }
    } catch (e) {
      setSupabaseStatus('error')
    }

    // Check Realtime Status
    try {
      const channelId = Math.random().toString(36).substring(2, 9)
      const channel = supabase.channel(`health-check-${channelId}`)
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('active')
        } else {
          setRealtimeStatus('inactive')
        }
        supabase.removeChannel(channel)
      })
    } catch (e) {
      setRealtimeStatus('inactive')
    }

    setLoading(false)
  }

  useEffect(() => {
    runDiagnostics()

    const handleOnline = () => setNetworkStatus('online')
    const handleOffline = () => setNetworkStatus('offline')

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto pb-12"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">System Diagnostics</h1>
        <Button onClick={runDiagnostics} disabled={loading} size="sm" className="rounded-full">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Run Check
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core System Status */}
        <GlassCard intensity="low" className="p-6 space-y-6">
          <h2 className="text-lg font-semibold flex items-center">
            <Activity className="h-5 w-5 mr-2 text-primary" /> Connection Status
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground flex items-center">
                <Wifi className="h-4 w-4 mr-2" /> Network State
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${networkStatus === 'online' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                {networkStatus.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground flex items-center">
                <Database className="h-4 w-4 mr-2" /> Supabase Connection
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                supabaseStatus === 'connected' ? 'bg-emerald-500/20 text-emerald-500' :
                supabaseStatus === 'checking' ? 'bg-muted text-muted-foreground' : 'bg-red-500/20 text-red-500'
              }`}>
                {supabaseStatus.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground flex items-center">
                <Server className="h-4 w-4 mr-2" /> Supabase Realtime Channels
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                realtimeStatus === 'active' ? 'bg-emerald-500/20 text-emerald-500' :
                realtimeStatus === 'checking' ? 'bg-muted text-muted-foreground' : 'bg-red-500/20 text-red-500'
              }`}>
                {realtimeStatus.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground flex items-center">
                <RefreshCw className="h-4 w-4 mr-2" /> Local Sync Queue Status
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${pendingSyncCount === 0 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-orange-500/20 text-orange-500'}`}>
                {pendingSyncCount} PENDING
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Release & Version Information */}
        <GlassCard intensity="low" className="p-6 space-y-6">
          <h2 className="text-lg font-semibold flex items-center">
            <Server className="h-5 w-5 mr-2 text-primary" /> Build & Release Info
          </h2>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">App Version</span>
              <span className="font-semibold">{versionInfo.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Build Number</span>
              <span className="font-semibold">#{versionInfo.buildNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Build Date</span>
              <span className="font-semibold">{versionInfo.buildDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Developer</span>
              <span className="font-semibold">{versionInfo.developer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">License Type</span>
              <span className="font-semibold">{versionInfo.license}</span>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="flex justify-start">
        <Link to="/settings" className="text-sm text-primary hover:underline">
          &larr; Return to Settings
        </Link>
      </div>
    </motion.div>
  )
}
