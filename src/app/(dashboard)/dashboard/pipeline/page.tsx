import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { KanbanBoard } from '@/components/pipeline/KanbanBoard'
import type { KanbanStage, Deal, Vendor, Broker } from '@/types/database'

interface DealWithVendor extends Deal {
  vendor: Pick<Vendor, 'company_name'>
}

interface StageWithDeals extends KanbanStage {
  deals: DealWithVendor[]
}

export default async function PipelinePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Verify user is a broker
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'broker') {
    redirect('/dashboard')
  }

  // Get broker ID
  const { data: brokerData } = await supabase
    .from('brokers')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  const broker = brokerData as Pick<Broker, 'id'> | null

  if (!broker) {
    redirect('/dashboard')
  }

  // Fetch stages with their deals
  const { data: stagesData } = await supabase
    .from('kanban_stages')
    .select(`
      *,
      deals:deals(
        *,
        vendor:vendors(company_name)
      )
    `)
    .eq('broker_id', broker.id)
    .order('position', { ascending: true })

  const stages = (stagesData || []) as unknown as StageWithDeals[]

  // Sort deals within each stage by created_at
  const sortedStages = stages.map((stage) => ({
    ...stage,
    deals: stage.deals.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deal Pipeline</h1>
          <p className="text-gray-600">Drag and drop deals between stages to update their status</p>
        </div>
      </div>

      <KanbanBoard brokerId={broker.id} initialStages={sortedStages} />
    </div>
  )
}
