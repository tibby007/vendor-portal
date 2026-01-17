import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Building,
  User,
  DollarSign,
  MessageSquare,
  Clock,
  Edit,
} from 'lucide-react'
import { DealStageSelector } from '@/components/deals/DealStageSelector'
import { DocumentSection } from '@/components/deals/DocumentSection'
import { DealNotes } from '@/components/deals/DealNotes'

interface DealPageProps {
  params: Promise<{ id: string }>
}

interface Deal {
  id: string
  vendor_id: string
  broker_id: string
  stage_id: string
  business_legal_name: string
  business_dba: string | null
  business_address: string
  business_phone: string
  business_email: string
  business_ein: string
  business_established_date: string | null
  entity_type: string
  state_of_incorporation: string | null
  industry: string | null
  annual_revenue: number | null
  owner_full_name: string
  owner_title: string | null
  owner_ownership_percentage: number | null
  owner_address: string | null
  owner_dob: string | null
  owner_phone: string | null
  amount_requested: number
  financing_type: string
  equipment_description: string | null
  equipment_vendor_name: string | null
  is_new_equipment: boolean | null
  preferred_term_months: number | null
  use_of_funds: string | null
  created_at: string
  submitted_at: string | null
  stage: {
    id: string
    name: string
    description: string | null
  }
  vendor: {
    id: string
    company_name: string
    profile: {
      first_name: string | null
      last_name: string | null
      email: string
      phone: string | null
    }
  }
}

interface Document {
  id: string
  file_name: string
  file_path: string
  document_category: string
  status: string
  notes: string | null
  created_at: string
  reviewed_at: string | null
}

interface KanbanStage {
  id: string
  name: string
  position: number
}

