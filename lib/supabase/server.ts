import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { AUTH_PLACEHOLDER_MODE } from '@/lib/config'

export function createClient() {
  const cookieStore = cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    if (AUTH_PLACEHOLDER_MODE) {
      return createServerClient('https://placeholder.supabase.co', 'placeholder-anon-key', {
        cookies: {
          get() {
            return undefined
          },
          set() {},
          remove() {}
        }
      })
    }

    throw new Error('Missing Supabase environment variables')
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options) {
        cookieStore.set({ name, value: '', ...options })
      }
    }
  })
}
