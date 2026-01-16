'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, FileText, DollarSign, TrendingUp, Plus, ArrowRight } from 'lucide-react'
import type { Broker, Deal, KanbanStage, Vendor } from '@/types/database'

interface RecentDeal extends Deal {
  vendor: Pick<Vendor, 'company_name'>
  stage: Pick<KanbanStage, 'name'>
}

interface BrokerDashboardProps {
  broker: Broker
  vendorCount: number
  dealCount: number
  recentDeals: RecentDeal[]
}

export function BrokerDashboard({
  broker,
  vendorCount,
  dealCount,
  recentDeals,
}: BrokerDashboardProps) {
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

  const totalPipelineValue = recentDeals.reduce(
    (sum, deal) => sum + Number(deal.amount_requested),
    0
  )

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {broker.company_name}
          </h1>
          <p className="text-gray-500 mt-1">
            Here&apos;s what&apos;s happening with your deals today
          </p>
        </div>
        <Link href="/dashboard/vendors/invite">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Invite Vendor
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Vendors</p>
                <p className="text-2xl font-bold">{vendorCount}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Deals</p>
                <p className="text-2xl font-bold">{dealCount}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pipeline Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPipelineValue)}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Conversion Rate</p>
                <p className="text-2xl font-bold">--</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Deals & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Deals */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Deals</CardTitle>
              <CardDescription>Your latest submitted applications</CardDescription>
            </div>
            <Link href="/dashboard/pipeline">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentDeals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No deals yet</p>
                <p className="text-sm">Deals will appear here once vendors submit applications</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{deal.business_legal_name}</p>
                      <p className="text-sm text-gray-500">{deal.vendor?.company_name}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-medium">{formatCurrency(Number(deal.amount_requested))}</p>
                      <Badge className={getStageColor(deal.stage?.name || '')}>
                        {deal.stage?.name}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/vendors/invite" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Invite New Vendor
              </Button>
            </Link>
            <Link href="/dashboard/pipeline" className="block">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                View Pipeline
              </Button>
            </Link>
            <Link href="/dashboard/resources" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
