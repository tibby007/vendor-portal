'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, Broker, Vendor } from '@/types/database'

interface UserData {
  user: User | null
  profile: Profile | null
  broker: Broker | null
  vendor: (Vendor & { broker: Broker }) | null
  loading: boolean
  error: string | null
}

export function useUser() {
  const [userData, setUserData] = useState<UserData>({
    user: null,
    profile: null,
    broker: null,
    vendor: null,
    loading: true,
    error: null,
  })

  const isFetching = useRef(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchUserData = async () => {
      // Prevent concurrent fetches
      if (isFetching.current) return
      isFetching.current = true

      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          setUserData({
            user: null,
            profile: null,
            broker: null,
            vendor: null,
            loading: false,
            error: userError?.message || null,
          })
          return
        }

        // Fetch profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        if (profileError) {
          console.error('Profile fetch error:', profileError)
          setUserData({
            user,
            profile: null,
            broker: null,
            vendor: null,
            loading: false,
            error: profileError.message,
          })
          return
        }

        if (!profile) {
          console.error('No profile found for user:', user.id)
          setUserData({
            user,
            profile: null,
            broker: null,
            vendor: null,
            loading: false,
            error: 'Profile not found',
          })
          return
        }

        let broker: Broker | null = null
        let vendor: (Vendor & { broker: Broker }) | null = null

        if (profile.role === 'broker') {
          const { data: brokerData } = await supabase
            .from('brokers')
            .select('*')
            .eq('profile_id', user.id)
            .maybeSingle()
          broker = brokerData
        } else if (profile.role === 'vendor') {
          const { data: vendorData } = await supabase
            .from('vendors')
            .select('*, broker:brokers(*)')
            .eq('profile_id', user.id)
            .maybeSingle()
          vendor = vendorData as (Vendor & { broker: Broker }) | null
        }

        setUserData({
          user,
          profile,
          broker,
          vendor,
          loading: false,
          error: null,
        })
      } catch (err) {
        console.error('useUser error:', err)
        setUserData({
          user: null,
          profile: null,
          broker: null,
          vendor: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        })
      } finally {
        isFetching.current = false
      }
    }

    fetchUserData()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log('Auth state changed:', event)
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        fetchUserData()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return userData
}
