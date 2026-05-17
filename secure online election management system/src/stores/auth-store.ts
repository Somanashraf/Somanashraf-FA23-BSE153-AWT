import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import type { Profile, UserRole } from '@/types/database'
import { supabase } from '@/lib/supabase'

interface AuthState {
  session: Session | null
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isInitialized: boolean
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  fetchProfile: () => Promise<Profile | null>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
  hasRole: (...roles: UserRole[]) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  isInitialized: false,

  setSession: (session) => {
    set({ session, user: session?.user ?? null })
  },

  setProfile: (profile) => set({ profile }),

  fetchProfile: async () => {
    const userId = get().user?.id
    if (!userId) {
      set({ profile: null })
      return null
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Failed to fetch profile:', error.message)
      set({ profile: null })
      return null
    }

    set({ profile: data as Profile })
    return data as Profile
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, user: null, profile: null })
  },

  initialize: async () => {
    set({ isLoading: true })
    const {
      data: { session },
    } = await supabase.auth.getSession()
    set({ session, user: session?.user ?? null })

    if (session?.user) {
      await get().fetchProfile()
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ session, user: session?.user ?? null })
      if (session?.user) {
        await get().fetchProfile()
      } else {
        set({ profile: null })
      }
    })

    set({ isLoading: false, isInitialized: true })
  },

  hasRole: (...roles) => {
    const role = get().profile?.role
    return role ? roles.includes(role) : false
  },
}))
