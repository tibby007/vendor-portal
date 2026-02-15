import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, CheckCircle2, FileText, Send, Wrench } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const firstRow = <T,>(value: T | T[] | null | undefined): T | undefined =>
  Array.isArray(value) ? value[0] : value || undefined

export default async function VendorDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, company_name, broker_id')
    .eq('profile_id', user.id)
    .single()

  if (!vendor) {
    redirect('/login')
  }

  const { data: brokerData } = vendor?.broker_id
    ? await supabase
        .from('brokers')
        .select('company_name, company_phone, profile:profiles(email)')
        .eq('id', vendor.broker_id)
        .single()
    : { data: null }

  const { data: deals } = await supabase
    .from('deals')
    .select('id, created_at, submitted_at, stage:kanban_stages(name, is_visible_to_vendor)')
    .eq('vendor_id', vendor.id)
    .order('created_at', { ascending: false })

  const typedDeals = (deals || []) as Array<{
    submitted_at: string | null
    stage?: { name?: string; is_visible_to_vendor?: boolean } | { name?: string; is_visible_to_vendor?: boolean }[] | null
  }>
  const broker = firstRow(brokerData)
  const brokerProfile = firstRow(broker?.profile)
  const submittedCount = typedDeals.filter((deal) => Boolean(deal.submitted_at)).length
  const actionableCount = typedDeals.filter((deal) => firstRow(deal.stage)?.name === 'Docs Needed').length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="text-gray-600 mt-1">Submit deals, upload documents, track status, and use financing tools for your sales team.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/vendor/submit-deal"><Button><Send className="h-4 w-4 mr-2" />Submit Deal</Button></Link>
          <Link href="/vendor/my-deals"><Button variant="outline">View Deal Status</Button></Link>
        </div>
      </div>

      <Card className="border-blue-100 bg-blue-50">
        <CardHeader>
          <CardTitle>Your Broker</CardTitle>
          <CardDescription>{broker?.company_name || 'Broker'} is supporting your financing submissions.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-blue-900 space-y-1">
          <p>Invited by: {broker?.company_name || 'Your Broker'}</p>
          <p>Support: {broker?.company_phone || brokerProfile?.email || 'Contact your broker'}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardDescription>Submitted Deals</CardDescription></CardHeader><CardContent><p className="text-2xl font-bold">{submittedCount}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Need Documents</CardDescription></CardHeader><CardContent><p className="text-2xl font-bold text-orange-600">{actionableCount}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Total Deals</CardDescription></CardHeader><CardContent><p className="text-2xl font-bold">{typedDeals.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started Checklist</CardTitle>
          <CardDescription>Use this quick checklist to launch dealer financing inside your sales process.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-600" />Complete dealer profile (optional)</div>
            <Badge variant="outline">Optional</Badge>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-2"><Send className="h-4 w-4 text-blue-600" />Submit first deal</div>
            <Link href="/vendor/submit-deal" className="text-blue-700 inline-flex items-center">Go<ArrowRight className="h-4 w-4 ml-1" /></Link>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-2"><Wrench className="h-4 w-4 text-blue-600" />Use buyer scripts</div>
            <Link href="/vendor/dealer-tools" className="text-blue-700 inline-flex items-center">Open tools<ArrowRight className="h-4 w-4 ml-1" /></Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/vendor/my-deals">
          <Card className="hover:shadow-sm transition-shadow h-full">
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />View Deal Status</CardTitle></CardHeader>
            <CardContent className="text-sm text-gray-600">Track current stages and next actions on your submitted deals.</CardContent>
          </Card>
        </Link>
        <Link href="/vendor/dealer-tools">
          <Card className="hover:shadow-sm transition-shadow h-full">
            <CardHeader><CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5" />Dealer Tools</CardTitle></CardHeader>
            <CardContent className="text-sm text-gray-600">Buyer scripts, one-pager, and shareable pre-qual links for your sales team.</CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
