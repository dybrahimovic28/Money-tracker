import { ErrorBoundary } from 'react-error-boundary'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/context/AuthContext'
import { AccountProvider } from '@/context/AccountContext'
import { CurrencyProvider } from '@/context/CurrencyContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

function ErrorFallback({ error, resetErrorBoundary }: { error: any, resetErrorBoundary: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20 mb-6">
        <AlertCircle className="h-10 w-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground max-w-md mb-6">{error.message}</p>
      <Button onClick={resetErrorBoundary} className="px-8 rounded-full">
        Try again
      </Button>
    </div>
  )
}

function NetworkStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOffline = () => setIsOffline(true)
    const handleOnline = () => setIsOffline(false)

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-orange-500 text-white text-center text-xs py-1 font-medium shadow-md">
      You are currently offline. Changes will be saved locally and synced when you reconnect.
    </div>
  )
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AccountProvider>
            <CurrencyProvider>
              <ThemeProvider>
                <NetworkStatus />
                {children}
              </ThemeProvider>
            </CurrencyProvider>
          </AccountProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
