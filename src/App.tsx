import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Transactions } from './pages/Transactions'
import { Budgets } from './pages/Budgets'
import { Reports } from './pages/Reports'
import { Analytics } from './pages/Analytics'
import { Settings } from './pages/Settings'
import { Debts } from './pages/Debts'

import { NotFound } from './pages/NotFound'
import { PwaInstallPrompt } from './components/ui/PwaInstallPrompt'
import { PwaUpdatePrompt } from './components/ui/PwaUpdatePrompt'
import { useEffect } from 'react'
import { supabase } from './lib/supabase'
import { syncOfflineTransactions } from './lib/offline-sync'

function SyncManager() {
  useEffect(() => {
    const handleOnline = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        syncOfflineTransactions(session.user.id)
      }
    }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [])
  return null
}

function App() {
  return (
    <>
      <SyncManager />
      <PwaInstallPrompt />
      <PwaUpdatePrompt />
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="reports" element={<Reports />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="debts" element={<Debts />} />
        <Route path="settings" element={<Settings />} />

      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  )
}

export default App
