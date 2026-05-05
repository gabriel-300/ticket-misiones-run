import { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database'

type Profile = Tables<'profiles'>

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState((prev) => ({ ...prev, session, user: session?.user ?? null }))
      if (session?.user) fetchProfile(session.user.id)
      else setState((prev) => ({ ...prev, loading: false }))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({ ...prev, session, user: session?.user ?? null }))
      if (session?.user) fetchProfile(session.user.id)
      else setState((prev) => ({ ...prev, profile: null, loading: false }))
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setState((prev) => ({ ...prev, profile: data, loading: false }))
  }

  async function signUp(params: {
    email: string
    password: string
    first_name: string
    last_name: string
    dni: string
    dni_type: 'DNI' | 'PASAPORTE' | 'CI'
    birth_date: string
    gender: 'M' | 'F' | 'X'
    phone: string
  }) {
    const { email, password, ...meta } = params
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: meta,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { data, error }
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  async function resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })
    return { data, error }
  }

  const isAdmin = state.profile?.role === 'admin'
  const isAuthenticated = !!state.user && !!state.session

  return {
    ...state,
    isAdmin,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }
}
