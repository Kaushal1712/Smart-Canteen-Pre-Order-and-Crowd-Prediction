'use client'

import { useEffect, useMemo, useState } from 'react'

import type { User } from '@supabase/supabase-js'

import { AUTH_PLACEHOLDER_MODE, DEMO_USER } from '@/lib/config'
import type { UserProfile } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

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

    let mounted = true

    async function load() {
      const {
        data: { user: authUser }
      } = await supabase.auth.getUser()

      if (!mounted) {
        return
      }

      setUser(authUser)

      if (!authUser) {
        setProfile(null)
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

      setProfile(data as UserProfile | null)
      setLoading(false)
    }

    load()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(() => {
      load()
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  return { user, profile, loading }
}
