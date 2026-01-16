'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface Stage {
  id: string
  name: string
  position: number
}

interface DealStageSelectorProps {
  dealId: string
  currentStageId: string
  stages: Stage[]
}

export function DealStageSelector({ dealId, currentStageId, stages }: DealStageSelectorProps) {
  const [updating, setUpdating] = useState(false)
  const [selectedStageId, setSelectedStageId] = useState(currentStageId)
  const router = useRouter()
  const supabase = createClient()

  const handleStageChange = async (newStageId: string) => {
    if (newStageId === selectedStageId) return

    setUpdating(true)
    setSelectedStageId(newStageId)

    const { error } = await supabase
      .from('deals')
      .update({ stage_id: newStageId })
      .eq('id', dealId)

    if (error) {
      console.error('Failed to update stage:', error)
      setSelectedStageId(currentStageId) // Revert on error
    } else {
      router.refresh()
    }

    setUpdating(false)
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

  const currentStage = stages.find((s) => s.id === selectedStageId)

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedStageId} onValueChange={handleStageChange} disabled={updating}>
        <SelectTrigger className="w-[200px]">
          <div className="flex items-center gap-2">
            {updating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <div className={`w-3 h-3 rounded-full ${getStageColor(currentStage?.name || '')}`} />
            )}
            <SelectValue placeholder="Select stage" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {stages.map((stage) => (
            <SelectItem key={stage.id} value={stage.id}>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStageColor(stage.name)}`} />
                {stage.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
