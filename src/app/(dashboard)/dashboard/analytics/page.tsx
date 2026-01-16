import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AnalyticsDashboard } from './AnalyticsDashboard'
import type { Broker, Deal, Vendor, KanbanStage, ActivityLog } from '@/types/database'

interface DealWithRelations extends Deal {
  vendor: Pick<Vendor, 'id' | 'company_name'>
  stage: KanbanStage
}

interface VendorWithDeals extends Vendor {
  deals: Deal[]
}

export default async function AnalyticsPage() {
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

  if (!profileData || profileData.role !== 'broker') {
    redirect('/dashboard')
  }

  // Get broker
  const { data: brokerData } = await supabase
    .from('brokers')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  const broker = brokerData as Broker | null

  if (!broker) {
    redirect('/dashboard')
  }

  // Get all deals with vendor and stage info
  const { data: dealsData } = await supabase
    .from('deals')
    .select(`
      *,
      vendor:vendors(id, company_name),
      stage:kanban_stages(*)
    `)
    .eq('broker_id', broker.id)
    .order('created_at', { ascending: false })

  const deals = (dealsData || []) as unknown as DealWithRelations[]

  // Get all vendors with their deals
  const { data: vendorsData } = await supabase
    .from('vendors')
    .select(`
      *,
      deals(*)
    `)
    .eq('broker_id', broker.id)
    .order('created_at', { ascending: false })

  const vendors = (vendorsData || []) as unknown as VendorWithDeals[]

  // Get kanban stages
  const { data: stagesData } = await supabase
    .from('kanban_stages')
    .select('*')
    .eq('broker_id', broker.id)
    .order('position', { ascending: true })

  const stages = (stagesData || []) as KanbanStage[]

  // Get recent activity (limit to 20)
  const { data: activityData } = await supabase
    .from('activity_log')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const activities = (activityData || []) as ActivityLog[]

  return (
    <AnalyticsDashboard
      broker={broker}
      deals={deals}
      vendors={vendors}
      stages={stages}
      activities={activities}
    />
  )
}
