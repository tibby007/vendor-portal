import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Users, FileText, AlertCircle, Plus, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function BrokerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: broker } = await supabase
    .from('brokers')
    .select('id, company_name')
    .eq('profile_id', user.id)
    .single()

  if (!broker) {
    redirect('/login')
  }

  const [{ count: vendorCount }, { data: allDeals }, { count: newVendors }, { count: newSubmissions }] = await Promise.all([
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('broker_id', broker.id),
    supabase
      .from('deals')
      .select('id, created_at, stage:kanban_stages(name)', { count: 'exact' })
      .eq('broker_id', broker.id),
    supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true })
      .eq('broker_id', broker.id),
    supabase
      .from('deals')
      .select('*', { count: 'exact', head: true })
      .eq('broker_id', broker.id)
      .not('submitted_at', 'is', null),
  ])

  const deals = (allDeals || []) as Array<{ id: string; created_at: string; stage?: { name?: string } | null }>
  const requiringAction = deals.filter((deal) => deal.stage?.name === 'Docs Needed' || deal.stage?.name === 'Under Review').length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Broker Dashboard</h1>
          <p className="text-gray-600 mt-1">Invite vendors, monitor pipeline activity, and manage financing resources.</p>
        </div>
        <Link href="/broker/vendors/invite">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Invite Vendor
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardDescription>Total Vendors</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold">{vendorCount || 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Total Deals</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold">{deals.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Deals Requiring Action</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold text-orange-600">{requiringAction}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Submitted Deals</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold">{newSubmissions || 0}</p></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Pipeline Summary</CardTitle>
            <CardDescription>Snapshot of current deal flow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Deals in pipeline</span>
              <Badge variant="outline">{deals.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Deals requiring action</span>
              <Badge className="bg-orange-100 text-orange-800">{requiringAction}</Badge>
            </div>
            <Link href="/broker/pipeline" className="inline-flex items-center text-sm font-medium text-blue-700">
              Open pipeline
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Vendor Activity</CardTitle>
            <CardDescription>Recent vendor growth and submissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Registered vendors</span>
              <Badge variant="outline">{newVendors || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Submitted deals</span>
              <Badge variant="outline">{newSubmissions || 0}</Badge>
            </div>
            <div className="rounded-md border bg-amber-50 border-amber-200 p-3 text-sm text-amber-900 flex gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              Keep vendors active by sharing scripts and financing one-pagers in Templates/Resources.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
