import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function BrokerReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: broker } = await supabase.from('brokers').select('id').eq('profile_id', user.id).single()
  if (!broker) redirect('/login')

  const [{ count: submissions }, { data: dealStages }] = await Promise.all([
    supabase.from('deals').select('*', { count: 'exact', head: true }).eq('broker_id', broker.id).not('submitted_at', 'is', null),
    supabase.from('deals').select('stage:kanban_stages(name)').eq('broker_id', broker.id).not('submitted_at', 'is', null),
  ])

  const stages = (dealStages || []) as Array<{ stage?: { name?: string } | null }>
  const approvals = stages.filter((row) => row.stage?.name === 'Approved').length
  const fundings = stages.filter((row) => row.stage?.name === 'Funded').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Lightweight production metrics for submissions and outcomes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardDescription>Submissions</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold">{submissions || 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Approvals</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold">{approvals}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Fundings</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold">{fundings}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Note</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          If some metrics are unavailable in your dataset, this page can be extended with placeholders labeled &quot;Coming soon.&quot;
        </CardContent>
      </Card>
    </div>
  )
}
