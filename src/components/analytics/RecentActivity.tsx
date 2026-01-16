'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FileText,
  DollarSign,
  UserPlus,
  MessageSquare,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react'

interface ActivityItem {
  id: string
  action: string
  entity_type: string
  created_at: string
  metadata?: {
    deal_name?: string
    vendor_name?: string
    stage_name?: string
    amount?: number
    [key: string]: unknown
  }
}

interface RecentActivityProps {
  activities: ActivityItem[]
  title?: string
  description?: string
}

const getActivityIcon = (action: string, entityType: string) => {
  if (entityType === 'deal') {
    switch (action) {
      case 'created':
        return <FileText className="h-4 w-4 text-blue-600" />
      case 'funded':
        return <DollarSign className="h-4 w-4 text-green-600" />
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'stage_changed':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }
  if (entityType === 'vendor') {
    return <UserPlus className="h-4 w-4 text-purple-600" />
  }
  if (entityType === 'message') {
    return <MessageSquare className="h-4 w-4 text-blue-600" />
  }
  if (entityType === 'document') {
    return <Upload className="h-4 w-4 text-orange-600" />
  }
  return <FileText className="h-4 w-4 text-gray-600" />
}

const getActivityMessage = (activity: ActivityItem) => {
  const { action, entity_type, metadata } = activity

  if (entity_type === 'deal') {
    const dealName = metadata?.deal_name || 'A deal'
    switch (action) {
      case 'created':
        return `${dealName} was submitted`
      case 'funded':
        return `${dealName} was funded`
      case 'approved':
        return `${dealName} was approved`
      case 'declined':
        return `${dealName} was declined`
      case 'stage_changed':
        return `${dealName} moved to ${metadata?.stage_name || 'new stage'}`
      default:
        return `${dealName} was updated`
    }
  }
  if (entity_type === 'vendor') {
    return `${metadata?.vendor_name || 'A vendor'} joined`
  }
  if (entity_type === 'message') {
    return 'New message received'
  }
  if (entity_type === 'document') {
    return 'Document uploaded'
  }
  return 'Activity recorded'
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export function RecentActivity({
  activities,
  title = 'Recent Activity',
  description = 'Latest updates across your portal',
}: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className={`flex items-start gap-3 ${
                  index < activities.length - 1 ? 'pb-4 border-b border-gray-100' : ''
                }`}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  {getActivityIcon(activity.action, activity.entity_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    {getActivityMessage(activity)}
                  </p>
                  {activity.metadata?.amount && (
                    <p className="text-sm font-medium text-green-600">
                      ${activity.metadata.amount.toLocaleString()}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatTime(activity.created_at)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No recent activity
          </div>
        )}
      </CardContent>
    </Card>
  )
}
