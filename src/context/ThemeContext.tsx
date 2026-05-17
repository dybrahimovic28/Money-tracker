import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'

type ThemeMode = 'dark' | 'light' | 'system'
type AccentColor = 'emerald' | 'blue' | 'purple' | 'orange' | 'red'
type ThemeStyle = 'glass' | 'classic' | 'compact' | 'comfortable'

interface ThemeState {
  mode: ThemeMode
  accent: AccentColor
  style: ThemeStyle
}

interface ThemeContextType extends ThemeState {
  setTheme: (theme: Partial<ThemeState>) => void
}

const defaultTheme: ThemeState = {
  mode: 'dark',
  accent: 'emerald',
  style: 'glass',
}

const ThemeContext = createContext<ThemeContextType>({
  ...defaultTheme,
  setTheme: () => null,
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [theme, setThemeState] = useState<ThemeState>(() => {
    const saved = localStorage.getItem('money-tracker-theme')
    return saved ? JSON.parse(saved) : defaultTheme
  })

  // Sync with DB if user logs in
  useEffect(() => {
    if (user) {
      // In a real app, you'd fetch from profiles or a settings table
      // supabase.from('profiles').select('theme_settings').eq('id', user.id).single()
      // For now, we trust local storage as primary and could sync up.
    }
  }, [user])

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement
    
    // Reset previous classes
    root.classList.remove('dark', 'light')
    root.classList.remove('accent-emerald', 'accent-blue', 'accent-purple', 'accent-orange', 'accent-red')
    root.classList.remove('mode-glass', 'mode-classic', 'mode-compact', 'mode-comfortable')

    // Apply Mode
    if (theme.mode === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme.mode)
    }

    // Apply Accent
    if (theme.accent !== 'emerald') { // Default emerald has no class
      root.classList.add(`accent-${theme.accent}`)
    }

    // Apply Style
    if (theme.style !== 'classic') { // Default classic has no class, wait glass is default per requirements
      root.classList.add(`mode-${theme.style}`)
    }

    localStorage.setItem('money-tracker-theme', JSON.stringify(theme))
  }, [theme])

  const setTheme = (newTheme: Partial<ThemeState>) => {
    setThemeState((prev) => ({ ...prev, ...newTheme }))
  }

  return (
    <ThemeContext.Provider value={{ ...theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
