'use client'

import { useState, useMemo } from 'react'
import {
  StatCard,
  DateRangeFilter,
  DealVolumeChart,
  FundingAmountChart,
  PipelineChart,
  ConversionChart,
  VendorActivityTable,
  RecentActivity,
} from '@/components/analytics'
import type { DateRange } from '@/components/analytics'
import {
  DollarSign,
  FileText,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
} from 'lucide-react'
import type { Broker, Deal, Vendor, KanbanStage, ActivityLog } from '@/types/database'

interface DealWithRelations extends Deal {
  vendor: Pick<Vendor, 'id' | 'company_name'>
  stage: KanbanStage
}

interface VendorWithDeals extends Vendor {
  deals: Deal[]
}

interface AnalyticsDashboardProps {
  broker: Broker
  deals: DealWithRelations[]
  vendors: VendorWithDeals[]
  stages: KanbanStage[]
  activities: ActivityLog[]
}

const STAGE_COLORS: Record<string, string> = {
  'New Submission': '#3b82f6',
  'Under Review': '#f59e0b',
  'Docs Needed': '#ef4444',
  'Submitted to Lender': '#8b5cf6',
  'Approved': '#22c55e',
  'Docs Out': '#06b6d4',
  'Funded': '#10b981',
  'Declined': '#dc2626',
  'On Hold': '#6b7280',
}

const getStageColor = (stageName: string): string => {
  return STAGE_COLORS[stageName] || '#6b7280'
}

export function AnalyticsDashboard({
  broker,
  deals,
  vendors,
  stages,
  activities,
}: AnalyticsDashboardProps) {
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

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalDeals = filteredDeals.length
    const fundedDeals = filteredDeals.filter(
      (d) => d.stage.name.toLowerCase().includes('funded')
    )
    const approvedDeals = filteredDeals.filter(
      (d) => d.stage.name.toLowerCase().includes('approved')
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

    const conversionRate =
      totalDeals > 0 ? ((fundedDeals.length / totalDeals) * 100).toFixed(1) : '0'
    const avgDealSize =
      totalDeals > 0 ? Math.round(totalVolume / totalDeals) : 0

    return {
      totalDeals,
      fundedDeals: fundedDeals.length,
      approvedDeals: approvedDeals.length,
      declinedDeals: declinedDeals.length,
      activeDeals: activeDeals.length,
      totalVolume,
      fundedVolume,
      conversionRate,
      avgDealSize,
      activeVendors: vendors.filter((v) => v.status === 'active').length,
    }
  }, [filteredDeals, vendors])

  // Deal volume chart data (group by month)
  const dealVolumeData = useMemo(() => {
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
      .slice(-12) // Last 12 months
  }, [filteredDeals])

  // Funding amount chart data
  const fundingAmountData = useMemo(() => {
    const monthlyData: Record<string, number> = {}

    filteredDeals
      .filter((d) => d.stage.name.toLowerCase().includes('funded'))
      .forEach((deal) => {
        const date = new Date(deal.created_at)
        const monthKey = date.toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        })

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = 0
        }
        monthlyData[monthKey] += deal.amount_requested || 0
      })

    return Object.entries(monthlyData)
      .map(([period, amount]) => ({
        period,
        amount,
      }))
      .slice(-12)
  }, [filteredDeals])

  // Pipeline distribution data
  const pipelineData = useMemo(() => {
    const stageCount: Record<string, number> = {}

    filteredDeals.forEach((deal) => {
      const stageName = deal.stage.name
      if (!stageCount[stageName]) {
        stageCount[stageName] = 0
      }
      stageCount[stageName]++
    })

    return stages
      .filter((stage) => stageCount[stage.name])
      .map((stage) => ({
        name: stage.name,
        value: stageCount[stage.name] || 0,
        color: getStageColor(stage.name),
      }))
  }, [filteredDeals, stages])

  // Conversion funnel data
  const conversionData = useMemo(() => {
    const totalDeals = filteredDeals.length
    if (totalDeals === 0) return []

    const submittedToLender = filteredDeals.filter(
      (d) =>
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
        name: 'Sent to Lender',
        count: submittedToLender,
        percentage: Math.round((submittedToLender / totalDeals) * 100),
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

  // Vendor activity data
  const vendorActivityData = useMemo(() => {
    return vendors.map((vendor) => {
      const vendorDeals = filteredDeals.filter(
        (d) => d.vendor.id === vendor.id
      )
      const fundedDeals = vendorDeals.filter((d) =>
        d.stage.name.toLowerCase().includes('funded')
      )
      const activeDeals = vendorDeals.filter(
        (d) =>
          !d.stage.name.toLowerCase().includes('funded') &&
          !d.stage.name.toLowerCase().includes('declined')
      )

      const lastDeal = vendorDeals[0]

      return {
        id: vendor.id,
        company_name: vendor.company_name,
        total_deals: vendorDeals.length,
        active_deals: activeDeals.length,
        funded_deals: fundedDeals.length,
        total_volume: vendorDeals.reduce(
          (sum, d) => sum + (d.amount_requested || 0),
          0
        ),
        last_activity: lastDeal?.created_at || null,
      }
    })
      .filter((v) => v.total_deals > 0)
      .sort((a, b) => b.total_volume - a.total_volume)
      .slice(0, 10)
  }, [vendors, filteredDeals])

  // Format activity log for display
  const formattedActivities = useMemo(() => {
    return activities.slice(0, 10).map((activity) => ({
      id: activity.id,
      action: activity.action,
      entity_type: activity.entity_type,
      created_at: activity.created_at,
      metadata: activity.metadata as {
        deal_name?: string
        vendor_name?: string
        stage_name?: string
        amount?: number
      } | undefined,
    }))
  }, [activities])

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">
            Track your deal pipeline and vendor performance
          </p>
        </div>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Deals"
          value={metrics.totalDeals}
          icon={FileText}
          description="deals submitted"
        />
        <StatCard
          title="Funded Deals"
          value={metrics.fundedDeals}
          icon={CheckCircle}
          description={`${metrics.conversionRate}% conversion`}
        />
        <StatCard
          title="Total Volume"
          value={formatCurrency(metrics.totalVolume)}
          icon={DollarSign}
          description="requested"
        />
        <StatCard
          title="Funded Volume"
          value={formatCurrency(metrics.fundedVolume)}
          icon={TrendingUp}
          description="closed"
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
          title="Active Vendors"
          value={metrics.activeVendors}
          icon={Users}
          description="submitting deals"
        />
        <StatCard
          title="Avg Deal Size"
          value={formatCurrency(metrics.avgDealSize)}
          icon={DollarSign}
          description="per deal"
        />
        <StatCard
          title="Declined"
          value={metrics.declinedDeals}
          description="deals declined"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DealVolumeChart data={dealVolumeData} />
        <FundingAmountChart data={fundingAmountData} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PipelineChart data={pipelineData} />
        <ConversionChart stages={conversionData} />
      </div>

      {/* Vendor Activity & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VendorActivityTable vendors={vendorActivityData} />
        </div>
        <div>
          <RecentActivity activities={formattedActivities} />
        </div>
      </div>
    </div>
  )
}
