'use client'

import { useEffect, useMemo, useState } from 'react'

import type { User } from '@supabase/supabase-js'

import { AUTH_PLACEHOLDER_MODE, DEMO_USER } from '@/lib/config'
import type { UserProfile } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { readSession, writeSession } from '@/lib/cache'

const PROFILE_SESSION_KEY = 'sc:profile'

interface CurrentUserState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
}

const demoUser = {
  id: DEMO_USER.id,
  email: DEMO_USER.email
} as User

const demoProfile: UserProfile = {
  id: DEMO_USER.id,
  email: DEMO_USER.email,
  name: DEMO_USER.name,
  phone: DEMO_USER.phone,
  avatar_url: DEMO_USER.avatar_url,
  default_dining_mode: 'dine-in',
  dietary_preferences: ['Vegetarian'],
  created_at: new Date().toISOString()
}

export function useCurrentUser(): CurrentUserState {
  const supabase = useMemo(() => createClient(), [])

  // Always start null — must match the server render to avoid hydration errors.
  // sessionStorage is only available client-side, so reading it in useState
  // would cause a server/client mismatch. We apply the cache inside useEffect instead.
  const [user, setUser] = useState<User | null>(AUTH_PLACEHOLDER_MODE ? demoUser : null)
  const [profile, setProfile] = useState<UserProfile | null>(AUTH_PLACEHOLDER_MODE ? demoProfile : null)
  const [loading, setLoading] = useState(!AUTH_PLACEHOLDER_MODE)

  useEffect(() => {
    if (AUTH_PLACEHOLDER_MODE) {
      setUser(demoUser)
      setProfile(demoProfile)
      setLoading(false)
      return
    }

    // Apply cached profile immediately (synchronous) so the UI shows real data
    // before the async Supabase auth check completes — no visible "Hey, Student!" flash.
    const cachedProfile = readSession<UserProfile>(PROFILE_SESSION_KEY)
    if (cachedProfile) {
      setProfile(cachedProfile)
      setUser({ id: cachedProfile.id, email: cachedProfile.email } as User)
      setLoading(false)
    }

    let mounted = true

    async function load() {
      // getUser() validates the token with the Supabase server using an exclusive
      // Navigator LockManager lock. On slow connections multiple concurrent calls
      // (one per component using this hook) can time out waiting for the lock.
      // Fall back to getSession() which reads from localStorage with no lock/network.
      let authUser: User | null = null
      try {
        const { data } = await supabase.auth.getUser()
        authUser = data.user
      } catch {
        const { data } = await supabase.auth.getSession()
        authUser = data.session?.user ?? null
      }

      if (!mounted) {
        return
      }

      setUser(authUser)

      if (!authUser) {
        setProfile(null)
        writeSession(PROFILE_SESSION_KEY, null)
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()

      if (!mounted) {
        return
      }

      const fetchedProfile = data as UserProfile | null
      setProfile(fetchedProfile)
      writeSession(PROFILE_SESSION_KEY, fetchedProfile)
      setLoading(false)
    }

    load()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        writeSession(PROFILE_SESSION_KEY, null)
      }
      void load()
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  return { user, profile, loading }
}
