import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  session: Session | null
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  signInWithDemo: (email: string) => void
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  signInWithDemo: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if there is a mock session first
    const mockSessionStr = localStorage.getItem('money-tracker-mock-session')
    if (mockSessionStr) {
      try {
        const mockSession = JSON.parse(mockSessionStr)
        setSession(mockSession)
        setUser(mockSession.user)
        setLoading(false)
        return
      } catch (e) {
        localStorage.removeItem('money-tracker-mock-session')
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!localStorage.getItem('money-tracker-mock-session')) {
        setSession(session)
        setUser(session?.user ?? null)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!localStorage.getItem('money-tracker-mock-session')) {
        setSession(session)
        setUser(session?.user ?? null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    localStorage.removeItem('money-tracker-mock-session')
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
  }

  const signInWithDemo = (email: string) => {
    const mockSession = {
      access_token: 'mock-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: {
        id: '00000000-0000-0000-0000-000000000000',
        aud: 'authenticated',
        role: 'authenticated',
        email: email,
        created_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
      }
    } as unknown as Session
    localStorage.setItem('money-tracker-mock-session', JSON.stringify(mockSession))
    setSession(mockSession)
    setUser(mockSession.user)
  }

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut, signInWithDemo }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}

