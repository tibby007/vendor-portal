import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface PipelinePageProps {
  searchParams: Promise<{ vendor?: string; stage?: string }>
}

export default async function BrokerPipelinePage({ searchParams }: PipelinePageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: broker } = await supabase.from('brokers').select('id').eq('profile_id', user.id).single()
  if (!broker) redirect('/login')

  const [{ data: vendorList }, { data: stageList }] = await Promise.all([
    supabase.from('vendors').select('id, company_name').eq('broker_id', broker.id).order('company_name'),
    supabase.from('kanban_stages').select('id, name').eq('broker_id', broker.id).order('position'),
  ])

  let dealsQuery = supabase
    .from('deals')
    .select('id, business_legal_name, amount_requested, created_at, vendor:vendors(company_name), stage:kanban_stages(id, name)')
    .eq('broker_id', broker.id)
    .not('submitted_at', 'is', null)
    .order('created_at', { ascending: false })

  if (params.vendor) {
    dealsQuery = dealsQuery.eq('vendor_id', params.vendor)
  }
  if (params.stage) {
    dealsQuery = dealsQuery.eq('stage_id', params.stage)
  }

  const { data: deals } = await dealsQuery

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
        <p className="text-gray-600">All deals with vendor and stage filters.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter by vendor and stage</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-3" action="/broker/pipeline" method="get">
            <select name="vendor" defaultValue={params.vendor || ''} className="h-10 rounded-md border px-3 text-sm">
              <option value="">All vendors</option>
              {vendorList?.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.company_name}</option>)}
            </select>
            <select name="stage" defaultValue={params.stage || ''} className="h-10 rounded-md border px-3 text-sm">
              <option value="">All stages</option>
              {stageList?.map((stage) => <option key={stage.id} value={stage.id}>{stage.name}</option>)}
            </select>
            <Button type="submit">Apply Filters</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deals</CardTitle>
          <CardDescription>{deals?.length || 0} matching deal(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {!deals?.length ? (
            <p className="text-sm text-gray-500">No deals match this filter.</p>
          ) : (
            <div className="space-y-3">
              {deals.map((deal) => (
                <div key={deal.id} className="rounded-md border p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{deal.business_legal_name}</p>
                    <p className="text-sm text-gray-500">{deal.vendor?.company_name || 'Unknown vendor'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(Number(deal.amount_requested || 0))}</p>
                    <Badge variant="outline">{deal.stage?.name || 'Unknown stage'}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Link href="/broker/reports" className="text-sm text-blue-700">Open reports</Link>
    </div>
  )
}
