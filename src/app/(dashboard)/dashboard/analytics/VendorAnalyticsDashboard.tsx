'use client'

import { useState, useMemo } from 'react'
import {
  StatCard,
  DateRangeFilter,
  DealVolumeChart,
  ConversionChart,
} from '@/components/analytics'
import type { DateRange } from '@/components/analytics'
import { AverageFundingTimeChart } from '@/components/analytics/AverageFundingTimeChart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  XCircle,
} from 'lucide-react'
import type { Vendor, Deal, KanbanStage, ActivityLog } from '@/types/database'

interface DealWithStage extends Deal {
  stage: KanbanStage
}

interface VendorAnalyticsDashboardProps {
  vendor: Vendor
  deals: DealWithStage[]
  activities: ActivityLog[]
}

export function VendorAnalyticsDashboard({
  vendor,
  deals,
  activities,
}: VendorAnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange>('30d')

  const filterByDateRange = (date: string): boolean => {
    if (dateRange === 'all') return true
    const itemDate = new Date(date)
    const now = new Date()
    const daysMap: Record<string, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '12m': 365,
    }
    const days = daysMap[dateRange] || 30
    const cutoff = new Date(now.setDate(now.getDate() - days))
    return itemDate >= cutoff
  }

  const filteredDeals = useMemo(
    () => deals.filter((deal) => filterByDateRange(deal.created_at)),
    [deals, dateRange]
  )

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalDeals = filteredDeals.length
    const fundedDeals = filteredDeals.filter(
      (d) => d.stage.name.toLowerCase().includes('funded')
    )
    const approvedDeals = filteredDeals.filter(
      (d) => d.stage.name.toLowerCase().includes('approved') ||
             d.stage.name.toLowerCase().includes('docs out') ||
             d.stage.name.toLowerCase().includes('funded')
    )
    const declinedDeals = filteredDeals.filter(
      (d) => d.stage.name.toLowerCase().includes('declined')
    )
    const activeDeals = filteredDeals.filter(
      (d) =>
        !d.stage.name.toLowerCase().includes('funded') &&
        !d.stage.name.toLowerCase().includes('declined')
    )

    const totalVolume = filteredDeals.reduce(
      (sum, d) => sum + (d.amount_requested || 0),
      0
    )
    const fundedVolume = fundedDeals.reduce(
      (sum, d) => sum + (d.amount_requested || 0),
      0
    )

    // Calculate approval rate (approved or beyond / total non-pending)
    const completedDeals = filteredDeals.filter(
      (d) =>
        d.stage.name.toLowerCase().includes('funded') ||
        d.stage.name.toLowerCase().includes('declined') ||
        d.stage.name.toLowerCase().includes('approved')
    )
    const approvalRate =
      completedDeals.length > 0
        ? ((approvedDeals.length / completedDeals.length) * 100).toFixed(1)
        : '0'

    // Calculate average funding time (days from submission to funded)
    const fundedDealsWithTime = fundedDeals.filter(
      (d) => d.submitted_at
    )
    const totalFundingDays = fundedDealsWithTime.reduce((sum, d) => {
      const submittedDate = new Date(d.submitted_at!)
      const fundedDate = new Date(d.updated_at)
      const days = Math.ceil(
        (fundedDate.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      return sum + Math.max(days, 1)
    }, 0)
    const avgFundingTime =
      fundedDealsWithTime.length > 0
        ? Math.round(totalFundingDays / fundedDealsWithTime.length)
        : 0

    const conversionRate =
      totalDeals > 0 ? ((fundedDeals.length / totalDeals) * 100).toFixed(1) : '0'

    return {
      totalDeals,
      fundedDeals: fundedDeals.length,
      approvedDeals: approvedDeals.length,
      declinedDeals: declinedDeals.length,
      activeDeals: activeDeals.length,
      totalVolume,
      fundedVolume,
      approvalRate,
      conversionRate,
      avgFundingTime,
    }
  }, [filteredDeals])

  // Submission history chart data (group by month)
  const submissionHistoryData = useMemo(() => {
    const monthlyData: Record<string, { submitted: number; funded: number; declined: number }> = {}

    filteredDeals.forEach((deal) => {
      const date = new Date(deal.created_at)
      const monthKey = date.toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      })

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { submitted: 0, funded: 0, declined: 0 }
      }

      monthlyData[monthKey].submitted++

      if (deal.stage.name.toLowerCase().includes('funded')) {
        monthlyData[monthKey].funded++
      }
      if (deal.stage.name.toLowerCase().includes('declined')) {
        monthlyData[monthKey].declined++
      }
    })

    return Object.entries(monthlyData)
      .map(([period, data]) => ({
        period,
        ...data,
      }))
      .slice(-12)
  }, [filteredDeals])

  // Conversion funnel data
  const conversionData = useMemo(() => {
    const totalDeals = filteredDeals.length
    if (totalDeals === 0) return []

    const underReview = filteredDeals.filter(
      (d) =>
        d.stage.name.toLowerCase().includes('review') ||
        d.stage.name.toLowerCase().includes('submitted') ||
        d.stage.name.toLowerCase().includes('approved') ||
        d.stage.name.toLowerCase().includes('docs out') ||
        d.stage.name.toLowerCase().includes('funded')
    ).length

    const approved = filteredDeals.filter(
      (d) =>
        d.stage.name.toLowerCase().includes('approved') ||
        d.stage.name.toLowerCase().includes('docs out') ||
        d.stage.name.toLowerCase().includes('funded')
    ).length

    const funded = filteredDeals.filter((d) =>
      d.stage.name.toLowerCase().includes('funded')
    ).length

    return [
      {
        name: 'Submitted',
        count: totalDeals,
        percentage: 100,
      },
      {
        name: 'Under Review',
        count: underReview,
        percentage: Math.round((underReview / totalDeals) * 100),
      },
      {
        name: 'Approved',
        count: approved,
        percentage: Math.round((approved / totalDeals) * 100),
      },
      {
        name: 'Funded',
        count: funded,
        percentage: Math.round((funded / totalDeals) * 100),
      },
    ]
  }, [filteredDeals])

  // Average funding time by month
  const fundingTimeData = useMemo(() => {
    const monthlyData: Record<string, { totalDays: number; count: number }> = {}

    filteredDeals
      .filter(
        (d) =>
          d.stage.name.toLowerCase().includes('funded') && d.submitted_at
      )
      .forEach((deal) => {
        const fundedDate = new Date(deal.updated_at)
        const monthKey = fundedDate.toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        })

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { totalDays: 0, count: 0 }
        }

        const submittedDate = new Date(deal.submitted_at!)
        const days = Math.ceil(
          (fundedDate.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        monthlyData[monthKey].totalDays += Math.max(days, 1)
        monthlyData[monthKey].count++
      })

    return Object.entries(monthlyData)
      .map(([period, data]) => ({
        period,
        days: data.count > 0 ? Math.round(data.totalDays / data.count) : 0,
      }))
      .slice(-12)
  }, [filteredDeals])

  // Recent activity formatted
  const recentDeals = useMemo(() => {
    return filteredDeals
      .slice(0, 5)
      .map((deal) => ({
        id: deal.id,
        business_name: deal.business_legal_name,
        amount: deal.amount_requested,
        stage: deal.stage.name,
        created_at: deal.created_at,
      }))
  }, [filteredDeals])

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value}`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">
            Track your deal submissions and performance
          </p>
        </div>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Submissions"
          value={metrics.totalDeals}
          icon={FileText}
          description="deals submitted"
        />
        <StatCard
          title="Funded Deals"
          value={metrics.fundedDeals}
          icon={CheckCircle}
          description={`${metrics.conversionRate}% funded`}
        />
        <StatCard
          title="Approval Rate"
          value={`${metrics.approvalRate}%`}
          icon={TrendingUp}
          description="of completed deals"
        />
        <StatCard
          title="Avg Funding Time"
          value={metrics.avgFundingTime > 0 ? `${metrics.avgFundingTime} days` : 'N/A'}
          icon={Clock}
          description="submission to funding"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Deals"
          value={metrics.activeDeals}
          icon={Clock}
          description="in pipeline"
        />
        <StatCard
          title="Declined"
          value={metrics.declinedDeals}
          icon={XCircle}
          description="deals declined"
        />
        <StatCard
          title="Total Requested"
          value={formatCurrency(metrics.totalVolume)}
          icon={DollarSign}
          description="financing requested"
        />
        <StatCard
          title="Total Funded"
          value={formatCurrency(metrics.fundedVolume)}
          icon={DollarSign}
          description="amount funded"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DealVolumeChart
          data={submissionHistoryData}
          title="Submission History"
          description="Your deals submitted, funded, and declined over time"
        />
        <ConversionChart
          stages={conversionData}
          title="Your Deal Pipeline"
          description="Conversion rates through deal stages"
        />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AverageFundingTimeChart data={fundingTimeData} />

        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>Your latest deal submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentDeals.length > 0 ? (
              <div className="space-y-4">
                {recentDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {deal.business_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(deal.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 text-sm">
                        {formatCurrency(deal.amount)}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          deal.stage.toLowerCase().includes('funded')
                            ? 'bg-green-100 text-green-700'
                            : deal.stage.toLowerCase().includes('declined')
                            ? 'bg-red-100 text-red-700'
                            : deal.stage.toLowerCase().includes('approved')
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {deal.stage}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No submissions in this time period
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
