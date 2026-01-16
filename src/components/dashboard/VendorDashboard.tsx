'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Clock, CheckCircle, Plus, ArrowRight } from 'lucide-react'
import type { Vendor, Broker, Deal, KanbanStage } from '@/types/database'

interface DealWithStage extends Deal {
  stage: Pick<KanbanStage, 'name' | 'is_visible_to_vendor'>
}

interface VendorDashboardProps {
  vendor: Vendor & { broker: Broker }
  deals: DealWithStage[]
}

export function VendorDashboard({ vendor, deals }: VendorDashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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

  const activeDeals = deals.filter(
    (d) => !['Funded', 'Declined'].includes(d.stage?.name || '')
  )
  const completedDeals = deals.filter(
    (d) => d.stage?.name === 'Funded'
  )
  const pendingDocsDeals = deals.filter(
    (d) => d.stage?.name === 'Docs Needed'
  )

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {vendor.company_name}
          </h1>
          <p className="text-gray-500 mt-1">
            Broker: {vendor.broker.company_name}
          </p>
        </div>
        <Link href="/dashboard/deals/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Application
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Applications</p>
                <p className="text-2xl font-bold">{activeDeals.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Docs Needed</p>
                <p className="text-2xl font-bold">{pendingDocsDeals.length}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Funded Deals</p>
                <p className="text-2xl font-bold">{completedDeals.length}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deals requiring attention */}
      {pendingDocsDeals.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">Action Required</CardTitle>
            <CardDescription className="text-orange-700">
              The following applications need additional documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingDocsDeals.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/dashboard/deals/${deal.id}`}
                  className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
                >
                  <div>
                    <p className="font-medium">{deal.business_legal_name}</p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(Number(deal.amount_requested))} • Submitted {formatDate(deal.created_at)}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Deals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Applications</CardTitle>
            <CardDescription>Track the status of your submitted deals</CardDescription>
          </div>
          <Link href="/dashboard/deals">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {deals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No applications yet</p>
              <p className="text-sm mb-4">Submit your first financing application to get started</p>
              <Link href="/dashboard/deals/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Application
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {deals.slice(0, 5).map((deal) => (
                <Link
                  key={deal.id}
                  href={`/dashboard/deals/${deal.id}`}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{deal.business_legal_name}</p>
                    <p className="text-sm text-gray-500">
                      Submitted {formatDate(deal.created_at)}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-medium">{formatCurrency(Number(deal.amount_requested))}</p>
                    <Badge className={getStageColor(deal.stage?.name || '')}>
                      {deal.stage?.name}
                    </Badge>
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
