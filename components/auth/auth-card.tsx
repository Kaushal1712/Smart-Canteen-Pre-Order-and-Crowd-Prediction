'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { LoadingButton } from '@/components/ui/loading-button'
import { Input } from '@/components/ui/input'
import { AUTH_PLACEHOLDER_MODE } from '@/lib/config'
import { createClient } from '@/lib/supabase/client'

interface AuthCardProps {
  type: 'login' | 'signup'
}

export function AuthCard({ type }: AuthCardProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const isLogin = type === 'login'

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (AUTH_PLACEHOLDER_MODE) {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast.success('Placeholder login enabled. Redirecting...')
      router.push('/dashboard')
      router.refresh()
      setLoading(false)
      return
    }

    const supabase = createClient()
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          throw error
        }
        toast.success('Welcome back!')
        router.push('/dashboard')
        router.refresh()
        return
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      })

      if (error) {
        throw error
      }

      toast.success('Account created. Redirecting to dashboard...')
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    if (AUTH_PLACEHOLDER_MODE) {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 400))
      toast.success('Placeholder Google login enabled. Redirecting...')
      router.push('/dashboard')
      router.refresh()
      setLoading(false)
      return
    }

    const supabase = createClient()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) {
        throw error
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google sign-in failed'
      toast.error(message)
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-card bg-white p-8 shadow-warmLg">
      <div className="mb-6">
        <h1 className="font-display text-[28px] font-bold text-[#1A1A1A]">
          {isLogin ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="mt-2 text-[15px] text-[#6B6560]">
          {AUTH_PLACEHOLDER_MODE
            ? 'Authentication is in placeholder mode for now. Continue to access the app.'
            : isLogin
              ? 'Sign in to pre-order your meal and reserve seats.'
              : 'Join Smart Canteen and skip the rush.'}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {!isLogin ? (
          <div>
            <label htmlFor="name" className="mb-2 block text-[13px] font-semibold text-[#1A1A1A]">
              Full Name
            </label>
            <Input
              id="name"
              placeholder="Jonathan Roy"
              required={!AUTH_PLACEHOLDER_MODE}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
        ) : null}

        <div>
          <label htmlFor="email" className="mb-2 block text-[13px] font-semibold text-[#1A1A1A]">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@college.edu"
            required={!AUTH_PLACEHOLDER_MODE}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-[13px] font-semibold text-[#1A1A1A]">
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            required={!AUTH_PLACEHOLDER_MODE}
            minLength={AUTH_PLACEHOLDER_MODE ? undefined : 6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <LoadingButton type="submit" className="w-full" loading={loading} loadingText="Authenticating...">
          {AUTH_PLACEHOLDER_MODE ? 'Continue to App' : isLogin ? 'Login' : 'Sign Up'}
        </LoadingButton>
      </form>

      {AUTH_PLACEHOLDER_MODE ? null : (
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-cream-300" />
          <span className="text-[12px] font-semibold text-[#9C9590]">OR</span>
          <div className="h-px flex-1 bg-cream-300" />
        </div>
      )}

      {AUTH_PLACEHOLDER_MODE ? null : (
        <LoadingButton variant="secondary" className="w-full" loading={loading} onClick={handleGoogleSignIn}>
          Continue with Google
        </LoadingButton>
      )}

      <p className="mt-6 text-center text-[14px] text-[#6B6560]">
        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
        <Link href={isLogin ? '/signup' : '/login'} className="font-semibold text-terracotta-600">
          {isLogin ? 'Sign up' : 'Login'}
        </Link>
      </p>
    </div>
  )
}