export default async function DealDetailPage({ params }: DealPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get user's profile and role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isBroker = profile?.role === 'broker'

  let deal: Deal | null = null
  let stages: KanbanStage[] = []

  if (isBroker) {
    // Get broker ID
    const { data: brokerData } = await supabase
      .from('brokers')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!brokerData) {
      redirect('/dashboard')
    }

    // Get deal as broker
    const { data: dealData } = await supabase
      .from('deals')
      .select(`
        *,
        stage:kanban_stages(id, name, description),
        vendor:vendors(
          id,
          company_name,
          profile:profiles(first_name, last_name, email, phone)
        )
      `)
      .eq('id', id)
      .eq('broker_id', brokerData.id)
      .single()

    if (!dealData) {
      notFound()
    }

    deal = dealData as unknown as Deal

    // Get all stages for stage selector
    const { data: stagesData } = await supabase
      .from('kanban_stages')
      .select('id, name, position')
      .eq('broker_id', brokerData.id)
      .order('position', { ascending: true })

    stages = (stagesData || []) as KanbanStage[]
  } else {
    // Get vendor profile
    const { data: vendorData } = await supabase
      .from('vendors')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!vendorData) {
      redirect('/dashboard')
    }

    // Get deal as vendor
    const { data: dealData } = await supabase
      .from('deals')
      .select(`
        *,
        stage:kanban_stages(id, name, description),
        vendor:vendors(
          id,
          company_name,
          profile:profiles(first_name, last_name, email, phone)
        )
      `)
      .eq('id', id)
      .eq('vendor_id', vendorData.id)
      .single()

    if (!dealData) {
      notFound()
    }

    deal = dealData as unknown as Deal
  }

  // Get documents
  const { data: docsData } = await supabase
    .from('deal_documents')
    .select('id, file_name, file_path, document_category, status, notes, created_at, reviewed_at')
    .eq('deal_id', id)
    .order('created_at', { ascending: false })

  const documents = (docsData || []) as Document[]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getStageColor = (stageName: string) => {
    const colors: Record<string, string> = {
      'New Submission': 'bg-blue-100 text-blue-800',
      'Under Review': 'bg-yellow-100 text-yellow-800',
      'Docs Needed': 'bg-orange-100 text-orange-800',
      'Submitted to Lender': 'bg-purple-100 text-purple-800',
      'Approved': 'bg-green-100 text-green-800',
      'Docs Out': 'bg-teal-100 text-teal-800',
      'Funded': 'bg-emerald-100 text-emerald-800',
      'Declined': 'bg-red-100 text-red-800',
      'On Hold': 'bg-gray-100 text-gray-800',
    }
    return colors[stageName] || 'bg-gray-100 text-gray-800'
  }

  const entityTypeLabels: Record<string, string> = {
    llc: 'LLC',
    corporation: 'Corporation',
    sole_proprietorship: 'Sole Proprietorship',
    partnership: 'Partnership',
    other: 'Other',
  }

  const financingTypeLabels: Record<string, string> = {
    equipment: 'Equipment Financing',
    working_capital: 'Working Capital',
    both: 'Both',
  }

  const backLink = isBroker ? '/dashboard/pipeline' : '/dashboard/deals'
  const backLabel = isBroker ? 'Back to Pipeline' : 'Back to Applications'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={backLink}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {backLabel}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{deal.business_legal_name}</h1>
          <div className="flex items-center space-x-4 mt-2">
            {isBroker ? (
              <DealStageSelector
                dealId={deal.id}
                currentStageId={deal.stage_id}
                stages={stages}
              />
            ) : (
              <Badge className={getStageColor(deal.stage?.name || '')}>
                {deal.stage?.name}
              </Badge>
            )}
            <span className="text-sm text-gray-500">
              Submitted {formatDate(deal.submitted_at || deal.created_at)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/deals/${id}/messages`}>
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </Button>
          </Link>
          {!isBroker && (
            <Link href={`/dashboard/deals/${id}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Status Banner for Vendors */}
      {!isBroker && deal.stage?.name === 'Docs Needed' && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <p className="font-medium text-orange-800">Additional Documents Required</p>
              <p className="text-sm text-orange-700 mt-1">
                Please upload the requested documents to continue processing your application.
              </p>
              <Link href={`/dashboard/deals/${id}/edit`}>
                <Button size="sm" className="mt-2">
                  Upload Documents
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Info Card (Broker view only) */}
      {isBroker && deal.vendor && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                  <Building className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">{deal.vendor.company_name}</p>
                  <p className="text-sm text-blue-700">
                    {deal.vendor.profile?.first_name} {deal.vendor.profile?.last_name} - {deal.vendor.profile?.email}
                  </p>
                </div>
              </div>
              {deal.vendor.profile?.phone && (
                <p className="text-sm text-blue-700">{deal.vendor.profile.phone}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Building className="h-5 w-5 mr-2 text-blue-500" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Legal Name</span>
                  <p className="font-medium">{deal.business_legal_name}</p>
                </div>
                {deal.business_dba && (
                  <div>
                    <span className="text-gray-500">DBA</span>
                    <p className="font-medium">{deal.business_dba}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <span className="text-gray-500">Address</span>
                  <p className="font-medium">{deal.business_address}</p>
                </div>
                <div>
                  <span className="text-gray-500">Phone</span>
                  <p className="font-medium">{deal.business_phone}</p>
                </div>
                <div>
                  <span className="text-gray-500">Email</span>
                  <p className="font-medium">{deal.business_email}</p>
                </div>
                <div>
                  <span className="text-gray-500">EIN</span>
                  <p className="font-medium">{deal.business_ein}</p>
                </div>
                <div>
                  <span className="text-gray-500">Entity Type</span>
                  <p className="font-medium">{entityTypeLabels[deal.entity_type] || deal.entity_type}</p>
                </div>
                {deal.industry && (
                  <div>
                    <span className="text-gray-500">Industry</span>
                    <p className="font-medium">{deal.industry}</p>
                  </div>
                )}
                {deal.annual_revenue && (
                  <div>
                    <span className="text-gray-500">Annual Revenue</span>
                    <p className="font-medium">{formatCurrency(deal.annual_revenue)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Owner Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2 text-purple-500" />
                Owner/Guarantor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Full Name</span>
                  <p className="font-medium">{deal.owner_full_name}</p>
                </div>
                {deal.owner_title && (
                  <div>
                    <span className="text-gray-500">Title</span>
                    <p className="font-medium">{deal.owner_title}</p>
                  </div>
                )}
                {deal.owner_ownership_percentage && (
                  <div>
                    <span className="text-gray-500">Ownership</span>
                    <p className="font-medium">{deal.owner_ownership_percentage}%</p>
                  </div>
                )}
                {deal.owner_phone && (
                  <div>
                    <span className="text-gray-500">Phone</span>
                    <p className="font-medium">{deal.owner_phone}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Financing Request */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                Financing Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Amount Requested</span>
                  <p className="font-medium text-xl">{formatCurrency(deal.amount_requested)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Financing Type</span>
                  <p className="font-medium">{financingTypeLabels[deal.financing_type] || deal.financing_type}</p>
                </div>
                {deal.preferred_term_months && (
                  <div>
                    <span className="text-gray-500">Preferred Term</span>
                    <p className="font-medium">{deal.preferred_term_months} months</p>
                  </div>
                )}
              </div>

              {deal.equipment_description && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <span className="text-sm text-gray-500">Equipment Description</span>
                    <p className="text-sm">{deal.equipment_description}</p>
                    {deal.equipment_vendor_name && (
                      <p className="text-sm">
                        <span className="text-gray-500">Vendor:</span> {deal.equipment_vendor_name}
                      </p>
                    )}
                  </div>
                </>
              )}

              {deal.use_of_funds && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <span className="text-sm text-gray-500">Use of Funds</span>
                    <p className="text-sm">{deal.use_of_funds}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Documents */}
          <DocumentSection
            dealId={id}
            isBroker={isBroker}
            initialDocuments={documents}
          />

          {/* Deal Notes */}
          <DealNotes dealId={id} isBroker={isBroker} />
        </div>
      </div>
    </div>
  )
}
