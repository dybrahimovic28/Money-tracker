import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Wallet } from 'lucide-react'
import toast from 'react-hot-toast'

export function ResetPassword() {
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Optionally handle cases where someone visits /reset-password directly without a recovery link.
    // If the hash is not present, Supabase might not establish a session.
    // We let Supabase handle the token and session automatically.
  }, [])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })
      
      if (error) throw error
      
      toast.success('Password updated successfully')
      
      // Sign out to force the user to log in with new credentials if needed,
      // or simply redirect to login
      await supabase.auth.signOut()
      navigate('/login')
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while updating password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-card p-8 shadow-lg">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Wallet className="h-12 w-12 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            New Password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              New Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Confirm Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="flex flex-col space-y-2 pt-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full"
              onClick={() => navigate('/login')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
