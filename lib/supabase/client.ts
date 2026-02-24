'use client'

import { createBrowserClient } from '@supabase/ssr'
import { AUTH_PLACEHOLDER_MODE } from '@/lib/config'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    if (AUTH_PLACEHOLDER_MODE) {
      return createBrowserClient('https://placeholder.supabase.co', 'placeholder-anon-key')
    }

    throw new Error('Missing Supabase environment variables')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
