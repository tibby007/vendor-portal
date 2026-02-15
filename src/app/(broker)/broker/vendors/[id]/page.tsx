import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Building2, Mail, Phone, CalendarDays, FileText, DollarSign } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BrokerVendorDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: broker } = await supabase
    .from('brokers')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!broker) redirect('/login')

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, company_name, company_phone, company_address, status, created_at, profile:profiles(first_name, last_name, email, phone)')
    .eq('id', id)
    .eq('broker_id', broker.id)
    .single()

  if (!vendor) notFound()

  const { data: deals } = await supabase
    .from('deals')
    .select('id, amount_requested, submitted_at, stage:kanban_stages(name)')
    .eq('vendor_id', vendor.id)

  const typedDeals = (deals || []) as Array<{
    amount_requested: number | null
    submitted_at: string | null
    stage?: { name?: string } | { name?: string }[] | null
  }>

  const submittedCount = typedDeals.filter((deal) => Boolean(deal.submitted_at)).length
  const fundedCount = typedDeals.filter((deal) => {
    if (!deal.stage) return false
    const stage = Array.isArray(deal.stage) ? deal.stage[0] : deal.stage
    return stage?.name === 'Funded'
  }).length
  const totalVolume = typedDeals.reduce((sum, deal) => sum + Number(deal.amount_requested || 0), 0)

  const profile = Array.isArray(vendor.profile) ? vendor.profile[0] : vendor.profile

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="space-y-6">
      <div>
        <Link href="/broker/vendors" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Vendors
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{vendor.company_name}</h1>
        <p className="text-gray-600">Dealer contact card and activity summary</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" />Dealer Contact Card</CardTitle>
            <CardDescription>Primary contact and company details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-medium">{vendor.company_name}</p>
              <Badge variant="outline">{vendor.status}</Badge>
            </div>
            <div className="text-sm text-gray-600 space-y-2">
              <p className="flex items-center gap-2"><Mail className="h-4 w-4" />{profile?.email || 'No email on file'}</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4" />{vendor.company_phone || profile?.phone || 'No phone on file'}</p>
              {vendor.company_address && <p>{vendor.company_address}</p>}
              <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />Joined {formatDate(vendor.created_at)}</p>
              <p>
                Contact: {[profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'No contact name on file'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
            <CardDescription>Deal pipeline stats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between"><span className="text-gray-600 inline-flex items-center gap-1"><FileText className="h-4 w-4" />Submitted</span><span className="font-semibold">{submittedCount}</span></div>
            <div className="flex items-center justify-between"><span className="text-gray-600">Funded</span><span className="font-semibold">{fundedCount}</span></div>
            <div className="flex items-center justify-between"><span className="text-gray-600 inline-flex items-center gap-1"><DollarSign className="h-4 w-4" />Volume</span><span className="font-semibold">{formatCurrency(totalVolume)}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
