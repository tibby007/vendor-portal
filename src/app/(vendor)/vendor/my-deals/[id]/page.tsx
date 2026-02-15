import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function VendorDealDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, broker:brokers(company_name)')
    .eq('profile_id', user.id)
    .single()

  if (!vendor) redirect('/vendor')

  const { data: deal } = await supabase
    .from('deals')
    .select('id, business_legal_name, amount_requested, financing_type, created_at, submitted_at, stage:kanban_stages(name, is_visible_to_vendor)')
    .eq('id', id)
    .eq('vendor_id', vendor.id)
    .single()

  if (!deal) notFound()

  const visibleStage = deal.stage?.is_visible_to_vendor ? deal.stage?.name : 'In Progress'
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)

  return (
    <div className="space-y-6">
      <div>
        <Link href="/vendor/my-deals" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to My Deals
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{deal.business_legal_name}</h1>
        <p className="text-gray-600">Your Broker: {vendor.broker?.company_name || 'Broker'}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deal Status</CardTitle>
          <CardDescription>Visible stage and summary details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between"><span className="text-gray-600">Stage</span><Badge>{visibleStage || 'In Progress'}</Badge></div>
          <div className="flex items-center justify-between"><span className="text-gray-600">Requested amount</span><span className="font-medium">{formatCurrency(Number(deal.amount_requested || 0))}</span></div>
          <div className="flex items-center justify-between"><span className="text-gray-600">Financing type</span><span className="font-medium">{deal.financing_type}</span></div>
          <div className="flex items-center justify-between"><span className="text-gray-600">Submitted</span><span className="font-medium">{deal.submitted_at ? 'Yes' : 'Draft'}</span></div>
        </CardContent>
      </Card>
    </div>
  )
}
