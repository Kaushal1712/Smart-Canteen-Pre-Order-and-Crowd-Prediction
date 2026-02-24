'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { PageTransition } from '@/components/shared/page-transition'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingButton } from '@/components/ui/loading-button'
import { AUTH_PLACEHOLDER_MODE, DEMO_USER } from '@/lib/config'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { createClient } from '@/lib/supabase/client'

const DIETARY_OPTIONS = ['Vegetarian', 'Non-Vegetarian', 'Vegan']

export default function ProfilePage() {
  const supabase = useMemo(() => createClient(), [])
  const { user } = useCurrentUser()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [defaultDiningMode, setDefaultDiningMode] = useState<'dine-in' | 'takeaway'>('dine-in')
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([])
  const [createdAt, setCreatedAt] = useState('')

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        return
      }

      if (AUTH_PLACEHOLDER_MODE) {
        setLoading(true)
        setName(DEMO_USER.name)
        setPhone(DEMO_USER.phone)
        setEmail(DEMO_USER.email)
        setDefaultDiningMode('dine-in')
        setDietaryPreferences(['Vegetarian'])
        setCreatedAt(new Date().toISOString())
        setLoading(false)
        return
      }

      setLoading(true)

      const { data, error } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle()

      if (error || !data) {
        toast.error('Unable to load profile details.')
        setLoading(false)
        return
      }

      setName(data.name || '')
      setPhone(data.phone || '')
      setEmail(data.email || user.email || '')
      setDefaultDiningMode(data.default_dining_mode || 'dine-in')
      setDietaryPreferences((data.dietary_preferences as string[]) || [])
      setCreatedAt(data.created_at)
      setLoading(false)
    }

    void fetchProfile()
  }, [supabase, user])

  function toggleDietary(option: string) {
    setDietaryPreferences((prev) =>
      prev.includes(option) ? prev.filter((entry) => entry !== option) : [...prev, option]
    )
  }

  async function handleSave() {
    if (!user) {
      return
    }

    if (AUTH_PLACEHOLDER_MODE) {
      setSaving(true)
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast.success('Profile saved in placeholder mode.')
      setSaving(false)
      return
    }

    setSaving(true)

    const { error } = await supabase
      .from('users')
      .update({
        name,
        phone,
        default_dining_mode: defaultDiningMode,
        dietary_preferences: dietaryPreferences
      })
      .eq('id', user.id)

    if (error) {
      toast.error('Unable to save profile right now.')
      setSaving(false)
      return
    }

    toast.success('Profile updated successfully.')
    setSaving(false)
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm('Delete your account? This action cannot be undone.')

    if (!confirmed || !user) {
      return
    }

    if (AUTH_PLACEHOLDER_MODE) {
      toast.success('Delete action disabled in placeholder mode.')
      return
    }

    const { error } = await supabase.from('users').update({ name: '[deleted]' }).eq('id', user.id)

    if (error) {
      toast.error('Unable to process delete request right now.')
      return
    }

    toast.success('Account marked as deleted.')
  }

  if (loading) {
    return (
      <PageTransition>
        <div className="flex min-h-[260px] items-center justify-center rounded-card bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-[#6B6560]" />
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <section className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9C9590]">Account</p>
          <h1 className="font-display text-[28px] font-bold text-[#1A1A1A]">Profile Settings</h1>
        </header>

        <article className="rounded-card bg-white p-5">
          <h2 className="font-display text-[22px] font-bold text-[#1A1A1A]">Personal Details</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-2 block text-[13px] font-semibold text-[#1A1A1A]">
                Full Name
              </label>
              <Input id="name" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div>
              <label htmlFor="phone" className="mb-2 block text-[13px] font-semibold text-[#1A1A1A]">
                Phone
              </label>
              <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Optional" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="email" className="mb-2 block text-[13px] font-semibold text-[#1A1A1A]">
                Email (read only)
              </label>
              <Input id="email" value={email} readOnly disabled />
            </div>
          </div>
        </article>

        <article className="rounded-card bg-white p-5">
          <h2 className="font-display text-[22px] font-bold text-[#1A1A1A]">Preferences</h2>

          <div className="mt-4">
            <p className="text-[13px] font-semibold text-[#1A1A1A]">Default Dining Mode</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {['dine-in', 'takeaway'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDefaultDiningMode(mode as 'dine-in' | 'takeaway')}
                  className={`focus-ring rounded-chip px-4 py-2 text-[13px] font-semibold capitalize ${
                    defaultDiningMode === mode
                      ? 'bg-terracotta-50 text-terracotta-600'
                      : 'bg-cream-200 text-[#6B6560]'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[13px] font-semibold text-[#1A1A1A]">Dietary Preferences</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((option) => {
                const active = dietaryPreferences.includes(option)

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleDietary(option)}
                    className={`focus-ring rounded-chip px-4 py-2 text-[13px] font-semibold ${
                      active ? 'bg-sage-50 text-sage-600' : 'bg-cream-200 text-[#6B6560]'
                    }`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </div>
        </article>

        <article className="rounded-card bg-white p-5">
          <h2 className="font-display text-[22px] font-bold text-[#1A1A1A]">Account</h2>
          <p className="mt-2 text-[14px] text-[#6B6560]">
            Member since {createdAt ? new Date(createdAt).toLocaleDateString() : '--'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <LoadingButton loading={saving} loadingText="Saving..." onClick={handleSave}>
              Save Changes
            </LoadingButton>
            <Button variant="outline" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </div>
        </article>
      </section>
    </PageTransition>
  )
}
