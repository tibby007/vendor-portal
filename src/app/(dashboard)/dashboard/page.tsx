import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BrokerDashboard } from '@/components/dashboard/BrokerDashboard'
import { VendorDashboard } from '@/components/dashboard/VendorDashboard'
import { BrokerOnboarding } from '@/components/onboarding/BrokerOnboarding'
import type { Profile, Broker, Vendor, Deal, KanbanStage } from '@/types/database'

interface RecentDeal extends Deal {
  vendor: Pick<Vendor, 'company_name'>
  stage: Pick<KanbanStage, 'name'>
}

interface DealWithStage extends Deal {
  stage: Pick<KanbanStage, 'name' | 'is_visible_to_vendor'>
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get profile
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const profile = profileData as Profile | null

  if (!profile) {
    redirect('/login')
  }

  if (profile.role === 'broker') {
    // Check if broker has completed onboarding
    const { data: brokerData } = await supabase
      .from('brokers')
      .select('*')
      .eq('profile_id', user.id)
      .single()

    const broker = brokerData as Broker | null

    if (!broker?.onboarding_completed) {
      return <BrokerOnboarding broker={broker} />
    }

    // Get broker stats
    const { count: vendorCount } = await supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true })
      .eq('broker_id', broker.id)

    const { count: dealCount } = await supabase
      .from('deals')
      .select('*', { count: 'exact', head: true })
      .eq('broker_id', broker.id)

    const { data: recentDealsData } = await supabase
      .from('deals')
      .select(`
        *,
        vendor:vendors(company_name),
        stage:kanban_stages(name)
      `)
      .eq('broker_id', broker.id)
      .order('created_at', { ascending: false })
      .limit(5)

    const recentDeals = (recentDealsData || []) as unknown as RecentDeal[]

    return (
      <BrokerDashboard
        broker={broker}
        vendorCount={vendorCount || 0}
        dealCount={dealCount || 0}
        recentDeals={recentDeals}
      />
    )
  }

  // Vendor dashboard
  const { data: vendorData } = await supabase
    .from('vendors')
    .select('*, broker:brokers(*)')
    .eq('profile_id', user.id)
    .single()

  const vendor = vendorData as (Vendor & { broker: Broker }) | null

  if (!vendor) {
    redirect('/login')
  }

  const { data: dealsData } = await supabase
    .from('deals')
    .select(`
      *,
      stage:kanban_stages(name, is_visible_to_vendor)
    `)
    .eq('vendor_id', vendor.id)
    .order('created_at', { ascending: false })

  const deals = (dealsData || []) as unknown as DealWithStage[]

  return (
    <VendorDashboard
      vendor={vendor}
      deals={deals}
    />
  )
}
