import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Wallet } from 'lucide-react'
import toast from 'react-hot-toast'

export function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      toast.success('Password reset email sent! Check your inbox.')
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
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
            Forgot Password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we'll send you a password reset code/link.
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="flex flex-col space-y-2 pt-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Email'}
            </Button>
            <Link to="/login">
              <Button type="button" variant="ghost" className="w-full">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
