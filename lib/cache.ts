// In-memory cache — persists across client-side navigation, resets on hard refresh.
// Use for data that's expensive to fetch and doesn't change often (menu, orders).

type CacheEntry<T> = { data: T }

const store = new Map<string, CacheEntry<unknown>>()

export const appCache = {
  get<T>(key: string): T | null {
    return (store.get(key) as CacheEntry<T> | undefined)?.data ?? null
  },
  set<T>(key: string, data: T): void {
    store.set(key, { data })
  },
  delete(key: string): void {
    store.delete(key)
  },
}

// sessionStorage helpers — survives page refresh within the same browser session.
// Use for user profile so the greeting renders with the real name immediately.

export function readSession<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeSession<T>(key: string, data: T | null): void {
  if (typeof window === 'undefined') return
  try {
    if (data === null) {
      sessionStorage.removeItem(key)
    } else {
      sessionStorage.setItem(key, JSON.stringify(data))
    }
  } catch {
    // sessionStorage may be disabled or quota exceeded — safe to ignore
  }
}
