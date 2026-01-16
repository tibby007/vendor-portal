'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, GripVertical, Building2, DollarSign, Calendar } from 'lucide-react'
import Link from 'next/link'
import type { KanbanStage, Deal, Vendor } from '@/types/database'

interface DealWithVendor extends Deal {
  vendor: Pick<Vendor, 'company_name'>
}

interface StageWithDeals extends KanbanStage {
  deals: DealWithVendor[]
}

interface KanbanBoardProps {
  brokerId: string
  initialStages: StageWithDeals[]
}

export function KanbanBoard({ brokerId, initialStages }: KanbanBoardProps) {
  const [stages, setStages] = useState<StageWithDeals[]>(initialStages)
  const [draggedDeal, setDraggedDeal] = useState<DealWithVendor | null>(null)
  const [dragOverStage, setDragOverStage] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const supabase = createClient()

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('deals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deals',
          filter: `broker_id=eq.${brokerId}`,
        },
        async () => {
          // Refetch stages when deals change
          const { data } = await supabase
            .from('kanban_stages')
            .select(`
              *,
              deals:deals(
                *,
                vendor:vendors(company_name)
              )
            `)
            .eq('broker_id', brokerId)
            .order('position', { ascending: true })

          if (data) {
            setStages(data as unknown as StageWithDeals[])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [brokerId, supabase])

  const handleDragStart = (e: React.DragEvent, deal: DealWithVendor) => {
    setDraggedDeal(deal)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    setDragOverStage(stageId)
  }

  const handleDragLeave = () => {
    setDragOverStage(null)
  }

  const handleDrop = async (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault()
    setDragOverStage(null)

    if (!draggedDeal || draggedDeal.stage_id === targetStageId) {
      setDraggedDeal(null)
      return
    }

    setUpdating(draggedDeal.id)

    // Optimistic update
    setStages((prevStages) => {
      return prevStages.map((stage) => {
        if (stage.id === draggedDeal.stage_id) {
          return {
            ...stage,
            deals: stage.deals.filter((d) => d.id !== draggedDeal.id),
          }
        }
        if (stage.id === targetStageId) {
          return {
            ...stage,
            deals: [...stage.deals, { ...draggedDeal, stage_id: targetStageId }],
          }
        }
        return stage
      })
    })

    // Update in database
    const { error } = await supabase
      .from('deals')
      .update({ stage_id: targetStageId })
      .eq('id', draggedDeal.id)

    if (error) {
      console.error('Failed to update deal stage:', error)
      // Revert on error
      setStages(initialStages)
    }

    setDraggedDeal(null)
    setUpdating(null)
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const getStageColor = (stageName: string) => {
    const colors: Record<string, string> = {
      'New Submission': 'bg-blue-500',
      'Under Review': 'bg-yellow-500',
      'Docs Needed': 'bg-orange-500',
      'Submitted to Lender': 'bg-purple-500',
      'Approved': 'bg-green-500',
      'Docs Out': 'bg-teal-500',
      'Funded': 'bg-emerald-600',
      'Declined': 'bg-red-500',
      'On Hold': 'bg-gray-500',
    }
    return colors[stageName] || 'bg-gray-400'
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-200px)]">
      {stages.map((stage) => (
        <div
          key={stage.id}
          className={`flex-shrink-0 w-80 bg-gray-100 rounded-lg transition-colors ${
            dragOverStage === stage.id ? 'bg-blue-50 ring-2 ring-blue-400' : ''
          }`}
          onDragOver={(e) => handleDragOver(e, stage.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, stage.id)}
        >
          {/* Stage Header */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStageColor(stage.name)}`} />
                <h3 className="font-semibold text-gray-900">{stage.name}</h3>
              </div>
              <Badge variant="secondary" className="text-xs">
                {stage.deals.length}
              </Badge>
            </div>
          </div>

          {/* Deals List */}
          <div className="p-2 space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
            {stage.deals.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">
                No deals in this stage
              </div>
            ) : (
              stage.deals.map((deal) => (
                <Card
                  key={deal.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, deal)}
                  className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
                    updating === deal.id ? 'opacity-50' : ''
                  } ${draggedDeal?.id === deal.id ? 'opacity-50 ring-2 ring-blue-400' : ''}`}
                >
                  <CardHeader className="p-3 pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <CardTitle className="text-sm font-medium">
                          {deal.business_legal_name}
                        </CardTitle>
                      </div>
                      {updating === deal.id && (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Building2 className="h-3 w-3" />
                      <span className="truncate">{deal.vendor?.company_name}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-gray-500">
                        <DollarSign className="h-3 w-3" />
                        <span>{formatCurrency(deal.amount_requested as unknown as number)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(deal.created_at)}</span>
                      </div>
                    </div>
                    <Link href={`/dashboard/deals/${deal.id}`}>
                      <Button variant="ghost" size="sm" className="w-full mt-2 text-xs h-7">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
