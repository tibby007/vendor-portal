import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, ArrowRight } from 'lucide-react'

interface Deal {
  id: string
  business_legal_name: string
  amount_requested: number
  financing_type: string
  created_at: string
  submitted_at: string | null
  stage: {
    name: string
  }
}

export default async function DealsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get vendor profile
  const { data: vendorData } = await supabase
    .from('vendors')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!vendorData) {
    redirect('/dashboard')
  }

  // Get deals
  const { data: dealsData } = await supabase
    .from('deals')
    .select(`
      id,
      business_legal_name,
      amount_requested,
      financing_type,
      created_at,
      submitted_at,
      stage:kanban_stages(name)
    `)
    .eq('vendor_id', vendorData.id)
    .order('created_at', { ascending: false })

  const deals = (dealsData || []) as unknown as Deal[]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
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

  const getFinancingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      equipment: 'Equipment',
      working_capital: 'Working Capital',
      both: 'Equipment + WC',
    }
    return labels[type] || type
  }

  // Separate draft vs submitted
  const drafts = deals.filter(d => !d.submitted_at)
  const submitted = deals.filter(d => d.submitted_at)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-500 mt-1">
            Track and manage your financing applications
          </p>
        </div>
        <Link href="/dashboard/deals/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Application
          </Button>
        </Link>
      </div>

      {/* Drafts */}
      {drafts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Drafts</CardTitle>
            <CardDescription>
              Applications in progress - click to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {drafts.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/dashboard/deals/${deal.id}/edit`}
                  className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-100 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{deal.business_legal_name || 'Untitled Application'}</p>
                    <p className="text-sm text-gray-500">
                      Started {formatDate(deal.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="bg-yellow-100">
                      Draft
                    </Badge>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submitted Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Submitted Applications</CardTitle>
          <CardDescription>
            {submitted.length} application{submitted.length !== 1 ? 's' : ''} submitted
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No applications submitted yet</p>
              <p className="text-sm mb-4">Start your first financing application</p>
              <Link href="/dashboard/deals/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Application
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {submitted.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/dashboard/deals/${deal.id}`}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{deal.business_legal_name}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{formatCurrency(deal.amount_requested)}</span>
                      <span>{getFinancingTypeLabel(deal.financing_type)}</span>
                      <span>Submitted {formatDate(deal.submitted_at!)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStageColor(deal.stage?.name || '')}>
                      {deal.stage?.name}
                    </Badge>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
